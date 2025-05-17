import { supabase } from "@/lib/supabase"
import { FloorManagement } from "@/components/floor-management"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ManageFloorsPage() {
  const { data: floors, error } = await supabase
    .from("floors")
    .select("*, buildings(name)")
    .order("building_id")
    .order("floor_no")

  if (error) {
    console.error("Error fetching floors:", error)
    return <div>Error loading floors</div>
  }

  // Transform the data to include building_name
  const formattedFloors = floors.map((floor) => ({
    ...floor,
    building_name: floor.buildings?.name || "Unknown Building",
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
        <h1 className="text-3xl font-bold mt-2">Floors Management</h1>
      </div>

      <FloorManagement floors={formattedFloors} />
    </div>
  )
}
