"use client"

import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <UserNav />
        </div>
      </div>
      <div className="container flex-1 space-y-4 py-4">
        {children}
      </div>
    </div>
  )
}