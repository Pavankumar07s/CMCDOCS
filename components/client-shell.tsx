import type { ReactNode } from "react"

import { ClientNav } from "@/components/client-nav"
import { UserNav } from "@/components/user-nav"

interface ClientShellProps {
  children: ReactNode
}

export function ClientShell({ children }: ClientShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <ClientNav />
          <UserNav isClient={true} />
        </div>
      </header>
      <main className="flex-1">
        <div className="container grid gap-6 py-6 md:py-8">{children}</div>
      </main>
    </div>
  )
}
