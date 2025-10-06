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
    // Await params if needed (fix for Next.js dynamic API routes)
    const { id } = typeof context.params.then === "function" ? await context.params : context.params
    const isAdmin = session.user.role === "admin"
    const isAssigned = await prisma.projectUser.findFirst({
      where: { projectId: id, userId: session.user.id }
    })
    if (!isAdmin && !isAssigned) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const photos = await prisma.projectPhoto.findMany({
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

    return NextResponse.json(photos)
  } catch (error) {
    console.error("Error fetching photos:", error)
    return NextResponse.json(
      { error: "Failed to fetch photos" },
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
    // Await params if needed (fix for Next.js dynamic API routes)
    const { id } = typeof context.params.then === "function" ? await context.params : context.params
    const isAdmin = session.user.role === "admin"
    const isAssigned = await prisma.projectUser.findFirst({
      where: { projectId: id, userId: session.user.id }
    })
    if (!isAdmin && !isAssigned) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const formData = await request.formData()
    const files = formData.getAll('photos') as File[]
    const milestoneId = formData.get('milestoneId') as string
    const description = formData.get('description') as string
    const lat = formData.get('lat') ? parseFloat(formData.get('lat') as string) : undefined
    const lng = formData.get('lng') ? parseFloat(formData.get('lng') as string) : undefined
    const checklistItemId = formData.get('checklistItemId') as string | undefined

    // Validate files
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const invalidFile = files.find(file => !validTypes.includes(file.type))
    if (invalidFile) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG and WebP are allowed" },
        { status: 400 }
      )
    }

    // Upload files to S3 and create database records
    const photos = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileName = `projects/${id}/photos/${Date.now()}-${file.name}`
        
        const url = await uploadToS3(buffer, fileName, file.type)
        
        return prisma.projectPhoto.create({
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
        action: ActivityActions.PHOTO_UPLOADED,
        details: `Uploaded ${files.length} photos to milestone`,
        milestoneId
      }
    })

    return NextResponse.json(photos)
  } catch (error) {
    console.error("Error uploading photos:", error)
    return NextResponse.json(
      { error: "Failed to upload photos" },
      { status: 500 }
    )
  }
}