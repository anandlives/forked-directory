import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Layers, Grid, Users, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default async function ManageDataPage() {
  // Fetch counts for display
  const [buildingsResponse, floorsResponse, unitsResponse, tenantsResponse] = await Promise.all([
    supabase.from("buildings").select("id", { count: "exact", head: true }),
    supabase.from("floors").select("id", { count: "exact", head: true }),
    supabase.from("units").select("id", { count: "exact", head: true }),
    supabase.from("tenants").select("id", { count: "exact", head: true }),
  ])

  const counts = {
    buildings: buildingsResponse.count || 0,
    floors: floorsResponse.count || 0,
    units: unitsResponse.count || 0,
    tenants: tenantsResponse.count || 0,
  }

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
          <h1 className="text-3xl font-bold mt-2">Manage Existing Data</h1>
          <p className="text-muted-foreground">View, edit or delete records in the database</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/kf-supply/manage/buildings">
            <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Buildings
                  </CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Manage existing buildings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Edit or delete building records in the database</p>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                    {counts.buildings} records
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/kf-supply/manage/floors">
            <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Floors
                  </CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Manage floors across all buildings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">View, edit, or delete floor information</p>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                    {counts.floors} records
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/kf-supply/manage/units">
            <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Grid className="h-5 w-5" />
                    Units
                  </CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Manage units across all floors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">View, edit, or delete unit information</p>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                    {counts.units} records
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/kf-supply/manage/tenants">
            <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tenants
                  </CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Manage tenant information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">View, edit, or delete tenant and lease details</p>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                    {counts.tenants} records
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
