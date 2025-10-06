import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const roads = await prisma.roadSegment.findMany({
      include: {
        assignments: {
          include: {
            user: true
          }
        },
        project: true
      }
    })

    return NextResponse.json({ roads })
  } catch (error) {
    console.error("Failed to fetch roads:", error)
    return NextResponse.json({ error: "Failed to fetch roads" }, { status: 500 })
  }
}