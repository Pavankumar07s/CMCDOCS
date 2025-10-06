import Link from "next/link"
import { FileText, Home, Map, RouteIcon as Road, Settings, Users } from "lucide-react"

export function AdminNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/admin/dashboard"
        className="flex items-center text-sm font-medium transition-colors hover:text-primary"
      >
        <Home className="mr-2 h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/admin/projects"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Road className="mr-2 h-4 w-4" />
        Projects
      </Link>
      <Link
        href="/admin/tenders"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <FileText className="mr-2 h-4 w-4" />
        Tenders
      </Link>
      <Link
        href="/admin/users"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Users className="mr-2 h-4 w-4" />
        Users
      </Link>
      <Link
        href="/admin/map"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Map className="mr-2 h-4 w-4" />
        Map
      </Link>
      <Link
        href="/admin/settings"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Link>
    </nav>
  )
}
