"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Map, User, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNavigationByRole } from "@/lib/navigation"
import { useSession } from "next-auth/react"

export function MainNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const nav = getNavigationByRole(session?.user?.role)

  const navigationItems = [
    {
      title: "Dashboard",
      href: nav.dashboard,
      icon: Home,
    },
    {
      title: "Projects",
      href: nav.projects,
      icon: FileText,
    },
    {
      title: "Map View",
      href: nav.map,
      icon: Map,
    },
    ...(session?.user?.role === 'admin' ? [
      {
        title: "Contractors",
        href: "/admin/contractors",
        icon: Users,
      },
      {
        title: "Tenders",
        href: "/admin/tenders",
        icon: FileText,
      }
    ] : [])
    ,
  ].filter(Boolean)

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href!}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
