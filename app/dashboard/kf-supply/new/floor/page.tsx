import { MultiFloorForm } from "@/components/multi-floor-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default async function NewFloorPage() {
  // Fetch buildings server-side
  const { data: buildings, error } = await supabase.from("buildings").select("id, name").order("name")

  if (error) {
    console.error("Error fetching buildings:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/kf-supply/manage/floors"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Floors Management
        </Link>
        <h1 className="text-3xl font-bold mt-2">Add Multiple Floors</h1>
        <p className="text-muted-foreground">
          Add multiple floors to a building at once. Floor IDs will be automatically generated.
        </p>
      </div>

      <MultiFloorForm initialBuildings={buildings || []} />
    </div>
  )
}
