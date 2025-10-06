import { NextResponse } from "next/server"

// In a real application, this would connect to AWS S3 or similar storage
// This is a mock implementation for demonstration purposes

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const projectId = formData.get("projectId") as string
    const milestoneId = formData.get("milestoneId") as string
    const type = formData.get("type") as string // 'photo' or 'video'

    if (!file || !projectId || !milestoneId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"]
    const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime"]

    if (type === "photo" && !validImageTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid image format. Supported formats: JPEG, PNG, GIF" }, { status: 400 })
    }

    if (type === "video" && !validVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid video format. Supported formats: MP4, WebM, QuickTime" },
        { status: 400 },
      )
    }

    // In a real app, this would upload to S3 or similar storage
    // For demo, we'll simulate a successful upload

    // Generate a mock URL for the uploaded file
    const fileName = `${Date.now()}-${file.name}`
    const mockUrl = `https://storage.example.com/${projectId}/${milestoneId}/${type}s/${fileName}`

    // Log the upload in the audit trail
    // In a real app, this would be saved to a database

    return NextResponse.json({
      success: true,
      file: {
        id: Math.floor(Math.random() * 10000).toString(),
        url: mockUrl,
        name: file.name,
        type: file.type,
        size: file.size,
        projectId,
        milestoneId,
        uploadedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
