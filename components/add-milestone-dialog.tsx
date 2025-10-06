"use client"

import { useState } from "react"
import { Plus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AddMilestoneDialogProps {
  projectId: string
  onMilestoneAdded: () => void
}

export function AddMilestoneDialog({ projectId, onMilestoneAdded }: AddMilestoneDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  // checklist is now array of { name, amount }
  const [checklist, setChecklist] = useState<{ name: string; amount: string }[]>([{ name: '', amount: '' }])

  const addChecklistItem = () => {
    setChecklist([...checklist, { name: '', amount: '' }])
  }

  const removeChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index))
  }

  const updateChecklistItem = (index: number, field: 'name' | 'amount', value: string) => {
    setChecklist(checklist.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      date: formData.get('date'),
      checklist: checklist
        .filter(item => item.name.trim() !== '')
        .map(item => ({
          name: item.name,
          amount: parseFloat(item.amount) || 0
        }))
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error("Failed to create milestone")

      toast.success("Milestone added successfully")
      setOpen(false)
      setChecklist([{ name: '', amount: '' }])
      onMilestoneAdded?.()
    } catch (err) {
      toast.error("Failed to add milestone")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Milestone
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Milestone</DialogTitle>
          <DialogDescription>
            Create a new milestone with checklist items to track progress
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Milestone Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" />
            </div>
            <div>
              <Label htmlFor="date">Target Date</Label>
              <Input id="date" name="date" type="date" />
            </div>
            <div className="space-y-2">
              <Label>Checklist Items</Label>
              {checklist.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item.name}
                    onChange={(e) => updateChecklistItem(index, 'name', e.target.value)}
                    placeholder="Enter checklist item"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => updateChecklistItem(index, 'amount', e.target.value)}
                    placeholder="Amount"
                    className="w-24"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeChecklistItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChecklistItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Milestone
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}