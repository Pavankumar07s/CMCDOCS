import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { ActivityActions } from "@/lib/constants"
import { uploadToS3 } from "@/lib/s3"

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Await params if needed
    const { id } = typeof context.params.then === "function" ? await context.params : context.params
    const isAdmin = session.user.role === "admin"
    const isAssigned = await prisma.projectUser.findFirst({
      where: { projectId: id, userId: session.user.id }
    })
    if (!isAdmin && !isAssigned) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const videos = await prisma.projectVideo.findMany({
      where: { 
        projectId: id,
        ...(request.url.includes("milestoneId=") && {
          milestoneId: new URL(request.url).searchParams.get("milestoneId") || undefined
        }),
        ...(request.url.includes("checklistItemId=") && {
          checklistItemId: new URL(request.url).searchParams.get("checklistItemId") || undefined
        })
      },
      include: {
        milestone: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = typeof context.params.then === "function" ? await context.params : context.params
    // Allow admin or assigned users (including contractor) to upload
    const isAdmin = session.user.role === "admin"
    const isAssigned = await prisma.projectUser.findFirst({
      where: { projectId: id, userId: session.user.id }
    })
    if (!isAdmin && !isAssigned) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const formData = await request.formData()
    const files = formData.getAll('videos') as File[]
    const milestoneId = formData.get('milestoneId') as string
    const description = formData.get('description') as string
    const lat = formData.get('lat') ? parseFloat(formData.get('lat') as string) : undefined
    const lng = formData.get('lng') ? parseFloat(formData.get('lng') as string) : undefined
    const checklistItemId = formData.get('checklistItemId') as string | undefined

    // Validate files
    const validTypes = ['video/mp4', 'video/webm']
    const maxSize = 100 * 1024 * 1024 // 100MB
    
    const invalidFile = files.find(file => 
      !validTypes.includes(file.type) || file.size > maxSize
    )
    
    if (invalidFile) {
      return NextResponse.json(
        { error: "Invalid file. Videos must be MP4 or WebM and under 100MB" },
        { status: 400 }
      )
    }

    // Upload files to S3 and create database records
    const videos = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileName = `projects/${id}/videos/${Date.now()}-${file.name}`
        
        const url = await uploadToS3(buffer, fileName, file.type)
        
        return prisma.projectVideo.create({
          data: {
            url,
            fileName,
            description,
            milestoneId,
            projectId: id,
            uploadedBy: session.user.id,
            fileSize: file.size,
            fileType: file.type,
            lat,
            lng,
            ...(checklistItemId ? { checklistItemId } : {})
          }
        })
      })
    )

    // Create activity log entry
    await prisma.activity.create({
      data: {
        projectId: id,
        userId: session.user.id,
        action: ActivityActions.VIDEO_UPLOADED,
        details: `Uploaded ${files.length} videos to milestone`,
        milestoneId
      }
    })

    // Notify all admins if contractor uploaded
    if (session.user.role === "contractor") {
      const admins = await prisma.user.findMany({ where: { role: "admin" } })
      await Promise.all(
        admins.map(admin =>
          prisma.notification.create({
            data: {
              userId: admin.id,
              type: "video",
              title: "Video Uploaded",
              message: `Contractor uploaded video(s) for a checklist item. Please review and mark as completed if appropriate.`,
              projectId: id
            }
          })
        )
      )
    }

    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error uploading videos:", error)
    return NextResponse.json(
      { error: "Failed to upload videos" },
      { status: 500 }
    )
  }
}