import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../auth/[...nextauth]/route"
import { hash } from "bcryptjs"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { notificationPrefs: true }
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  // Remove password
  const { password, ...rest } = user
  return NextResponse.json(rest)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const updateData: any = {
    name: body.name,
    department: body.department,
    phone: body.phone,
  }
  if (body.password) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 })
    }
    updateData.password = await hash(body.password, 12)
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  })
  // Update notification prefs
  if (body.notificationPrefs) {
    await prisma.notificationPrefs.upsert({
      where: { userId: session.user.id },
      update: body.notificationPrefs,
      create: { userId: session.user.id, ...body.notificationPrefs }
    })
  }
  return NextResponse.json({ success: true })
}
