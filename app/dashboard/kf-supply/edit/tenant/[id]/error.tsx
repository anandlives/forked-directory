"use client"

import { useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function EditTenantError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Edit Tenant Error:", error)
  }, [error])

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
        <h1 className="text-3xl font-bold mt-2">Edit Tenant</h1>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="text-xl font-semibold text-red-800">An error occurred</h2>
        <p className="mt-2 text-red-700">
          There was a problem loading the tenant information. Please try again later or contact support.
        </p>

        <div className="mt-4 bg-red-100 p-4 rounded">
          <p className="font-mono text-sm text-red-800">{error.message || "Unknown error"}</p>
          {error.digest && <p className="font-mono text-sm text-red-800 mt-2">Error ID: {error.digest}</p>}
        </div>

        <div className="mt-6 flex gap-4">
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
          <Link href="/dashboard/kf-supply/manage/tenants">
            <Button variant="default">Return to Tenants Management</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
