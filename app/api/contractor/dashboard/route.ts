import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "contractor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get contractor's projects
    const projects = await prisma.project.findMany({
      where: {
        users: {
          some: {
            userId: session.user.id,
            role: "contractor"
          }
        }
      },
      include: {
        ward: true,
      }
    })

    // Calculate metrics
    const activeProjects = projects.filter(p => p.status.toLowerCase() === "in progress").length
    const totalLength = projects.reduce((sum, p) => sum + (p.roadLength || 0), 0)
    const completionRate = projects.length ?
      Math.round(projects.reduce((sum, p) => sum + (p.completion || 0), 0) / projects.length) : 0
    const wardsCovered = new Set(projects.map(p => p.ward.id)).size

    // Calculate project status distribution
    const statusCounts = projects.reduce((acc, project) => {
      const status = project.status.toLowerCase()
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      metrics: {
        activeProjects,
        totalLength: Number((totalLength / 1000).toFixed(2)), // Convert to km
        completionRate,
        wardsCovered
      },
      projectStatus: Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count
      })),
      systemHealth: {
        uptime: 100,
        responseTime: 250,
        errorRate: 0.1
      }
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
