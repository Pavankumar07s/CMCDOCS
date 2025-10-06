import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ProjectDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (projectData: any) => void
}

export function ProjectDetailsDialog({ isOpen, onClose, onSubmit }: ProjectDetailsDialogProps) {
  const [wards, setWards] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: "",
    tenderId: `TND-${Date.now()}`,
    description: "",
    type: "new",
    budget: "0",
    wardId: "",
    startDate: "",
    expectedCompletion: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    // Load wards
    fetch("/api/wards")
      .then(res => res.json())
      .then(data => setWards(data.wards || []))
      .catch(error => {
        console.error("Failed to load wards:", error)
        toast({
          title: "Error",
          description: "Failed to load wards",
          variant: "destructive"
        })
      })
  }, [toast])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.wardId || !formData.budget) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }
    onSubmit({
      ...formData,
      budget: parseFloat(formData.budget),
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      expectedCompletion: formData.expectedCompletion ? new Date(formData.expectedCompletion) : null
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Project Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenderId">Tender ID</Label>
            <Input
              id="tenderId"
              value={formData.tenderId}
              onChange={e => setFormData(prev => ({ ...prev, tenderId: e.target.value }))}
              placeholder="Tender ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Project description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Project Type *</Label>
            <Select
              value={formData.type}
              onValueChange={value => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Construction</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="widening">Widening</SelectItem>
                <SelectItem value="resurfacing">Resurfacing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wardId">Ward *</Label>
            <Select
              value={formData.wardId}
              onValueChange={value => setFormData(prev => ({ ...prev, wardId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select ward" />
              </SelectTrigger>
              <SelectContent>
                {wards.map(ward => (
                  <SelectItem key={ward.id} value={ward.id}>
                    Ward {ward.number} - {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (₹) *</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              placeholder="Enter budget amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedCompletion">Expected Completion</Label>
            <Input
              id="expectedCompletion"
              type="date"
              value={formData.expectedCompletion}
              onChange={e => setFormData(prev => ({ ...prev, expectedCompletion: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}