import { EditUnitForm } from "@/components/edit-unit-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

interface EditUnitPageProps {
  params: {
    id: string
  }
}

export default async function EditUnitPage({ params }: EditUnitPageProps) {
  const unitId = params.id // Use the ID as a string, don't parse it as a number

  console.log("Edit Unit Page - Received unit ID:", unitId)

  try {
    // First check if the unit exists
    const { count } = await supabaseAdmin.from("units").select("*", { count: "exact", head: true }).eq("id", unitId)

    console.log("Edit Unit Page - Unit count:", count)

    // If unit doesn't exist, show a helpful message
    if (count === 0) {
      // Get a list of available units to help the user
      const { data: availableUnits } = await supabaseAdmin
        .from("units")
        .select("id, unit_no, floor_id, floors!inner(floor_number, buildings!inner(name))")
        .order("created_at", { ascending: false })
        .limit(5)

      return (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/dashboard/kf-supply/manage/units"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Units Management
            </Link>
            <h1 className="text-3xl font-bold mt-2">Edit Unit</h1>
          </div>
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded">
            <h2 className="font-semibold">Unit Not Found</h2>
            <p className="mt-2">
              The unit with ID {unitId} does not exist in the database. Please select a valid unit from the units
              management page.
            </p>
            <div className="mt-4">
              <Link href="/dashboard/kf-supply/manage/units">
                <Button variant="outline">View All Units</Button>
              </Link>
            </div>
          </div>

          {availableUnits && availableUnits.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Recently Added Units</h2>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Floor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Building
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableUnits.map((unit) => (
                      <tr key={unit.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {typeof unit.id === "string" && unit.id.length > 8
                            ? `${unit.id.substring(0, 8)}...`
                            : unit.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {unit.unit_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {unit.floors?.floor_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {unit.floors?.buildings?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link href={`/dashboard/kf-supply/edit/unit/${unit.id}`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )
    }

    // Fetch the unit with its floor and building information
    const { data: unit, error } = await supabaseAdmin.from("units").select("*").eq("id", unitId).single()

    if (error || !unit) {
      throw new Error(error ? error.message : "Failed to fetch unit data")
    }

    // Fetch the floor information
    const { data: floor, error: floorError } = await supabaseAdmin
      .from("floors")
      .select("*, buildings(name)")
      .eq("id", unit.floor_id)
      .single()

    if (floorError) {
      console.error("Error fetching floor:", floorError)
    }

    // Format the floor data with building name
    const formattedFloor = floor
      ? {
          ...floor,
          building_name: floor.buildings?.name || "Unknown Building",
        }
      : undefined

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard/kf-supply/manage/units"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Units Management
          </Link>
          <h1 className="text-3xl font-bold mt-2">Edit Unit</h1>
          <p className="text-sm text-muted-foreground">ID: {unitId}</p>
        </div>

        <EditUnitForm unit={unit} floor={formattedFloor} />
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in EditUnitPage:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard/kf-supply/manage/units"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Units Management
          </Link>
          <h1 className="text-3xl font-bold mt-2">Edit Unit</h1>
          <p className="text-sm text-muted-foreground">ID: {unitId}</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <h2 className="font-semibold">An error occurred while loading the unit</h2>
          <p className="mt-2">Please try again later or contact support.</p>
          <pre className="mt-4 p-3 bg-red-100 rounded overflow-auto max-h-40 text-xs">
            {error instanceof Error ? error.message : String(error)}
          </pre>
          <div className="mt-4">
            <Link href="/dashboard/kf-supply/manage/units">
              <Button variant="outline">View All Units</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
