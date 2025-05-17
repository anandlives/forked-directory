import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { supabaseAdmin } from "@/lib/supabase"
import { EditTenantForm } from "@/components/edit-tenant-form"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface EditTenantPageProps {
  params: {
    id: string
  }
}

export default async function EditTenantPage({ params }: EditTenantPageProps) {
  const { id } = params

  console.log("Attempting to fetch tenant with ID:", id)

  try {
    // Fetch the tenant data
    const { data: tenant, error } = await supabaseAdmin.from("tenants").select("*").eq("id", id).single()

    if (error || !tenant) {
      console.error("Error fetching tenant:", error)
      notFound()
    }

    console.log("Successfully fetched tenant:", tenant.id, tenant.name)
    console.log("Unit ID type:", typeof tenant.unit_id, "Value:", tenant.unit_id)

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center">
          <Button asChild variant="ghost" className="mr-4">
            <Link href="/dashboard/kf-supply/manage/tenants">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Tenants Management
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Tenant</h1>
          <p className="text-muted-foreground">ID: {id}</p>
          {tenant.unit_id && <p className="text-muted-foreground">Unit ID: {tenant.unit_id}</p>}
        </div>

        <EditTenantForm tenant={tenant} />
      </div>
    )
  } catch (error) {
    console.error("Error in EditTenantPage:", error)
    notFound()
  }
}
