"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, FileText, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface SearchResult {
  id: string
  name: string
  ward: string
  status: string
  completion: number
  budget: string
  tenderId: string
  type: string
}

interface AdvancedSearchResultsProps {
  query: string
  type: string
}

export function AdvancedSearchResults({ query, type }: AdvancedSearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        // In a real app, this would be an API call
        // For demo, we'll simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock results
        const mockResults = [
          {
            id: "1234",
            name: "Sector 7 Main Road Reconstruction",
            ward: "Ward 12 - Sector 7",
            status: "In Progress",
            completion: 65,
            budget: "₹ 1.85 Cr",
            tenderId: "AMB-2024-1234",
            type: "reconstruction",
          },
          {
            id: "1238",
            name: "Railway Road Widening",
            ward: "Ward 1 - Central",
            status: "In Progress",
            completion: 40,
            budget: "₹ 2.50 Cr",
            tenderId: "AMB-2024-1238",
            type: "widening",
          },
        ]

        setResults(mockResults)
      } catch (err) {
        setError("Failed to fetch search results. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query, type])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            {query ? "No results found. Try adjusting your search criteria." : "Enter a search query to find results."}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Found {results.length} results for "{query}"
      </div>

      {results.map((result) => (
        <Card key={result.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{result.name}</CardTitle>
                <CardDescription>{result.ward}</CardDescription>
              </div>
              <Badge
                variant={
                  result.status === "Completed"
                    ? "success"
                    : result.status === "In Progress"
                      ? "default"
                      : result.status === "Planning"
                        ? "outline"
                        : "secondary"
                }
              >
                {result.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm font-medium">Tender ID</div>
                <div className="text-sm">{result.tenderId}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Budget</div>
                <div className="text-sm">{result.budget}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Type</div>
                <div className="text-sm capitalize">{result.type}</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Completion:</div>
                <Progress value={result.completion} className="h-2 w-24" />
                <span className="text-sm">{result.completion}%</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/projects/${result.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
