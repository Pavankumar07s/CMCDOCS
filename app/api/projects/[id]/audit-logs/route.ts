import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Allow admin or assigned users (including contractor) to view
    const isAdmin = session.user.role === "admin"
    const isAssigned = await prisma.projectUser.findFirst({
      where: { projectId: context.params.id, userId: session.user.id }
    })
    if (!isAdmin && !isAssigned) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20

    const logs = await prisma.activity.findMany({
      where: { projectId: context.params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        milestone: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip: (page - 1) * limit,
      take: limit + 1
    })

    const hasMore = logs.length > limit
    const paginatedLogs = hasMore ? logs.slice(0, -1) : logs

    return NextResponse.json({
      logs: paginatedLogs,
      hasMore
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
}