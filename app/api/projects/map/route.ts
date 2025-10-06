import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const ward = searchParams.get("ward")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    // Build base where clause
    let where: any = {
      ...(ward && ward !== "all" ? { wardId: ward } : {}),
      ...(status && status !== "all" ? { status } : {}),
      ...(type && type !== "all" ? { type } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { tenderId: { contains: search, mode: 'insensitive' } }
        ]
      } : {}),
      ...(from || to ? {
        AND: [
          ...(from ? [{ startDate: { gte: new Date(from) } }] : []),
          ...(to ? [{ startDate: { lte: new Date(to) } }] : [])
        ]
      } : {}),
      location: {
        isNot: null
      }
    }

    // If contractor, only show assigned projects
    if (session.user.role === "contractor") {
      where = {
        ...where,
        users: {
          some: {
            userId: session.user.id,
            role: "contractor"
          }
        }
      }
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        location: true,
        ward: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects for map:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}