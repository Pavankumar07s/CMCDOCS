import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../../auth/[...nextauth]/route"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await prisma.notification.update({
    where: { id: params.id, userId: session.user.id },
    data: { read: true }
  })
  return NextResponse.json({ success: true })
}
