import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../../../../../auth/[...nextauth]/route"

export async function PUT(
  request: Request,
  { params }: { params: { id: string, milestoneId: string, itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { checked } = body

    // Update checklist item
    await prisma.checklistItem.update({
      where: { id: params.itemId },
      data: { checked }
    })

    // Calculate milestone completion
    const milestone = await prisma.milestone.findUnique({
      where: { id: params.milestoneId },
      include: { checklist: true }
    })

    if (milestone) {
      const completedItems = milestone.checklist.filter(item => item.checked).length
      const totalItems = milestone.checklist.length
      const isCompleted = completedItems === totalItems && totalItems > 0

      // Update milestone status if all items are checked
      await prisma.milestone.update({
        where: { id: params.milestoneId },
        data: { 
          status: isCompleted ? "completed" : (completedItems > 0 ? "in_progress" : "pending")
        }
      })
    }

    // Calculate overall project completion and spent
    const allMilestones = await prisma.milestone.findMany({
      where: { projectId: params.id },
      include: { checklist: true }
    })

    // Calculate total checklist items and checked items
    const allChecklistItems = allMilestones.flatMap(m => m.checklist)
    const totalChecklist = allChecklistItems.length
    const totalCompleted = allChecklistItems.filter(i => i.checked).length

    // Calculate completion percentage
    const projectCompletion = totalChecklist > 0 ? Math.round((totalCompleted / totalChecklist) * 100) : 0

    // Calculate spent as sum of checked checklist item amounts
    const spent = allChecklistItems.filter(i => i.checked).reduce((sum, i) => sum + (i.amount || 0), 0)

    // Update project completion and spent
    await prisma.project.update({
      where: { id: params.id },
      data: { 
        completion: projectCompletion,
        spent
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating checklist item:", error)
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 }
    )
  }
}