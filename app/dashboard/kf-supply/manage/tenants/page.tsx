import { supabase } from "@/lib/supabase"
import { TenantManagement } from "@/components/tenant-management"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ManageTenantsPage() {
  const { data: tenants, error } = await supabase
    .from("tenants")
    .select("*, units(unit_no, chargeable_area, floor_id, floors(floor_no, buildings(name)))")
    .order("name")

  if (error) {
    console.error("Error fetching tenants:", error)
    return <div>Error loading tenants</div>
  }

  // Transform the data to include building_name, floor_no, and unit_no
  const formattedTenants = tenants.map((tenant) => ({
    ...tenant,
    building_name: tenant.units?.floors?.buildings?.name || "Unknown Building",
    floor_no: tenant.units?.floors?.floor_no || 0,
    unit_no: tenant.units?.unit_no || "Unknown Unit",
    chargeable_area: tenant.units?.chargeable_area || 0,
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/kf-supply"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to KF Supply
        </Link>
        <h1 className="text-3xl font-bold mt-2">Tenants Management</h1>
      </div>

      <TenantManagement tenants={formattedTenants} />
    </div>
  )
}
