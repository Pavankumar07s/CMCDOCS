import Link from "next/link"
import { ArrowRight, CheckCircle, Clock, MapPin, RouteIcon as Road } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Ambala Road Management System</h1>
              <p className="text-primary-foreground/80">Government of Haryana</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="bg-muted/50 py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  End-to-End Road Tender & Maintenance Tracking
                </h2>
                <p className="text-muted-foreground md:text-lg">
                  A comprehensive system for managing road projects from tender to completion with real-time tracking,
                  milestone management, and analytics.
                </p>
                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-2">
                      View Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/map">
                    <Button variant="outline" size="lg">
                      Explore Map View
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-4 shadow-sm">
                <img
                  src="/road.jpg?height=300&width=500"
                  alt="Road maintenance visualization"
                  className="mx-auto h-auto w-full rounded-md object-cover"
                  width={500}
                  height={300}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold md:text-3xl">Key Features</h2>
              <p className="mt-2 text-muted-foreground">Comprehensive tools for road project management</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <Road className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-2">Road Registry</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Geo-linked database of all road projects with tender IDs, ward information, and complete history.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-2">Milestone Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Interactive checklists for each development stage with verification and approval workflows.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Clock className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-2">Audit Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Comprehensive activity tracking with timestamped photos, user actions, and change history.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <MapPin className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-2">Ward Dashboards</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Visualize costs, progress, and maintenance metrics at ward and project levels.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">© 2024 Government of Haryana. All rights reserved.</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
