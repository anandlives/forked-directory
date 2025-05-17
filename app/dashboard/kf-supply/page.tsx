import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building, Layers, Users, Grid, Plus, ArrowRight, User } from "lucide-react"
import { supabase } from "@/lib/supabase"

async function getEntityCounts() {
  const [buildingsResponse, floorsResponse, unitsResponse, tenantsResponse, developersResponse] = await Promise.all([
    supabase.from("buildings").select("id", { count: "exact", head: true }),
    supabase.from("floors").select("id", { count: "exact", head: true }),
    supabase.from("units").select("id", { count: "exact", head: true }),
    supabase.from("tenants").select("id", { count: "exact", head: true }),
    supabase.from("developers").select("id", { count: "exact", head: true }),
  ])

  return {
    buildings: buildingsResponse.count || 0,
    floors: floorsResponse.count || 0,
    units: unitsResponse.count || 0,
    tenants: tenantsResponse.count || 0,
    developers: developersResponse.count || 0,
  }
}

export default async function KFSupplyPage() {
  const counts = await getEntityCounts()

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">KF Supply Management</h1>
        <p className="text-muted-foreground mb-8">
          Manage your real estate inventory, track properties, and maintain accurate data
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Buildings</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.buildings}</div>
              <p className="text-xs text-muted-foreground">Total buildings in database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Floors</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.floors}</div>
              <p className="text-xs text-muted-foreground">Total floors across all buildings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Units</CardTitle>
              <Grid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.units}</div>
              <p className="text-xs text-muted-foreground">Total units across all floors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.tenants}</div>
              <p className="text-xs text-muted-foreground">Active tenants in the system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Developers</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.developers}</div>
              <p className="text-xs text-muted-foreground">Property developers in the system</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Add New Data</h2>
            <div className="grid gap-4">
              <Link href="/dashboard/kf-supply/new/building">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    Add New Building
                  </span>
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/kf-supply/new/floor">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Layers className="mr-2 h-4 w-4" />
                    Add New Floor
                  </span>
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/kf-supply/new/unit">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Grid className="mr-2 h-4 w-4" />
                    Add New Unit
                  </span>
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/kf-supply/new/tenant">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Add New Tenant
                  </span>
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/kf-supply/new/developer">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Add New Developer
                  </span>
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Manage Existing Data</h2>
            <div className="grid gap-4">
              <Link href="/dashboard/kf-supply/manage/buildings">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    Manage Buildings
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/kf-supply/manage/floors">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Layers className="mr-2 h-4 w-4" />
                    Manage Floors
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/kf-supply/manage/units">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Grid className="mr-2 h-4 w-4" />
                    Manage Units
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/kf-supply/manage/tenants">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Tenants
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/kf-supply/manage/developers">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Manage Developers
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
