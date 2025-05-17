"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, ArrowDownRight } from "lucide-react"
import type { Building as BuildingType } from "@/types/buildings"

interface BuildingDashboardProps {
  building: BuildingType
  totalAvailableSpace: number
}

export function BuildingDashboard({ building, totalAvailableSpace }: BuildingDashboardProps) {
  const totalBuildingArea = useMemo(() => building.total_area || 0, [building.total_area])

  const availablePercentage = useMemo(() => {
    if (totalBuildingArea > 0) {
      return ((totalAvailableSpace / totalBuildingArea) * 100).toFixed(1)
    }
    return "N/A"
  }, [totalAvailableSpace, totalBuildingArea])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Building Area</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBuildingArea.toLocaleString()} sq ft</div>
          <p className="text-xs text-muted-foreground">Total area of the building</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Available Space</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAvailableSpace.toLocaleString()} sq ft</div>
          <p className="text-xs text-muted-foreground">{availablePercentage}% of total building area</p>
        </CardContent>
      </Card>
    </div>
  )
}
