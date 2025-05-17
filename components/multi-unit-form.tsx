"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { createMultipleUnits, fetchFloorsByBuildingId } from "@/app/actions/unit-actions"
import { Loader2 } from "lucide-react"
import type { Building } from "@/types/buildings"
import type { Floor } from "@/types/floors"

interface MultiUnitFormProps {
  initialBuildings: Building[]
}

// Form schema
const formSchema = z.object({
  building_id: z.string().min(1, "Building is required"),
  floor_id: z.string().min(1, "Floor is required"),
  unit_count: z.coerce.number().min(1, "At least 1 unit is required").max(50, "Maximum 50 units allowed"),
  unit_prefix: z.string().optional(),
  starting_number: z.coerce.number().min(1, "Starting number must be at least 1"),
  chargeable_area: z.coerce.number().min(0, "Chargeable area cannot be negative"),
  carpet_area: z.coerce.number().min(0, "Carpet area cannot be negative"),
  premises_condition: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function MultiUnitForm({ initialBuildings }: MultiUnitFormProps) {
  const router = useRouter()
  const [buildings] = useState<Building[]>(initialBuildings)
  const [floors, setFloors] = useState<Floor[]>([])
  const [isLoadingFloors, setIsLoadingFloors] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      building_id: "",
      floor_id: "",
      unit_count: 1,
      unit_prefix: "",
      starting_number: 1,
      chargeable_area: 0,
      carpet_area: 0,
      premises_condition: "Shell and Core",
    },
  })

  // Fetch floors when building selection changes
  const handleBuildingChange = async (buildingId: string) => {
    form.setValue("building_id", buildingId)
    form.setValue("floor_id", "") // Reset floor selection
    setError(null)

    if (!buildingId) {
      setFloors([])
      return
    }

    setIsLoadingFloors(true)

    try {
      const result = await fetchFloorsByBuildingId(buildingId)

      if (result.success) {
        setFloors(result.floors)
        if (result.floors.length === 0) {
          setError("No floors found for this building. Please add floors first.")
        }
      } else {
        setError(result.error || "Failed to fetch floors")
        setFloors([])
      }
    } catch (err) {
      console.error("Error fetching floors:", err)
      setError("An unexpected error occurred while fetching floors")
      setFloors([])
    } finally {
      setIsLoadingFloors(false)
    }
  }

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Create FormData object
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      // Call the server action
      const result = await createMultipleUnits(formData)

      if (result.success) {
        toast({
          title: "Units created",
          description: `Successfully created ${data.unit_count} units`,
        })

        // Navigate to units management page
        router.push("/dashboard/kf-supply/manage/units")
        router.refresh()
      } else {
        setError(result.error || "Failed to create units")
        toast({
          title: "Error",
          description: result.error || "Failed to create units",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Multiple Units</CardTitle>
        <CardDescription>Create multiple units at once for a specific floor</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Building Selection */}
            <div className="space-y-2">
              <Label htmlFor="building_id">Building *</Label>
              <Select onValueChange={handleBuildingChange}>
                <SelectTrigger id="building_id" className="w-full">
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.length > 0 ? (
                    buildings.map((building) => (
                      <SelectItem key={building.id} value={String(building.id)}>
                        {building.name} (ID: {building.id})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-buildings" disabled>
                      No buildings found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.building_id && (
                <p className="text-sm text-red-500">{form.formState.errors.building_id.message}</p>
              )}
            </div>

            {/* Floor Selection */}
            <div className="space-y-2">
              <Label htmlFor="floor_id">Floor *</Label>
              <Select
                disabled={isLoadingFloors || floors.length === 0}
                onValueChange={(value) => form.setValue("floor_id", value)}
              >
                <SelectTrigger id="floor_id" className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingFloors
                        ? "Loading floors..."
                        : floors.length === 0
                          ? "No floors available"
                          : "Select floor"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingFloors ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading floors...
                      </div>
                    </SelectItem>
                  ) : floors.length > 0 ? (
                    floors.map((floor) => (
                      <SelectItem key={floor.id} value={String(floor.id)}>
                        Floor {floor.floor_no} (ID: {floor.id})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-floors" disabled>
                      No floors found for this building
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.floor_id && (
                <p className="text-sm text-red-500">{form.formState.errors.floor_id.message}</p>
              )}
            </div>

            {/* Unit Count */}
            <div className="space-y-2">
              <Label htmlFor="unit_count">Number of Units *</Label>
              <Input
                id="unit_count"
                type="number"
                {...form.register("unit_count", { valueAsNumber: true })}
                min={1}
                max={50}
              />
              {form.formState.errors.unit_count && (
                <p className="text-sm text-red-500">{form.formState.errors.unit_count.message}</p>
              )}
            </div>

            {/* Unit Prefix */}
            <div className="space-y-2">
              <Label htmlFor="unit_prefix">Unit Prefix</Label>
              <Input id="unit_prefix" {...form.register("unit_prefix")} placeholder="e.g., Unit " />
              <p className="text-xs text-muted-foreground">
                Optional prefix for unit numbers (e.g., "Unit " will create "Unit 1", "Unit 2", etc.)
              </p>
            </div>

            {/* Starting Number */}
            <div className="space-y-2">
              <Label htmlFor="starting_number">Starting Number *</Label>
              <Input
                id="starting_number"
                type="number"
                {...form.register("starting_number", { valueAsNumber: true })}
                min={1}
              />
              {form.formState.errors.starting_number && (
                <p className="text-sm text-red-500">{form.formState.errors.starting_number.message}</p>
              )}
            </div>

            {/* Chargeable Area */}
            <div className="space-y-2">
              <Label htmlFor="chargeable_area">Chargeable Area (sq ft)</Label>
              <Input
                id="chargeable_area"
                type="number"
                {...form.register("chargeable_area", { valueAsNumber: true })}
                min={0}
                step="0.01"
              />
              {form.formState.errors.chargeable_area && (
                <p className="text-sm text-red-500">{form.formState.errors.chargeable_area.message}</p>
              )}
            </div>

            {/* Carpet Area */}
            <div className="space-y-2">
              <Label htmlFor="carpet_area">Carpet Area (sq ft)</Label>
              <Input
                id="carpet_area"
                type="number"
                {...form.register("carpet_area", { valueAsNumber: true })}
                min={0}
                step="0.01"
              />
              {form.formState.errors.carpet_area && (
                <p className="text-sm text-red-500">{form.formState.errors.carpet_area.message}</p>
              )}
            </div>

            {/* Premises Condition */}
            <div className="space-y-2">
              <Label htmlFor="premises_condition">Premises Condition</Label>
              <Select
                defaultValue={form.getValues("premises_condition")}
                onValueChange={(value) => form.setValue("premises_condition", value)}
              >
                <SelectTrigger id="premises_condition">
                  <SelectValue placeholder="Select premises condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shell and Core">Shell and Core</SelectItem>
                  <SelectItem value="Warmshell">Warmshell</SelectItem>
                  <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                  <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                  <SelectItem value="Bareshell">Bareshell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/kf-supply/manage/units")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingFloors || !form.getValues("floor_id")}>
              {isSubmitting ? "Creating Units..." : "Create Units"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
