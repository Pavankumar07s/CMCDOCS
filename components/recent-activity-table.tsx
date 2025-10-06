import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function RecentActivityTable() {
  const activities = [
    {
      id: "act1",
      user: {
        name: "Rajesh Kumar",
        email: "rajesh.kumar@ambala.gov.in",
        avatar: "/placeholder-user.jpg",
        initials: "RK",
      },
      project: "Sector 7 Main Road Reconstruction",
      action: "Updated milestone: Drainage installation completed",
      timestamp: "2 hours ago",
    },
    {
      id: "act2",
      user: {
        name: "Priya Sharma",
        email: "priya.sharma@ambala.gov.in",
        avatar: "/placeholder-user.jpg",
        initials: "PS",
      },
      project: "Sector 7 Main Road Reconstruction",
      action: "Uploaded 5 new photos to milestone: Drainage installation",
      timestamp: "3 hours ago",
    },
    {
      id: "act3",
      user: {
        name: "Vikram Singh",
        email: "vikram@ambalainfra.com",
        avatar: "/placeholder-user.jpg",
        initials: "VS",
      },
      project: "Railway Road Widening",
      action: "Updated project timeline: Expected completion delayed by 2 weeks",
      timestamp: "Yesterday",
    },
    {
      id: "act4",
      user: {
        name: "Anita Verma",
        email: "anita.verma@ambala.gov.in",
        avatar: "/placeholder-user.jpg",
        initials: "AV",
      },
      project: "Sector 10 Internal Roads",
      action: "Added comment: Final inspection scheduled for next week",
      timestamp: "Yesterday",
    },
    {
      id: "act5",
      user: {
        name: "Rajesh Kumar",
        email: "rajesh.kumar@ambala.gov.in",
        avatar: "/placeholder-user.jpg",
        initials: "RK",
      },
      project: "Ambala Cantt Bypass Extension",
      action: "Created new project and assigned team members",
      timestamp: "3 days ago",
    },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Action</TableHead>
          <TableHead className="text-right">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{activity.user.name}</div>
                  <div className="text-xs text-muted-foreground">{activity.user.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{activity.project}</TableCell>
            <TableCell>{activity.action}</TableCell>
            <TableCell className="text-right">{activity.timestamp}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
