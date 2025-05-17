import { supabase } from "@/lib/supabase"
import { UnitManagement } from "@/components/unit-management"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ManageUnitsPage() {
  const { data: units, error } = await supabase
    .from("units")
    .select("*, floors(floor_no, buildings(name))")
    .order("floor_id")

  if (error) {
    console.error("Error fetching units:", error)
    return <div>Error loading units</div>
  }

  // Transform the data to include building_name and floor_no
  const formattedUnits = units.map((unit) => ({
    ...unit,
    building_name: unit.floors?.buildings?.name || "Unknown Building",
    floor_no: unit.floors?.floor_no || 0,
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
        <h1 className="text-3xl font-bold mt-2">Units Management</h1>
      </div>

      <UnitManagement units={formattedUnits} />
    </div>
  )
}
