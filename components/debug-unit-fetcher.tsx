"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DebugUnitFetcherProps {
  unitId: number
}

export function DebugUnitFetcher({ unitId }: DebugUnitFetcherProps) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchUnit() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/debug/units/${unitId}`)
      const data = await response.json()

      setResult(data)

      if (!response.ok) {
        setError(`Error ${response.status}: ${data.error || "Unknown error"}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Debug Unit Fetcher</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={fetchUnit} disabled={loading}>
              {loading ? "Loading..." : "Fetch Unit"}
            </Button>
            <span className="text-sm">Unit ID: {unitId}</span>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

          {result && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded overflow-auto max-h-60">
              <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
