import { BuildingForm } from "@/components/building-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewBuildingPage() {
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
        <h1 className="text-3xl font-bold mt-2">Add New Building</h1>
      </div>

      <BuildingForm />
    </div>
  )
}
