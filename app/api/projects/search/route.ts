import { NextResponse } from "next/server"

// In a real application, this would connect to a database
// This is a mock implementation for demonstration purposes

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all"
    const ward = searchParams.get("ward") || "all"
    const status = searchParams.get("status") || "all"
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""
    const budget = searchParams.get("budget") || "all"

    // Mock data - in a real app, this would be fetched from a database
    let projects = [
      {
        id: "1234",
        name: "Sector 7 Main Road Reconstruction",
        ward: "Ward 12 - Sector 7",
        wardId: "12",
        status: "In Progress",
        type: "reconstruction",
        startDate: "2024-03-15",
        expectedCompletion: "2024-06-30",
        completion: 65,
        budget: 18500000,
        spent: 12025000,
        tenderId: "AMB-2024-1234",
        contractor: "Ambala Infrastructure Ltd.",
        projectManager: "Rajesh Kumar",
      },
      {
        id: "1235",
        name: "Ambala Cantt Bypass Extension",
        ward: "Ward 5 - Cantt",
        wardId: "5",
        status: "Planning",
        type: "new",
        startDate: null,
        expectedCompletion: null,
        completion: 0,
        budget: 32000000,
        spent: 0,
        tenderId: "AMB-2024-1235",
        contractor: "Haryana Roads Corp.",
        projectManager: "Sunil Verma",
      },
      {
        id: "1236",
        name: "Mahesh Nagar Road Resurfacing",
        ward: "Ward 8 - Mahesh Nagar",
        wardId: "8",
        status: "Tendering",
        type: "resurfacing",
        startDate: null,
        expectedCompletion: null,
        completion: 0,
        budget: 7500000,
        spent: 0,
        tenderId: "AMB-2024-1236",
        contractor: "Pending",
        projectManager: "Anita Sharma",
      },
      {
        id: "1237",
        name: "Sector 10 Internal Roads",
        ward: "Ward 3 - Sector 10",
        wardId: "3",
        status: "Completed",
        type: "repair",
        startDate: "2024-01-10",
        expectedCompletion: "2024-03-15",
        completion: 100,
        budget: 12000000,
        spent: 11800000,
        tenderId: "AMB-2024-1237",
        contractor: "Punjab Construction Co.",
        projectManager: "Vikram Singh",
      },
      {
        id: "1238",
        name: "Railway Road Widening",
        ward: "Ward 1 - Central",
        wardId: "1",
        status: "In Progress",
        type: "widening",
        startDate: "2024-02-05",
        expectedCompletion: "2024-05-20",
        completion: 40,
        budget: 25000000,
        spent: 10000000,
        tenderId: "AMB-2024-1238",
        contractor: "Northern Builders Ltd.",
        projectManager: "Priya Sharma",
      },
    ]

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase()
      projects = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(lowerQuery) ||
          project.tenderId.toLowerCase().includes(lowerQuery) ||
          project.ward.toLowerCase().includes(lowerQuery) ||
          project.contractor.toLowerCase().includes(lowerQuery) ||
          project.projectManager.toLowerCase().includes(lowerQuery),
      )
    }

    // Filter by type
    if (type !== "all" && type !== "projects") {
      // In a real app, we would filter by different types
      // For this mock, we'll just return an empty array for non-project types
      if (type === "tenders" || type === "users" || type === "documents") {
        projects = []
      }
    }

    // Filter by ward
    if (ward !== "all") {
      projects = projects.filter((project) => project.wardId === ward)
    }

    // Filter by status
    if (status !== "all") {
      projects = projects.filter((project) => project.status.toLowerCase() === status.toLowerCase())
    }

    // Filter by date range
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom)
      const toDate = new Date(dateTo)

      projects = projects.filter((project) => {
        if (!project.startDate) return false
        const projectDate = new Date(project.startDate)
        return projectDate >= fromDate && projectDate <= toDate
      })
    }

    // Filter by budget range
    if (budget !== "all") {
      if (budget === "low") {
        projects = projects.filter((project) => project.budget < 10000000)
      } else if (budget === "medium") {
        projects = projects.filter((project) => project.budget >= 10000000 && project.budget < 20000000)
      } else if (budget === "high") {
        projects = projects.filter((project) => project.budget >= 20000000)
      }
    }

    return NextResponse.json({
      results: projects,
      count: projects.length,
      query,
      filters: { type, ward, status, dateFrom, dateTo, budget },
    })
  } catch (error) {
    console.error("Error searching projects:", error)
    return NextResponse.json({ error: "Failed to search projects" }, { status: 500 })
  }
}
