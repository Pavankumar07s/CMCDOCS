import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getSignedMediaUrl } from "@/lib/s3"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (!key) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 })
    }

    const url = await getSignedMediaUrl(key)
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error generating signed URL:", error)
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    )
  }
}