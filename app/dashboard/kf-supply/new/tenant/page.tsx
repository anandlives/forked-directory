import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MultiTenantForm } from "@/components/multi-tenant-form"
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

export default async function NewTenantPage() {
  const { buildings, error } = await getBuildings()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/kf-supply/manage/tenants"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tenants Management
        </Link>
        <h1 className="text-3xl font-bold mt-2">Add New Tenant</h1>
        <p className="text-muted-foreground">Select a building, floor, and unit, then enter tenant details</p>
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
        <MultiTenantForm initialBuildings={buildings} />
      )}
    </div>
  )
}
