export interface ProjectFormData {
  name: string
  tenderId: string
  description: string
  type: "new" | "repair" | "widening" | "resurfacing"
  budget: number
  wardId: string
  startDate: string
  expectedCompletion: string
}