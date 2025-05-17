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
import { createUnit, updateUnit } from "@/app/actions/data-operations"
import { supabase } from "@/lib/supabase"
import type { Unit } from "@/types/units"
import type { Floor } from "@/types/floors"

interface UnitFormProps {
  unit?: Unit
  isEditing?: boolean
  floorId?: number
}

const unitSchema = z.object({
  floor_id: z.coerce.number().min(1, "Floor is required"),
  unit_no: z.string().min(1, "Unit number is required"),
  status: z.string().min(1, "Status is required"),
  chargeable_area: z.coerce.number().min(1, "Chargeable area must be greater than 0"),
  carpet_area: z.coerce.number().min(1, "Carpet area must be greater than 0"),
  premises_condition: z.string().optional(),
})

type UnitFormValues = z.infer<typeof unitSchema>

export function UnitForm({ unit, isEditing = false, floorId }: UnitFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [floors, setFloors] = useState<(Floor & { building_name: string })[]>([])

  const defaultValues: Partial<UnitFormValues> = unit
    ? {
        floor_id: unit.floor_id,
        unit_no: unit.unit_no || "",
        status: unit.status || "Vacant",
        chargeable_area: unit.chargeable_area,
        carpet_area: unit.carpet_area,
        premises_condition: unit.premises_condition || "",
      }
    : {
        floor_id: floorId || 0,
        unit_no: "",
        status: "Vacant",
        chargeable_area: 0,
        carpet_area: 0,
        premises_condition: "Shell and Core",
      }

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues,
  })

  // Fetch floors for the dropdown
  useEffect(() => {
    const fetchFloors = async () => {
      try {
        // Join with buildings to get building names
        const { data, error } = await supabase
          .from("floors")
          .select(`*, buildings(name)`)
          .order("building_id")
          .order("floor_no")

        if (error) throw error

        // Transform the data to include building_name
        const formattedFloors = data.map((floor) => ({
          ...floor,
          building_name: floor.buildings?.name || "Unknown Building",
        }))

        setFloors(formattedFloors)
      } catch (error) {
        console.error("Error fetching floors:", error)
        toast({
          title: "Error",
          description: "Failed to load floors",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFloors()
  }, [])

  // Set floor_id when floorId prop changes
  useEffect(() => {
    if (floorId && !isEditing) {
      form.setValue("floor_id", floorId)
    }
  }, [floorId, form, isEditing])

  async function onSubmit(data: UnitFormValues) {
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

      if (isEditing && unit) {
        result = await updateUnit(unit.id, formData)
      } else {
        result = await createUnit(formData)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Unit updated" : "Unit created",
          description: `Successfully ${isEditing ? "updated" : "created"} unit ${data.unit_no}`,
        })

        router.push("/dashboard/kf-supply/manage/units")
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Unit" : "Add New Unit"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update the information for this unit" : "Enter the details to add a new unit to the database"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="floor_id">Floor *</Label>
              <Select
                disabled={isLoading || (floorId !== undefined && !isEditing)}
                defaultValue={String(form.getValues("floor_id") || "")}
                onValueChange={(value) => form.setValue("floor_id", Number(value))}
              >
                <SelectTrigger id="floor_id">
                  <SelectValue placeholder={isLoading ? "Loading floors..." : "Select floor"} />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor) => (
                    <SelectItem key={floor.id} value={String(floor.id)}>
                      {floor.building_name} - Floor {floor.floor_no} (ID: {floor.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.floor_id && (
                <p className="text-sm text-red-500">{form.formState.errors.floor_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_no">Unit Number *</Label>
              <Input id="unit_no" {...form.register("unit_no")} placeholder="Enter unit number" />
              {form.formState.errors.unit_no && (
                <p className="text-sm text-red-500">{form.formState.errors.unit_no.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                defaultValue={form.getValues("status") || "Vacant"}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vacant">Vacant</SelectItem>
                  <SelectItem value="Leased">Leased</SelectItem>
                  <SelectItem value="Purchased">Purchased</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="chargeable_area">Chargeable Area (sq ft) *</Label>
              <Input
                id="chargeable_area"
                type="number"
                {...form.register("chargeable_area")}
                placeholder="Enter chargeable area"
              />
              {form.formState.errors.chargeable_area && (
                <p className="text-sm text-red-500">{form.formState.errors.chargeable_area.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="carpet_area">Carpet Area (sq ft) *</Label>
              <Input id="carpet_area" type="number" {...form.register("carpet_area")} placeholder="Enter carpet area" />
              {form.formState.errors.carpet_area && (
                <p className="text-sm text-red-500">{form.formState.errors.carpet_area.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="premises_condition">Premises Condition</Label>
              <Select
                defaultValue={form.getValues("premises_condition") || "Shell and Core"}
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

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/kf-supply/manage/units")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Unit" : "Add Unit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
