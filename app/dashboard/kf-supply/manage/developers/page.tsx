import { supabase } from "@/lib/supabase"
import { DeveloperManagement } from "@/components/developer-management"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ManageDevelopersPage() {
  const { data: developers, error } = await supabase.from("developers").select("*").order("name")

  if (error) {
    console.error("Error fetching developers:", error)
    return <div>Error loading developers</div>
  }

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
        <h1 className="text-3xl font-bold mt-2">Developers Management</h1>
      </div>

      <DeveloperManagement developers={developers} />
    </div>
  )
}
