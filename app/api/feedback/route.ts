import { NextResponse } from "next/server"

// In a real application, this would connect to a database
// This is a mock implementation for demonstration purposes

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.subject || !body.message || !body.projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real app, this would save the feedback to a database
    // and potentially send notifications to relevant stakeholders

    // Mock response
    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: {
        id: Math.floor(Math.random() * 1000).toString(),
        ...body,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // In a real app, this would fetch feedback from a database
    // filtered by the user ID if provided

    // Mock data
    const feedback = [
      {
        id: "1",
        subject: "Drainage Issue in Sector 7",
        message:
          "The drainage system installed in Sector 7 is not functioning properly during heavy rain. Water is accumulating on the road surface.",
        projectId: "1234",
        projectName: "Sector 7 Main Road Reconstruction",
        userId: "user123",
        userName: "Contractor A",
        status: "pending",
        createdAt: "2024-04-10T09:30:00Z",
        response: null,
      },
      {
        id: "2",
        subject: "Quality Concern for Asphalt",
        message:
          "The quality of asphalt used in the Railway Road project seems below specification. There are already small cracks appearing.",
        projectId: "1238",
        projectName: "Railway Road Widening",
        userId: "user123",
        userName: "Contractor A",
        status: "in-review",
        createdAt: "2024-04-05T14:15:00Z",
        response: null,
      },
      {
        id: "3",
        subject: "Timeline Extension Request",
        message:
          "Due to unexpected underground utility work, we request a 2-week extension for the Mahesh Nagar Road project.",
        projectId: "1236",
        projectName: "Mahesh Nagar Road Resurfacing",
        userId: "user123",
        userName: "Contractor A",
        status: "resolved",
        createdAt: "2024-03-20T11:45:00Z",
        response: "Extension approved. Please update the project timeline accordingly.",
        respondedAt: "2024-03-22T10:30:00Z",
        respondedBy: "Admin User",
      },
    ]

    // Filter by user ID if provided
    if (userId) {
      return NextResponse.json({
        feedback: feedback.filter((item) => item.userId === userId),
      })
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}
