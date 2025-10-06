import Link from "next/link"
import { FileText, Home, Map, MessageSquare, RouteIcon as Road } from "lucide-react"

export function ClientNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/client/dashboard"
        className="flex items-center text-sm font-medium transition-colors hover:text-primary"
      >
        <Home className="mr-2 h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/client/projects"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Road className="mr-2 h-4 w-4" />
        Projects
      </Link>
      <Link
        href="/client/reports"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <FileText className="mr-2 h-4 w-4" />
        Reports
      </Link>
      <Link
        href="/client/map"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Map className="mr-2 h-4 w-4" />
        Map View
      </Link>
      <Link
        href="/client/feedback"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Feedback
      </Link>
    </nav>
  )
}
