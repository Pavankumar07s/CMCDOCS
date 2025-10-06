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
    const timestamp = searchParams.get("since")
    const since = timestamp ? new Date(parseInt(timestamp)) : new Date(0)

    const newLogs = await prisma.activity.findMany({
      where: { 
        projectId: context.params.id,
        createdAt: {
          gt: since
        }
      },
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
      }
    })

    return NextResponse.json({
      logs: newLogs,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error("Error polling audit logs:", error)
    return NextResponse.json(
      { error: "Failed to poll audit logs" },
      { status: 500 }
    )
  }
}