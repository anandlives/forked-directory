"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import type { Building } from "@/types/buildings"
import { Plus, Trash2 } from "lucide-react"
import { createMultipleFloors } from "@/app/actions/data-operations" // Import the server action

// Generate a UUID for unique floor IDs
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Schema for a single floor
const floorSchema = z.object({
  id: z.string(),
  building_id: z.string().min(1, "Building is required"),
  floor_no: z.coerce.number().min(-10, "Floor number must be greater than -10"),
  floor_plate: z.coerce.number().min(0, "Floor plate must be a positive number"),
  no_of_units: z.coerce.number().min(0, "Number of units must be a positive number"),
  efficiency: z.coerce.number().min(0).max(100, "Efficiency must be between 0 and 100"),
  type_of_space: z.string().min(1, "Type of space is required"),
  floor_plan: z.string().url("Floor plan must be a valid URL").optional().or(z.literal("")),
})

// Schema for the entire form with multiple floors
const multiFloorSchema = z.object({
  building_id: z.string().min(1, "Building is required"),
  floors: z.array(floorSchema).min(1, "At least one floor is required"),
})

type FloorValues = z.infer<typeof floorSchema>
type MultiFloorValues = z.infer<typeof multiFloorSchema>

// Update the component props to accept initialBuildings
interface MultiFloorFormProps {
  initialBuildings?: Building[]
}

export function MultiFloorForm({ initialBuildings = [] }: MultiFloorFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings)
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)

  // Initialize form with default values
  const form = useForm<MultiFloorValues>({
    resolver: zodResolver(multiFloorSchema),
    defaultValues: {
      building_id: "",
      floors: [
        {
          id: generateUUID(),
          building_id: "",
          floor_no: 1,
          floor_plate: 0,
          no_of_units: 0,
          efficiency: 70,
          type_of_space: "Office",
          floor_plan: "",
        },
      ],
    },
  })

  // Setup field array for managing multiple floors
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "floors",
  })

  // Fetch buildings and next floor ID on component mount
  // Update the useEffect to use initialBuildings if available
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // If we already have buildings from props, skip fetching them
        if (initialBuildings.length === 0) {
          // const buildingsResponse = await supabase.from("buildings").select("id, name").order("name")
          //
          // if (buildingsResponse.error) {
          //   console.error("Error fetching buildings:", buildingsResponse.error)
          //   throw new Error(buildingsResponse.error.message)
          // }
          //
          // setBuildings(buildingsResponse.data || [])
          setBuildings([])
        }

        // No need to fetch floor IDs anymore since we're using UUIDs
        console.log("Using UUID generation for floor IDs")
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [initialBuildings])

  // Update building_id for all floors when the main building is selected
  const handleBuildingChange = async (value: string) => {
    form.setValue("building_id", value)

    // Update building_id for all floors
    const currentFloors = form.getValues("floors")
    currentFloors.forEach((_, index) => {
      form.setValue(`floors.${index}.building_id`, value)
    })

    // Find the selected building
    const building = buildings.find((b) => b.id === value)
    setSelectedBuilding(building || null)
  }

  // Update the addFloor function to ensure it correctly increments IDs
  // Replace the existing addFloor function with this improved version:

  // Add a new floor
  const addFloor = () => {
    const currentFloors = form.getValues("floors")
    const lastFloorNo = currentFloors.length > 0 ? currentFloors[currentFloors.length - 1].floor_no + 1 : 1

    // Generate a UUID for the new floor
    const floorId = generateUUID()
    console.log(`Adding new floor with UUID: ${floorId}`)

    append({
      id: floorId,
      building_id: form.getValues("building_id"),
      floor_no: lastFloorNo,
      floor_plate: 0,
      no_of_units: 0,
      efficiency: 70,
      type_of_space: "Office",
      floor_plan: "",
    })
  }

  // Submit the form
  const onSubmit = async (data: MultiFloorValues) => {
    setIsSubmitting(true)

    try {
      console.log("Submitting floors with the following IDs:")
      data.floors.forEach((floor, index) => {
        console.log(`Floor ${index + 1}: ID=${floor.id}, Floor No=${floor.floor_no}`)
      })

      // Use the server action to create multiple floors
      const result = await createMultipleFloors(data.floors)

      if (!result.success) {
        throw new Error(result.error || "Failed to add floors")
      }

      // Show success message
      toast({
        title: "Success",
        description: `Successfully added ${data.floors.length} floors to ${selectedBuilding?.name || "the building"}`,
      })

      // Add a small delay before redirecting to ensure the toast is visible
      setTimeout(() => {
        router.push("/dashboard/kf-supply/manage/floors")
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error submitting floors:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add floors",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="building_id" className="text-base font-semibold">
          Building *
        </Label>
        <Select disabled={isLoading} value={form.watch("building_id")} onValueChange={handleBuildingChange}>
          <SelectTrigger id="building_id" className="w-full">
            <SelectValue placeholder="Select a building" />
          </SelectTrigger>
          <SelectContent>
            {buildings.length > 0 ? (
              buildings.map((building) => (
                <SelectItem key={building.id} value={building.id}>
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

      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Floor {form.watch(`floors.${index}.floor_no`)}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {form.watch(`floors.${index}.floor_plate`)} sq ft | {form.watch(`floors.${index}.no_of_units`)}{" "}
                    units | {form.watch(`floors.${index}.efficiency`)}% efficiency
                  </span>
                  <span className="font-medium">{form.watch(`floors.${index}.type_of_space`)}</span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`floors.${index}.floor_no`}>Floor Number *</Label>
                  <Input
                    id={`floors.${index}.floor_no`}
                    type="number"
                    {...form.register(`floors.${index}.floor_no` as const, { valueAsNumber: true })}
                  />
                  {form.formState.errors.floors?.[index]?.floor_no && (
                    <p className="text-sm text-red-500">{form.formState.errors.floors[index]?.floor_no?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`floors.${index}.floor_plate`}>Floor Plate (sq ft) *</Label>
                  <Input
                    id={`floors.${index}.floor_plate`}
                    type="number"
                    {...form.register(`floors.${index}.floor_plate` as const, { valueAsNumber: true })}
                  />
                  {form.formState.errors.floors?.[index]?.floor_plate && (
                    <p className="text-sm text-red-500">{form.formState.errors.floors[index]?.floor_plate?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`floors.${index}.no_of_units`}>Number of Units *</Label>
                  <Input
                    id={`floors.${index}.no_of_units`}
                    type="number"
                    {...form.register(`floors.${index}.no_of_units` as const, { valueAsNumber: true })}
                  />
                  {form.formState.errors.floors?.[index]?.no_of_units && (
                    <p className="text-sm text-red-500">{form.formState.errors.floors[index]?.no_of_units?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`floors.${index}.efficiency`}>Efficiency (%) *</Label>
                  <Input
                    id={`floors.${index}.efficiency`}
                    type="number"
                    {...form.register(`floors.${index}.efficiency` as const, { valueAsNumber: true })}
                  />
                  {form.formState.errors.floors?.[index]?.efficiency && (
                    <p className="text-sm text-red-500">{form.formState.errors.floors[index]?.efficiency?.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-4">
                  <Label htmlFor={`floors.${index}.type_of_space`}>Type of Space *</Label>
                  <Select
                    value={form.watch(`floors.${index}.type_of_space`)}
                    onValueChange={(value) => form.setValue(`floors.${index}.type_of_space`, value)}
                  >
                    <SelectTrigger id={`floors.${index}.type_of_space`}>
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
                  {form.formState.errors.floors?.[index]?.type_of_space && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.floors[index]?.type_of_space?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-4">
                  <Label htmlFor={`floors.${index}.floor_plan`}>Floor Plan URL</Label>
                  <Input
                    id={`floors.${index}.floor_plan`}
                    {...form.register(`floors.${index}.floor_plan` as const)}
                    placeholder="Enter floor plan URL (optional)"
                  />
                  {form.formState.errors.floors?.[index]?.floor_plan && (
                    <p className="text-sm text-red-500">{form.formState.errors.floors[index]?.floor_plan?.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">URL to an image of the floor plan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full py-6 border-dashed"
          onClick={addFloor}
          disabled={!form.watch("building_id")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Floor
        </Button>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/kf-supply/manage/floors")}>
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting || isLoading}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
