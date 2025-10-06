import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../auth/[...nextauth]/route"

// In a real application, this would connect to a database
// This is a mock implementation for demonstration purposes

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Allow admin or assigned users (including contractor) to view
    const isAdmin = session.user.role === "admin"
    const projectId = await Promise.resolve(params.id);
    const isAssigned = await prisma.projectUser.findFirst({
      where: { projectId: projectId, userId: session.user.id }
    })
    if (!isAdmin && !isAssigned) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        ward: true,
        location: true,
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()

    // Check if user is admin or assigned to this project
    const projectUser = await prisma.projectUser.findFirst({
      where: {
        projectId: id,
        userId: session.user.id,
      }
    })
    const isAdmin = session.user.role === "admin"
    if (!isAdmin && !projectUser) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // In a real app, this would update the database
    // For demo, we'll just return the updated project

    return NextResponse.json({
      project: {
        id,
        ...body,
        updatedAt: new Date().toISOString(),
      },
      message: "Project updated successfully",
    })
  } catch (error) {
    console.error(`Error updating project ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if user is admin or assigned to this project
    const projectUser = await prisma.projectUser.findFirst({
      where: {
        projectId: params.id,
        userId: session.user.id,
      }
    })
    const isAdmin = session.user.role === "admin"
    if (!isAdmin && !projectUser) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Delete related records to avoid foreign key constraint errors
    // Order: ProjectUser, Milestone (and its ChecklistItem), ProjectPhoto, ProjectVideo, Upload, Activity, Approval, Feedback, Report, ProjectVersion, Location

    // Delete ChecklistItems via Milestones
    const milestones = await prisma.milestone.findMany({
      where: { projectId: params.id },
      select: { id: true }
    })
    const milestoneIds = milestones.map(m => m.id)
    if (milestoneIds.length > 0) {
      await prisma.checklistItem.deleteMany({
        where: { milestoneId: { in: milestoneIds } }
      })
    }

    // Delete ProjectPhoto and ProjectVideo
    await prisma.projectPhoto.deleteMany({
      where: { projectId: params.id }
    })
    await prisma.projectVideo.deleteMany({
      where: { projectId: params.id }
    })

    // Delete Uploads
    await prisma.upload.deleteMany({
      where: { projectId: params.id }
    })

    // Delete Activities
    await prisma.activity.deleteMany({
      where: { projectId: params.id }
    })

    // Delete Approvals
    await prisma.approval.deleteMany({
      where: { projectId: params.id }
    })

    // Delete Feedback
    await prisma.feedback.deleteMany({
      where: { projectId: params.id }
    })

    // Delete Reports
    await prisma.report.deleteMany({
      where: { projectId: params.id }
    })

    // Delete ProjectVersions
    await prisma.projectVersion.deleteMany({
      where: { projectId: params.id }
    })

    // Delete ProjectUser
    await prisma.projectUser.deleteMany({
      where: { projectId: params.id }
    })

    // Delete Milestones (after checklist items and uploads)
    await prisma.milestone.deleteMany({
      where: { projectId: params.id }
    })

    // Delete Location
    await prisma.location.deleteMany({
      where: { projectId: params.id }
    })

    // Finally, delete the project
    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}

// No changes needed for real DB, just ensure you return up-to-date fields.
