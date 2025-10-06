import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const status = searchParams.get("status")
    const ward = searchParams.get("ward")
    const type = searchParams.get("type")
    const budget = searchParams.get("budget")

    const whereClause: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { tenderId: { contains: query, mode: "insensitive" } },
      ],
    }

    if (status && status !== "all") {
      whereClause.status = status
    }

    if (ward && ward !== "all") {
      whereClause.wardId = ward
    }

    if (type && type !== "all") {
      whereClause.type = type
    }

    if (budget && budget !== "all") {
      switch (budget) {
        case "low":
          whereClause.budget = { lt: 10000000 }
          break
        case "medium":
          whereClause.AND = [
            { budget: { gte: 10000000 } },
            { budget: { lt: 20000000 } },
          ]
          break
        case "high":
          whereClause.budget = { gte: 20000000 }
          break
      }
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        ward: true,
        milestones: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}