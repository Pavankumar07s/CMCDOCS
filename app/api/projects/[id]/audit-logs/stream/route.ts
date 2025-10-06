import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Allow admin or assigned users (including contractor) to view
    const isAdmin = session.user.role === "admin"
    const isAssigned = await prisma.projectUser.findFirst({
      where: { projectId: context.params.id, userId: session.user.id }
    })
    if (!isAdmin && !isAssigned) {
      return new Response("Not authorized", { status: 403 })
    }

    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Initial connection message
    const connectMessage = encoder.encode(
      `data: ${JSON.stringify({ type: "connected" })}\n\n`
    )
    await writer.write(connectMessage)

    let lastEventId = request.headers.get("Last-Event-ID") || "0"
    let lastCheckTime = new Date(parseInt(lastEventId) || Date.now())

    const intervalId = setInterval(async () => {
      try {
        const activities = await prisma.activity.findMany({
          where: {
            projectId: context.params.id,
            createdAt: {
              gt: lastCheckTime
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

        for (const activity of activities) {
          const data = encoder.encode(`data: ${JSON.stringify(activity)}\n\n`)
          await writer.write(data)
          lastCheckTime = activity.createdAt
        }
      } catch (error) {
        console.error("Error fetching activities:", error)
        const errorMessage = encoder.encode(
          `data: ${JSON.stringify({ type: "error", message: "Failed to fetch activities" })}\n\n`
        )
        await writer.write(errorMessage)
      }
    }, 2000) // Poll every 2 seconds

    // Clean up on disconnect
    request.signal.addEventListener("abort", () => {
      clearInterval(intervalId)
      writer.close()
    })

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*"
      }
    })
  } catch (error) {
    console.error("Stream setup error:", error)
    return NextResponse.json(
      { error: "Failed to setup event stream" },
      { status: 500 }
    )
  }
}