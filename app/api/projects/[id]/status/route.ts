import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../../auth/[...nextauth]/route"

export async function PATCH(
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

    const { status } = await request.json()

    const project = await prisma.project.update({
      where: { id: params.id },
      data: { 
        status,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error updating project status:", error)
    return NextResponse.json(
      { error: "Failed to update project status" },
      { status: 500 }
    )
  }
}