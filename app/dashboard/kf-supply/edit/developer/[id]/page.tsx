import { notFound } from "next/navigation"
import { DeveloperForm } from "@/components/developer-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface EditDeveloperPageProps {
  params: {
    id: string
  }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function EditDeveloperPage({ params }: EditDeveloperPageProps) {
  const developerId = params.id

  const { data: developer, error } = await supabase.from("developers").select("*").eq("id", developerId).single()

  if (error || !developer) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/kf-supply/manage/developers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Developers Management
        </Link>
        <h1 className="text-3xl font-bold mt-2">Edit Developer</h1>
      </div>

      <DeveloperForm developer={developer} isEditing />
    </div>
  )
}
