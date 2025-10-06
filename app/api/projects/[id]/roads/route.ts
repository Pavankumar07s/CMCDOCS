import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params.id since it's a promise in App Router
    const projectId = await Promise.resolve(params.id);
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Enable PostGIS extension
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis`;

    const roads = await prisma.roadSegment.findMany({
      where: {
        projectId: projectId
      },
      include: {
        assignments: {
          where: {
            status: "active"
          },
          select: {
            status: true,
            startDate: true,
            endDate: true
          },
          take: 1
        }
      }
    });

    // Transform the data to include status
    const transformedRoads = roads.map(road => ({
      id: road.id,
      name: road.name,
      geometry: road.geometry,
      status: road.assignments[0] ? "active" : "completed",
      length: road.lengthMeters
    }));

    console.log(`Found ${transformedRoads.length} road segments for project ${projectId}`);
    return NextResponse.json({ roads: transformedRoads });

  } catch (error) {
    console.error("Failed to fetch project roads:", error);
    return NextResponse.json({ error: "Failed to fetch roads" }, { status: 500 });
  }
}