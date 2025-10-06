import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // KPIs
  const totalProjects = await prisma.project.count()
  const activeTenders = await prisma.project.count({ where: { status: "tendering" } })
  const totalUsers = await prisma.user.count()
  const wardsCovered = await prisma.ward.count({
    where: {
      projects: { some: {} }
    }
  })

  // Optionally, calculate changes (dummy for now)
  const kpis = {
    totalProjects,
    projectsChangeText: "+5 from last month",
    projectsChangePercent: "+4.1%",
    activeTenders,
    tendersChangeText: "+2 from last month",
    tendersChangePercent: "+9.1%",
    totalUsers,
    usersChangeText: "+3 from last month",
    usersChangePercent: "+5.7%",
    wardsCovered,
    wardsChangeText: "+0 from last month",
    wardsChangePercent: "0%",
  }

  return NextResponse.json({ kpis })
}
