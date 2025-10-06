import { toast } from "sonner"
import { useState } from "react"

const ProjectList = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
  setLoading(true)
  try {
    const endpoint = session?.user?.role === 'admin' 
      ? '/api/admin/projects'
      : '/api/projects'
      
    const response = await fetch(endpoint)
    if (!response.ok) throw new Error("Failed to fetch projects")
    const data = await response.json()
    setProjects(data)
  } catch (err) {
    setError(err instanceof Error ? err.message : "Error loading projects")
  return (
    <div>
      {/* Add your JSX here */}
    </div>
  )
}

export default ProjectList
}


function setError(arg0: string) {
    throw new Error("Function not implemented.")
}
