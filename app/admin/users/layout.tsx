import { AdminShell } from "@/components/admin-shell"

export default function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
