import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const wards = await prisma.ward.findMany({
      orderBy: { number: 'asc' }
    })
    return NextResponse.json(wards)
  } catch (error) {
    console.error("Failed to fetch wards:", error)
    return NextResponse.json({ error: "Failed to fetch wards" }, { status: 500 })
  }
}