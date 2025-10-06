"use client"

import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex w-full flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
