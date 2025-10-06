import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { ActivityActions } from "@/lib/constants"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const projectId = await Promise.resolve(params.id);
    const milestones = await prisma.milestone.findMany({
      where: { projectId: projectId },
      include: {
        checklist: true
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json(milestones)
  } catch (error) {
    console.error("Error fetching milestones:", error)
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['admin', 'project_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, date, checklist } = body

    // Create the milestone with its checklist
    const milestone = await prisma.milestone.create({
      data: {
        name,
        description,
        date: date ? new Date(date) : null,
        status: "pending",
        projectId: params.id,
        checklist: {
          create: checklist.map((item: { name: string, amount?: number }) => ({
            name: item.name,
            amount: item.amount ?? 0,
            checked: false
          }))
        }
      },
      include: {
        checklist: true
      }
    })

    // Create audit log entry with the required 'action' field
    await prisma.activity.create({
      data: {
        projectId: params.id,
        userId: session.user.id,
        action: ActivityActions.MILESTONE_CREATED,
        details: `Created milestone: ${name}`,
        milestoneId: milestone.id
      }
    })

    // Notify all project users (except the actor) about the new milestone
    const projectUsers = await prisma.projectUser.findMany({
      where: { projectId: params.id },
      select: { userId: true }
    })
    const notifyUserIds = projectUsers
      .map(u => u.userId)
      .filter(uid => uid !== session.user.id)
    await Promise.all(
      notifyUserIds.map(uid =>
        prisma.notification.create({
          data: {
            userId: uid,
            type: "milestone",
            title: "New Milestone Created",
            message: `Milestone "${name}" was added to your project.`,
            projectId: params.id
          }
        })
      )
    )

    // Notify admin if not admin
    if (session.user.role === "contractor") {
      const admins = await prisma.user.findMany({ where: { role: "admin" } })
      await Promise.all(admins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: "system",
            title: "Milestone Updated",
            message: `Contractor updated milestone "${name}" on project.`,
          }
        })
      ))
    }

    // Update project's updatedAt timestamp
    await prisma.project.update({
      where: { id: params.id },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(milestone)
  } catch (error) {
    console.error("Error creating milestone:", error)
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    )
  }
}

// Example: To extend notifications for uploads, approvals, etc.,
// in their respective API routes, after the main DB action, add:

// await prisma.notification.create({
//   data: {
//     userId: <targetUserId>,
//     type: "photo" | "video" | "approval" | ...,
//     title: "Photo Uploaded" | "Approval Requested" | ...,
//     message: `A new photo was uploaded to project ...`,
//     projectId: <projectId>,
//   }
// })