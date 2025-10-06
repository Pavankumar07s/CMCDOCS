import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const tenders = await prisma.project.findMany({
    select: {
      id: true,
      tenderId: true,
      name: true,
      status: true,
      budget: true,
    },
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json({ tenders })
}
