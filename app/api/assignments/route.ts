import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

interface LatLng {
  lat: number
  lng: number
}

export async function GET() {
  try {
    // Enable PostGIS
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis`;

    const assignments = await prisma.$queryRaw`
      SELECT 
        a.id,
        a.start_date,
        a.end_date,
        a.status,
        a.notes,
        rs.name as road_segment_name,
        rs.length_meters,
        u.name as contractor_name,
        rs.geometry
      FROM assignments a
      JOIN road_segments rs ON a.road_segment_id = rs.id
      JOIN "User" u ON a.user_id = u.id
      WHERE u.role = 'contractor'
      ORDER BY a.created_at DESC
    `

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Failed to fetch assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      roadSegmentName,
      geometry,
      startLat,
      startLng,
      endLat,
      endLng,
      length,
      userId,
      startDate,
      endDate,
      notes,
      description,
      projectId,
      projectName,
      wardId,
      budget,
      projectType,
      expectedCompletion
    } = await request.json()

    // Log received data for debugging
    console.log("Received assignment data:", {
      roadSegmentName,
      geometry: geometry ? "present" : "missing",
      userId,
      startDate,
      endDate,
      projectId,
      wardId,
      budget,
      projectName,
      projectType
    })

    // Validate required project fields
    if (!projectName || !wardId || !budget || !projectType) {
      return NextResponse.json({ 
        error: "Missing required project fields",
        details: {
          projectName: !projectName,
          wardId: !wardId,
          budget: !budget,
          projectType: !projectType
        }
      }, { status: 400 })
    }

    // Validate required assignment fields
    if (!roadSegmentName || !geometry || !userId || !startDate || !endDate) {
      return NextResponse.json({ 
        error: "Missing required assignment fields",
        details: {
          roadSegmentName: !roadSegmentName,
          geometry: !geometry,
          userId: !userId,
          startDate: !startDate,
          endDate: !endDate
        }
      }, { status: 400 })
    }

    // Enable PostGIS
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis`;

    // Handle multiple disconnected paths or single path
    const paths = Array.isArray(geometry[0]) ? geometry : [geometry];
    
    // Convert each path to a LineString
    const lineStrings = paths.map((path: LatLng[]) => {
      const points = path.map((point: LatLng) => `${point.lng} ${point.lat}`).join(",");
      return `LINESTRING(${points})`;
    });

    // Create a MULTI LINESTRING if we have multiple paths
    const geometryString = lineStrings.length > 1 
      ? `MULTILINESTRING(${lineStrings.map((ls: string) => `(${ls.slice(11, -1)})`).join(',')})`
      : lineStrings[0];

    // Check for conflicts using ST_Union for multiple segments
    const conflicts = await prisma.$queryRaw`
      WITH new_geom AS (
        SELECT ST_GeomFromText(${geometryString}) as geom
      )
      SELECT 
        a.id,
        rs.name as road_segment_name,
        u.name as contractor_name,
        a.start_date,
        a.end_date,
        ST_Length(ST_Intersection(ST_GeomFromText(rs.geometry), new_geom.geom)::geography) as overlap_length_meters,
        ST_Length(ST_GeomFromText(rs.geometry)::geography) as total_segment_length_meters
      FROM assignments a
      JOIN road_segments rs ON a.road_segment_id = rs.id
      JOIN "User" u ON a.user_id = u.id AND u.role = 'contractor'
      CROSS JOIN new_geom
      WHERE ST_Intersects(ST_GeomFromText(rs.geometry), new_geom.geom)
        AND a.status = 'active'
        AND daterange(${startDate}::date, ${endDate}::date, '[]') && 
            daterange(a.start_date, a.end_date, '[]')
    `

    if ((conflicts as any[]).length > 0) {
      return NextResponse.json({
        error: "Assignment overlaps with existing active assignments",
        conflicts
      }, { status: 409 })
    }

    // Get or create default ward
    let ward = await prisma.ward.findFirst({
      where: { number: 1 }
    })

    if (!ward) {
      ward = await prisma.ward.create({
        data: {
          name: "Default Ward",
          number: 1,
          description: "Default ward for new projects"
        }
      })
    }

    // Create new project with the provided details
    const project = await prisma.project.create({
      data: {
        name: projectName,
        tenderId: `TND-${Date.now()}`,
        status: 'planning',
        type: projectType,
        description: description || null,
        budget: parseFloat(budget.toString()),
        wardId: wardId,
        startDate: startDate ? new Date(startDate) : null,
        expectedCompletion: expectedCompletion ? new Date(expectedCompletion) : null,
        users: {
          create: {
            userId: userId,
            role: 'contractor'
          }
        }
      }
    })

    // Create road segment connected to the new project
    const roadSegment = await prisma.roadSegment.create({
      data: {
        name: roadSegmentName,
        geometry: geometryString,
        startLat: new Decimal(startLat),
        startLng: new Decimal(startLng),
        endLat: new Decimal(endLat),
        endLng: new Decimal(endLng),
        lengthMeters: new Decimal(length),
        project: {
          connect: { id: project.id }
        }
      }
    })

    // Create assignment with the new project ID
    const assignment = await prisma.assignment.create({
      data: {
        roadSegmentId: roadSegment.id,
        userId,
        projectId: project.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes: notes || null,
        status: "active"
      }
    })

    return NextResponse.json({
      success: true,
      roadSegmentId: roadSegment.id,
      assignmentId: assignment.id
    })

  } catch (error) {
    console.error("Failed to create assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}
