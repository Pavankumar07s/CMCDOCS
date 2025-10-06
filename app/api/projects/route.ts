import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"  
import { parseRoadData } from "@/lib/road-utils"

// In a real application, this would connect to a database
// This is a mock implementation for demonstration purposes

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const ward = searchParams.get("ward")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const budget = searchParams.get("budget")

    // For contractors, only return assigned projects
    let where: any = {}
    if (session.user.role === "contractor") {
      where = {
        users: {
          some: {
            userId: session.user.id,
            role: "contractor"
          }
        }
      }
    }

    // Apply filters
    if (ward && ward !== "all") {
      where.wardId = ward
    }

    if (status && status !== "all") {
      where.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    }

    if (type && type !== "all") {
      where.type = type
    }

    if (budget && budget !== "all") {
      if (budget === "low") {
        where.budget = { lt: 10000000 }
      } else if (budget === "medium") {
        where.budget = { gte: 10000000, lt: 20000000 }
      } else if (budget === "high") {
        where.budget = { gte: 20000000 }
      }
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        ward: true,
        location: true,
        users: true,
      },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["admin", "manager"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { name, description, wardId, budget, roadSegments, assignments } = data

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        wardId,
        budget,
        status: "planning",
        type: "new", // Default type
        tenderId: `TND-${Date.now()}`, // Generate a unique tender ID
        users: {
          create: {
            userId: session.user.id,
            role: "manager"
          }
        }
      }
    })

    // Link road segments to project
    if (roadSegments?.length > 0) {
      await Promise.all(
        roadSegments.map((segmentId: number) =>
          prisma.$executeRaw`UPDATE road_segments SET project_id = ${project.id} WHERE id = ${segmentId}`
        )
      )
    }

    // Create assignments if provided
    if (assignments?.length > 0) {
      await prisma.$transaction(
        assignments.map((assignment: any) =>
          prisma.$executeRaw`
            INSERT INTO assignments (road_segment_id, contractor_id, start_date, end_date, status)
            VALUES (${assignment.roadSegmentId}, ${assignment.contractorId}, ${assignment.startDate}, ${assignment.endDate}, 'active')
          `
        )
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

