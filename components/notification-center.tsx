"use client"

import { useEffect, useState } from "react"
import { Bell, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSession } from "next-auth/react"

export function NotificationCenter({ isAdmin = false }: { isAdmin?: boolean }) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    setLoading(true)
    const res = await fetch("/api/notifications")
    const data = await res.json()
    setNotifications(data.notifications || [])
    setUnreadCount((data.notifications || []).filter((n: any) => !n.read).length)
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" })
    fetchNotifications()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">{unreadCount}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          Notifications
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <div className="p-4 text-muted-foreground text-sm">No notifications</div>
        )}
        {notifications.map((n) => (
          <DropdownMenuItem
            key={n.id}
            className={`flex flex-col items-start ${!n.read ? "bg-muted" : ""}`}
            onClick={() => markAsRead(n.id)}
          >
            <div className="flex items-center gap-2">
              {n.read ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Bell className="h-4 w-4 text-primary" />}
              <span className="font-medium">{n.title}</span>
            </div>
            <span className="text-xs text-muted-foreground">{n.message}</span>
            <span className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
