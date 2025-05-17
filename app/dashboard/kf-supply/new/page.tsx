import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Layers, Grid, Users, ArrowRight } from "lucide-react"

export default function NewEntryPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Link
            href="/dashboard/kf-supply"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Property Management
          </Link>
          <h1 className="text-3xl font-bold mt-2">Make a New Entry</h1>
          <p className="text-muted-foreground">Select the type of entry you want to create</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/kf-supply/new/building">
            <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Building
                  </CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Add a new building to the database</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enter details like building name, location, area, grade, and other property information.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/kf-supply/new/floor">
            <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Floor
                  </CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Add a new floor to an existing building</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Specify floor number, area, efficiency, and type of space for a selected building.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/kf-supply/new/unit">
            <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Grid className="h-5 w-5" />
                    Unit
                  </CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Add a new unit to an existing floor</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add unit details like unit number, status, chargeable and carpet area to an existing floor.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/kf-supply/new/tenant">
            <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tenant
                  </CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Add a new tenant to an existing unit</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enter tenant information, lease details, rent information, and other occupancy data.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
