import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const wardId = searchParams.get("wardId")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    // Add role-based filtering
    const userRole = session.user.role
    let additionalWhere = {}
    
    if (userRole === 'contractor') {
      // Contractors can only see their assigned roads
      additionalWhere = {
        roadSegments: {
          some: {
            assignments: {
              some: {
                userId: session.user.id,
                status: 'active'
              }
            }
          }
        }
      }
    }

    // Build where clause based on filters
    const where: any = {
      ...additionalWhere
    }
    
    if (wardId && wardId !== "all") where.wardId = wardId
    if (status && status !== "all") where.status = status
    if (type && type !== "all") where.type = type
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { tenderId: { contains: search, mode: "insensitive" } }
      ]
    }
    if (from || to) {
      where.startDate = {}
      if (from) where.startDate.gte = new Date(from)
      if (to) where.startDate.lte = new Date(to)
    }

    // Enable PostGIS
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis`

    // Fetch projects with their road segments
    const projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        tenderId: true,
        status: true,
        type: true,
        ward: {
          select: {
            id: true,
            name: true,
            number: true
          }
        },
        roadSegments: {
          select: {
            id: true,
            name: true,
            geometry: true,
            lengthMeters: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${projects.length} projects with road segments`)

    // Transform the data
    const transformedProjects = projects
      .filter(project => project.roadSegments.length > 0) // Only include projects with road segments
      .map(project => ({
        ...project,
        roadSegments: project.roadSegments.map(segment => ({
          id: segment.id,
          name: segment.name,
          geometry: segment.geometry,
          status: "completed", // Default all to completed for now
          length: Number(segment.lengthMeters)
        }))
      }))

    console.log(`Returning ${transformedProjects.length} projects with road data`)
    return NextResponse.json({ 
      projects: transformedProjects,
      total: transformedProjects.length
    })

  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}