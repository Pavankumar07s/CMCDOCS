
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

interface Point {
  lat: number
  lng: number
}

interface Conflict {
  id: number
  start_date: Date
  end_date: Date
  road_segment_name: string
  contractor_name: string
  geometry: string
  overlap_length_meters: string
  total_segment_length_meters: string
  new_segment_length_meters: string
}

export async function POST(request: NextRequest) {
  try {
    const { geometry, startDate, endDate, excludeAssignmentId } = await request.json()

    if (!geometry || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Handle both single path and multiple paths
    const paths: Point[][] = Array.isArray(geometry[0]) ? geometry : [geometry];
    
    // Create a MULTILINESTRING if we have multiple paths, or a LINESTRING if single path
    let lineString: string;
    try {
      // Validate each path has valid coordinates
      const validPaths = paths.map((path: Point[]) => {
        if (!Array.isArray(path) || path.length < 2) {
          throw new Error('Invalid path: Each path must have at least 2 points');
        }
        return path.map(point => {
          if (typeof point?.lat !== 'number' || typeof point?.lng !== 'number') {
            throw new Error('Invalid coordinates: Each point must have numeric lat and lng');
          }
          return `${point.lng} ${point.lat}`;
        }).join(',');
      });

      if (paths.length > 1) {
        // For multiple paths, create a MULTILINESTRING
        lineString = `MULTILINESTRING((${validPaths.join('),(')}))`;
      } else {
        // For single path, create a LINESTRING
        lineString = `LINESTRING(${validPaths[0]})`;
      }
      
      // Validate the geometry string
      if (lineString.includes('undefined') || lineString.includes('null')) {
        throw new Error('Invalid coordinates in geometry');
      }
      
      console.log('Generated geometry string:', lineString);
    } catch (error) {
      console.error('Error creating geometry string:', error);
      return NextResponse.json({ error: "Invalid geometry data" }, { status: 400 });
    }

    // Enable PostGIS if not already enabled
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis`;

    // Check for conflicts with existing assignments
    const conflicts = await prisma.$queryRaw(Prisma.sql`
      WITH new_geom AS (
        SELECT ST_GeomFromText(${lineString}, 4326) as geom
      ),
      -- Ensure proper geometry type casting and snapping
      processed_geom AS (
        SELECT 
          CASE 
            WHEN GeometryType(geom) = 'MULTILINESTRING' THEN geom
            ELSE ST_LineMerge(geom)::geometry(LineString, 4326)
          END as typed_geom,
          -- Add snapping tolerance of 1 meter (in degrees, roughly 1e-5)
          ST_SnapToGrid(
            CASE 
              WHEN GeometryType(geom) = 'MULTILINESTRING' THEN geom
              ELSE ST_LineMerge(geom)::geometry(LineString, 4326)
            END,
            0.00001
          ) as snapped_geom
        FROM new_geom
      ),
      active_segments AS (
        SELECT 
          a.id,
          a.start_date,
          a.end_date,
          rs.name,
          u.name as contractor_name,
          -- Convert stored text geometry to proper PostGIS geometry
          ST_GeomFromText(rs.geometry, 4326) as segment_geom
        FROM assignments a
        JOIN road_segments rs ON a.road_segment_id = rs.id
        JOIN "User" u ON a.user_id = u.id AND u.role = 'contractor'
        WHERE a.status = 'active'
        ${excludeAssignmentId ? Prisma.sql`AND a.id != ${excludeAssignmentId}` : Prisma.empty}
        AND daterange(${startDate}::date, ${endDate}::date, '[]') && 
            daterange(a.start_date, a.end_date, '[]')
      )
      SELECT 
        as2.id,
        as2.start_date,
        as2.end_date,
        as2.name as road_segment_name,
        as2.contractor_name,
        ST_AsGeoJSON(as2.segment_geom) as geometry,
        -- Calculate overlap using both raw and snapped geometries
        GREATEST(
          ST_Length(ST_Intersection(as2.segment_geom, pg.typed_geom)::geography),
          ST_Length(ST_Intersection(as2.segment_geom, pg.snapped_geom)::geography)
        ) as overlap_length_meters,
        ST_Length(as2.segment_geom::geography) as total_segment_length_meters,
        ST_Length(pg.typed_geom::geography) as new_segment_length_meters
      FROM active_segments as2
      CROSS JOIN processed_geom pg
      WHERE ST_DWithin(as2.segment_geom::geography, pg.typed_geom::geography, 1)
         OR ST_DWithin(as2.segment_geom::geography, pg.snapped_geom::geography, 1)
    `) as unknown as Conflict[];

    if (!conflicts.length) {
      return NextResponse.json({
        hasConflicts: false,
        conflicts: [],
      });
    }

    const formattedConflicts = conflicts.map((conflict) => ({
      ...conflict,
      geometry: JSON.parse(conflict.geometry as string),
      overlap_length_meters: Math.round(Number(conflict.overlap_length_meters)),
      total_segment_length_meters: Math.round(Number(conflict.total_segment_length_meters)),
      new_segment_length_meters: Math.round(Number(conflict.new_segment_length_meters)),
      overlap_percentage: Math.round(
        (Number(conflict.overlap_length_meters) / Number(conflict.total_segment_length_meters)) * 100,
      ),
      project_type: conflict.road_segment_name.toLowerCase().includes("maintenance")
        ? "Maintenance Work"
        : conflict.road_segment_name.toLowerCase().includes("construction")
          ? "Construction Project"
          : "Road Project",
    }))

    return NextResponse.json({
      hasConflicts: formattedConflicts.length > 0,
      conflicts: formattedConflicts,
    })
  } catch (error) {
    console.error("Failed to check conflicts:", error)
    return NextResponse.json({ error: "Failed to check conflicts" }, { status: 500 })
  }
}
