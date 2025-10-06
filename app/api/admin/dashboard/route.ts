import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch all projects
  const projects = await prisma.project.findMany({
    include: { ward: true }
  })
  console.log(projects)

  // KPIs
  const totalProjects = projects.length
  const inProgress = projects.filter(p => p.status.toLowerCase() === "In progress").length
  const completed = projects.filter(p => p.status.toLowerCase() === "completed").length
  const pendingApprovals = await prisma.approval.count({ where: { status: "pending" } })

  // Ward performance
  const wards = await prisma.ward.findMany({
    select: { id: true, name: true, number: true }
  })
  const wardPerformance = await Promise.all(
    wards.map(async ward => {
      const wardProjects = projects.filter(p => p.wardId === ward.id)
      const completion = wardProjects.length
        ? Math.round(wardProjects.reduce((sum, p) => sum + (p.completion || 0), 0) / wardProjects.length)
        : 0
      const budget = wardProjects.length
        ? Math.round(
            (wardProjects.reduce((sum, p) => sum + (p.spent || 0), 0) /
              wardProjects.reduce((sum, p) => sum + (p.budget || 0), 0)) *
              100
          )
        : 0
      return { name: `Ward ${ward.number}`, completion, budget }
    })
  )

  // Project status
  const projectStatus = [
    { name: "Planning", value: projects.filter(p => p.status.toLowerCase() === "planning").length },
    { name: "Tendering", value: projects.filter(p => p.status.toLowerCase() === "tendering").length },
    { name: "In Progress", value: projects.filter(p => p.status.toLowerCase() === "in progress").length },
    { name: "Completed", value: projects.filter(p => p.status.toLowerCase() === "completed").length },
  ]

  // Budget allocation
  const budgetAllocation = await Promise.all(
    wards.map(async ward => {
      const total = projects
        .filter(p => p.wardId === ward.id)
        .reduce((sum, p) => sum + (p.budget || 0), 0)
      return { name: `Ward ${ward.number}`, value: total }
    })
  )

  // System health (dummy for now)
  const systemHealth = {
    cpu: 15,
    memory: 28,
    storage: 41,
    status: "Normal"
  }

  // Users
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, department: true, status: true },
    orderBy: { createdAt: "desc" },
    take: 10
  })

  // Activities (dummy for now)
  const activities: Array<never> = []

  return NextResponse.json({
    kpis: {
      totalProjects,
      inProgress,
      completed,
      pendingApprovals
    },
    wardPerformance,
    projectStatus,
    budgetAllocation,
    systemHealth,
    projects,
    users,
    activities
  })
}
