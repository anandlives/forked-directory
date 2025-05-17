import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MultiUnitForm } from "@/components/multi-unit-form"
import { supabase } from "@/lib/supabase"

// Fetch buildings data on the server with better error handling
async function getBuildings() {
  try {
    const { data, error, status } = await supabase.from("buildings").select("id, name").order("name")

    if (error) {
      console.error(`Error fetching buildings: ${error.message} (Status: ${status})`)
      return { error: error.message, buildings: [] }
    }

    return { buildings: data || [], error: null }
  } catch (error) {
    // Handle non-Supabase errors (like parsing errors)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error(`Exception in getBuildings: ${errorMessage}`)
    return { error: errorMessage, buildings: [] }
  }
}

export default async function NewUnitPage() {
  const { buildings, error } = await getBuildings()

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
        <h1 className="text-3xl font-bold mt-2">Add Multiple Units</h1>
        <p className="text-muted-foreground">
          Add multiple units to a floor at once. Unit IDs will be automatically generated.
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p className="font-medium">Error loading buildings</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2">
            This may be due to a temporary issue or rate limiting. Please try again in a few moments.
          </p>
        </div>
      ) : (
        <MultiUnitForm initialBuildings={buildings} />
      )}
    </div>
  )
}
