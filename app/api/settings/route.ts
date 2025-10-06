import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const settings = await prisma.systemSettings.findMany()
  return NextResponse.json({ settings })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json()
  // body: { key: string, value: string }
  await prisma.systemSettings.upsert({
    where: { key: body.key },
    update: { value: body.value, updatedBy: session.user.id },
    create: { key: body.key, value: body.value, updatedBy: session.user.id }
  })
  return NextResponse.json({ success: true })
}
