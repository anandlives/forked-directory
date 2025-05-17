"use client"

import { ArrowLeft, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function EditUnitError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unit edit error:", error)
  }, [error])

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
        <h1 className="text-3xl font-bold mt-2">Error</h1>
      </div>

      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Something went wrong!</h2>
        <p className="mb-4">{error.message || "An error occurred while editing the unit."}</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={reset} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild>
            <Link href="/dashboard/kf-supply/manage/units">Return to Units Management</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
