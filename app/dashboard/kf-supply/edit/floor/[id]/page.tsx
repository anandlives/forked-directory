import { notFound } from "next/navigation"
import { getFloorById } from "@/app/actions/edit-floor-actions"
import { EditFloorForm } from "@/components/edit-floor-form"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function EditFloorPage({ params }: { params: { id: string } }) {
  const { floor, error } = await getFloorById(params.id)

  if (error || !floor) {
    console.error("Error fetching floor:", error)
    notFound()
  }

  // Get buildings for the dropdown
  const { data: buildings } = await supabaseAdmin.from("buildings").select("id, name").order("name")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Floor</h1>
      <p className="text-muted-foreground mb-6">Update the information for this floor</p>

      <EditFloorForm floor={floor} />
    </div>
  )
}
