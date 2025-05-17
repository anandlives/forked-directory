"use client"

import { useState, useEffect } from "react"
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
import { createFloor, updateFloor } from "@/app/actions/data-operations"
import { supabase } from "@/lib/supabase"
import type { Floor } from "@/types/floors"
import type { Building } from "@/types/buildings"

interface FloorFormProps {
  floor?: Floor
  isEditing?: boolean
  buildingId?: string
}

// Update the schema to include floor_plan
const floorSchema = z.object({
  id: z.string().min(1, "Floor ID is required"),
  building_id: z.string().min(1, "Building is required"),
  floor_no: z.coerce.number().min(0, "Floor number is required"),
  floor_plate: z.coerce.number().min(1, "Floor plate must be greater than 0"),
  no_of_units: z.coerce.number().min(1, "Number of units must be at least 1"),
  efficiency: z.coerce.number().min(0).max(100, "Efficiency must be between 0 and 100"),
  type_of_space: z.string().min(1, "Type of space is required"),
  floor_plan: z.string().url("Floor plan must be a valid URL").optional().or(z.literal("")),
})

type FloorFormValues = z.infer<typeof floorSchema>

export function FloorForm({ floor, isEditing = false, buildingId }: FloorFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Update the defaultValues to include floor_plan
  const defaultValues: Partial<FloorFormValues> = floor
    ? {
        id: floor.id,
        building_id: floor.building_id,
        floor_no: floor.floor_no,
        floor_plate: floor.floor_plate,
        no_of_units: floor.no_of_units,
        efficiency: floor.efficiency,
        type_of_space: floor.type_of_space || "",
        floor_plan: floor.floor_plan || "",
      }
    : {
        id: "", // Default to empty string
        building_id: buildingId || "",
        floor_no: 0,
        floor_plate: 0,
        no_of_units: 1,
        efficiency: 70, // Default efficiency
        type_of_space: "Office", // Default to Office
        floor_plan: "", // Default to empty string
      }

  const form = useForm<FloorFormValues>({
    resolver: zodResolver(floorSchema),
    defaultValues,
  })

  // Update the useEffect for fetching data to handle string IDs:
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setFetchError(null)

        // Create a function to get the next floor ID suggestion
        const getNextFloorId = async () => {
          try {
            // Fetch ALL floor IDs across ALL buildings
            const { data, error } = await supabase.from("floors").select("id")

            if (error) {
              console.error("Error fetching floor IDs:", error)
              return "F1" // Default if there's an error
            }

            if (!data || data.length === 0) {
              return "F1" // First floor
            }

            console.log(`Found ${data.length} total floor IDs across all buildings`)

            // Find the highest numeric value from IDs that follow the pattern 'F{number}'
            let highestNum = 0

            data.forEach((floor) => {
              const id = String(floor.id)
              if (id.startsWith("F")) {
                const numPart = id.substring(1)
                const num = Number.parseInt(numPart, 10)
                if (!isNaN(num) && num > highestNum) {
                  highestNum = num
                }
              }
            })

            console.log(`Highest floor ID number found: F${highestNum}`)
            console.log(`Next floor ID will be: F${highestNum + 1}`)

            // Increment and return the next ID
            return `F${highestNum + 1}`
          } catch (error) {
            console.error("Unexpected error getting next floor ID:", error)
            return "F1" // Default fallback
          }
        }

        // Fetch data in parallel
        const [nextId, buildingsData] = await Promise.all([
          !isEditing ? getNextFloorId() : Promise.resolve(""),
          supabase.from("buildings").select("id, name").order("name"),
        ])

        // Set the next ID if we're not editing
        if (!isEditing && nextId) {
          form.setValue("id", nextId)
        }

        // Handle buildings data
        if (buildingsData.error) {
          console.error("Error fetching buildings:", buildingsData.error)
          setFetchError(buildingsData.error.message)
        } else {
          setBuildings(buildingsData.data || [])
        }
      } catch (error) {
        console.error("Error fetching form data:", error)
        setFetchError("Failed to load form data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isEditing, form])

  // Update the useEffect for setting building_id when buildingId prop changes:
  useEffect(() => {
    if (buildingId && !isEditing) {
      form.setValue("building_id", buildingId)
    }
  }, [buildingId, form, isEditing])

  async function onSubmit(data: FloorFormValues) {
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      let result

      if (isEditing && floor) {
        result = await updateFloor(floor.id, formData)
      } else {
        result = await createFloor(formData)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Floor updated" : "Floor created",
          description: `Successfully ${isEditing ? "updated" : "created"} floor ${data.floor_no}`,
        })

        router.push("/dashboard/kf-supply/manage/floors")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update the handleBuildingChange function:
  const handleBuildingChange = (value: string) => {
    if (value === "ADD_NEW") {
      // When "ADD_NEW" is selected, we'll set building_id to empty string temporarily
      // This will trigger the display of the manual input field
      form.setValue("building_id", "")
    } else {
      form.setValue("building_id", value)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Floor" : "Add New Floor"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update the information for this floor" : "Enter the details to add a new floor to the database"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {fetchError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            Error loading data: {fetchError}. Please try refreshing the page.
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="id">Floor ID *</Label>
              <Input
                id="id"
                {...form.register("id")}
                placeholder={isLoading ? "Loading suggestion..." : "Enter floor ID (e.g., F1, F2)"}
                disabled={isEditing}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase()
                  form.setValue("id", value)
                }}
              />
              {form.formState.errors.id && <p className="text-sm text-red-500">{form.formState.errors.id.message}</p>}
              {!isEditing && (
                <p className="text-xs text-muted-foreground">
                  Suggested ID based on existing floors. You can modify if needed.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="building_id">Building *</Label>
              {isLoading ? (
                <Input disabled placeholder="Loading buildings..." />
              ) : (
                <>
                  <Select
                    disabled={buildingId !== undefined && !isEditing}
                    defaultValue={form.getValues("building_id") || ""}
                    onValueChange={handleBuildingChange}
                  >
                    <SelectTrigger id="building_id" className="w-full">
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.length > 0 ? (
                        <>
                          {buildings.map((building) => (
                            <SelectItem key={building.id} value={String(building.id)}>
                              {building.name} (ID: {building.id})
                            </SelectItem>
                          ))}
                          <SelectItem value="ADD_NEW" className="text-primary font-medium">
                            + Enter Building ID Manually
                          </SelectItem>
                        </>
                      ) : (
                        <SelectItem value="no-buildings" disabled>
                          No buildings found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {(!form.getValues("building_id") || form.getValues("building_id") === "ADD_NEW") && (
                    <div className="mt-2">
                      <Input
                        placeholder="Enter building ID (e.g., B1, B2)"
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase()
                          form.setValue("building_id", value)
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter a valid building ID in the format "B1", "B2", etc.
                      </p>
                    </div>
                  )}
                </>
              )}
              {form.formState.errors.building_id && (
                <p className="text-sm text-red-500">{form.formState.errors.building_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor_no">Floor Number *</Label>
              <Input id="floor_no" type="number" {...form.register("floor_no")} placeholder="Enter floor number" />
              {form.formState.errors.floor_no && (
                <p className="text-sm text-red-500">{form.formState.errors.floor_no.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use negative numbers for basement floors (e.g., -1 for B1)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor_plate">Floor Plate (sq ft) *</Label>
              <Input
                id="floor_plate"
                type="number"
                {...form.register("floor_plate")}
                placeholder="Enter floor plate area"
              />
              {form.formState.errors.floor_plate && (
                <p className="text-sm text-red-500">{form.formState.errors.floor_plate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="no_of_units">Number of Units *</Label>
              <Input
                id="no_of_units"
                type="number"
                {...form.register("no_of_units")}
                placeholder="Enter number of units"
              />
              {form.formState.errors.no_of_units && (
                <p className="text-sm text-red-500">{form.formState.errors.no_of_units.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="efficiency">Efficiency (%) *</Label>
              <Input
                id="efficiency"
                type="number"
                {...form.register("efficiency")}
                placeholder="Enter efficiency percentage"
              />
              {form.formState.errors.efficiency && (
                <p className="text-sm text-red-500">{form.formState.errors.efficiency.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_of_space">Type of Space *</Label>
              <Select
                defaultValue={form.getValues("type_of_space") || "Office"}
                onValueChange={(value) => form.setValue("type_of_space", value)}
              >
                <SelectTrigger id="type_of_space">
                  <SelectValue placeholder="Select type of space" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="F&B">F&B</SelectItem>
                  <SelectItem value="ATM">ATM</SelectItem>
                  <SelectItem value="Mini Anchor">Mini Anchor</SelectItem>
                  <SelectItem value="Retail Banking">Retail Banking</SelectItem>
                  <SelectItem value="Vanilla Store">Vanilla Store</SelectItem>
                  <SelectItem value="Educational">Educational</SelectItem>
                  <SelectItem value="Gym">Gym</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type_of_space && (
                <p className="text-sm text-red-500">{form.formState.errors.type_of_space.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor_plan">Floor Plan URL</Label>
              <Input id="floor_plan" {...form.register("floor_plan")} placeholder="Enter floor plan URL (optional)" />
              {form.formState.errors.floor_plan && (
                <p className="text-sm text-red-500">{form.formState.errors.floor_plan.message}</p>
              )}
              <p className="text-xs text-muted-foreground">URL to an image of the floor plan</p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/kf-supply/manage/floors")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Floor" : "Add Floor"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
