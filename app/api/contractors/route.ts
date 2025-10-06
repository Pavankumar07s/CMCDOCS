import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const contractors = await prisma.user.findMany({
      where: {
        role: "contractor",
        status: "active"
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(contractors)
  } catch (error) {
    console.error("Failed to fetch contractors:", error)
    return NextResponse.json({ error: "Failed to fetch contractors" }, { status: 500 })
  }
}
