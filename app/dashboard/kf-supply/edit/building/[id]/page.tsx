import { notFound } from "next/navigation"
import { BuildingForm } from "@/components/building-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface EditBuildingPageProps {
  params: {
    id: string
  }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function EditBuildingPage({ params }: EditBuildingPageProps) {
  const buildingId = Number.parseInt(params.id)

  if (isNaN(buildingId)) {
    notFound()
  }

  const { data: building, error } = await supabase.from("buildings").select("*").eq("id", buildingId).single()

  if (error || !building) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/kf-supply/manage/buildings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Buildings Management
        </Link>
        <h1 className="text-3xl font-bold mt-2">Edit Building</h1>
      </div>

      <BuildingForm building={building} isEditing />
    </div>
  )
}
