import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { BuildingDashboard } from "@/components/building-dashboard"
import { TenantOccupancyChart } from "@/components/tenant-occupancy-chart"
import type { Building } from "@/types/buildings"

async function getBuildingData(buildingId: string) {
  const { data: building, error: buildingError } = await supabase
    .from("buildings")
    .select("*")
    .eq("id", buildingId)
    .single()

  if (buildingError || !building) {
    console.error("Error fetching building:", buildingError)
    return null
  }

  const { data: floors, error: floorsError } = await supabase.from("floors").select("id").eq("building_id", building.id)

  if (floorsError) {
    console.error("Error fetching floors:", floorsError)
    return { building, totalAvailableSpace: 0, tenantOccupancy: [], tenantDetails: [] }
  }

  const floorIds = floors?.map((f) => f.id) || []

  if (floorIds.length === 0) {
    return { building, totalAvailableSpace: 0, tenantOccupancy: [], tenantDetails: [] }
  }

  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, chargeable_area, floor_id")
    .in("floor_id", floorIds)

  if (unitsError) {
    console.error("Error fetching units:", unitsError)
    return { building, totalAvailableSpace: 0, tenantOccupancy: [], tenantDetails: [] }
  }

  const unitIds = units?.map((u) => u.id) || []

  if (unitIds.length === 0) {
    return { building, totalAvailableSpace: 0, tenantOccupancy: [], tenantDetails: [] }
  }

  const { data: vacantSpaces, error: vacantSpacesError } = await supabase
    .from("vacant_spaces")
    .select("unit_id")
    .in("unit_id", unitIds)

  if (vacantSpacesError) {
    console.error("Error fetching vacant spaces:", vacantSpacesError)
    return { building, totalAvailableSpace: 0, tenantOccupancy: [], tenantDetails: [] }
  }

  const { data: tenants, error: tenantsError } = await supabase
    .from("tenants")
    .select("id, name, unit_id, current_rent, lease_commencement_date, lock_in_period, lease_expiry")
    .in("unit_id", unitIds)

  if (tenantsError) {
    console.error("Error fetching tenants:", tenantsError)
    return { building, totalAvailableSpace: 0, tenantOccupancy: [], tenantDetails: [] }
  }

  const vacantUnitIds = new Set(vacantSpaces?.map((vs) => vs.unit_id) || [])
  let totalAvailableSpace = 0
  const tenantOccupancy: { name: string; area: number }[] = []
  const tenantAreas: { [key: string]: number } = {}
  const tenantDetails: {
    name: string
    current_rent: number
    lease_commencement_date: string
    lock_in_period: number
    lease_expiry: string
    chargeable_area: number
  }[] = []

  units?.forEach((unit) => {
    if (vacantUnitIds.has(unit.id)) {
      totalAvailableSpace += unit.chargeable_area || 0
    } else {
      const tenant = tenants?.find((t) => t.unit_id === unit.id)
      if (tenant) {
        if (tenantAreas[tenant.name]) {
          tenantAreas[tenant.name] += unit.chargeable_area || 0
        } else {
          tenantAreas[tenant.name] = unit.chargeable_area || 0
        }
        tenantDetails.push({
          name: tenant.name,
          current_rent: tenant.current_rent || 0,
          lease_commencement_date: tenant.lease_commencement_date || "",
          lock_in_period: tenant.lock_in_period || 0,
          lease_expiry: tenant.lease_expiry || "",
          chargeable_area: unit.chargeable_area || 0,
        })
      }
    }
  })

  for (const [name, area] of Object.entries(tenantAreas)) {
    tenantOccupancy.push({ name, area })
  }

  tenantOccupancy.sort((a, b) => b.area - a.area)

  return { building, totalAvailableSpace, tenantOccupancy, tenantDetails }
}

interface BuildingDashboardPageProps {
  params: { id: string }
}

export default async function BuildingDashboardPage({ params }: BuildingDashboardPageProps) {
  try {
    const result = await getBuildingData(params.id)

    if (!result) {
      notFound()
    }

    const { building, totalAvailableSpace, tenantOccupancy, tenantDetails } = result

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <Link
                href={`/dashboard/buildings/${params.id}`}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Building
              </Link>
              <h1 className="text-3xl font-bold">{building.name} Dashboard</h1>
              <p className="text-muted-foreground">Overview of building area and tenant occupancy</p>
            </div>
          </div>
          <div className="grid gap-8">
            <BuildingDashboard building={building as Building} totalAvailableSpace={totalAvailableSpace} />
            <TenantOccupancyChart tenantOccupancy={tenantOccupancy} tenantDetails={tenantDetails} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in BuildingDashboardPage:", error)
    notFound()
  }
}
