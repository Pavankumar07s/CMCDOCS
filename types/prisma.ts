import { Prisma } from '@prisma/client'

export type Contractor = {
  id: number
  name: string
  email: string
  phone?: string | null
  createdAt: Date
  updatedAt: Date
}

export type RoadSegment = {
  id: number
  name: string
  geometry: string
  startLat: Prisma.Decimal
  startLng: Prisma.Decimal
  endLat: Prisma.Decimal
  endLng: Prisma.Decimal
  lengthMeters: Prisma.Decimal
  createdAt: Date
  updatedAt: Date
  projectId?: string | null
}

export type Assignment = {
  id: number
  roadSegmentId: number
  contractorId: number
  startDate: Date
  endDate: Date
  status: string
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}