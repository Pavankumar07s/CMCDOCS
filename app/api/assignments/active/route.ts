import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const activeAssignments = await prisma.assignment.findMany({
      where: {
        status: "active",
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        roadSegment: true,
        contractor: true,
      },
      orderBy: {
        startDate: "asc",
      },
    })

    // Parse geometry and convert to lat/lng format for Google Maps
    const formattedAssignments = activeAssignments.map((assignment) => {
      const geometry = JSON.parse(assignment.roadSegment.geometry)
      const path = geometry.coordinates.map((coord: [number, number]) => ({
        lat: coord[1],
        lng: coord[0],
      }))

      return {
        id: assignment.id,
        start_date: assignment.startDate,
        end_date: assignment.endDate,
        road_segment_name: assignment.roadSegment.name,
        contractor_name: assignment.contractor.name,
        geometry: path,
      }
    })

    return NextResponse.json(formattedAssignments)
  } catch (error) {
    console.error("Failed to fetch active assignments:", error)
    return NextResponse.json({ error: "Failed to fetch active assignments" }, { status: 500 })
  }
}
