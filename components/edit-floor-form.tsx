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
import { editFloor } from "@/app/actions/edit-floor-actions"
import type { Floor } from "@/types/floors"

interface EditFloorFormProps {
  floor: Floor
}

// Schema specifically for editing floors
const editFloorSchema = z.object({
  floor_no: z.coerce.number().min(0, "Floor number is required"),
  floor_plate: z.coerce.number().min(1, "Floor plate must be greater than 0"),
  no_of_units: z.coerce.number().min(1, "Number of units must be at least 1"),
  efficiency: z.coerce.number().min(0).max(100, "Efficiency must be between 0 and 100"),
  type_of_space: z.string().min(1, "Type of space is required"),
  floor_plan: z.string().url("Floor plan must be a valid URL").optional().or(z.literal("")),
})

type EditFloorFormValues = z.infer<typeof editFloorSchema>

export function EditFloorForm({ floor }: EditFloorFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set default values from the existing floor data
  const defaultValues: EditFloorFormValues = {
    floor_no: floor.floor_no,
    floor_plate: floor.floor_plate,
    no_of_units: floor.no_of_units,
    efficiency: floor.efficiency,
    type_of_space: floor.type_of_space || "Office",
    floor_plan: floor.floor_plan || "",
  }

  const form = useForm<EditFloorFormValues>({
    resolver: zodResolver(editFloorSchema),
    defaultValues,
  })

  async function onSubmit(data: EditFloorFormValues) {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      // Use a simple approach: submit the form and wait for the result
      const result = await editFloor(floor.id, formData)

      if (result.success) {
        // Show toast before navigation
        toast({
          title: "Floor updated",
          description: `Successfully updated floor ${data.floor_no}`,
        })

        // Use window.location for a full page navigation instead of router.push
        // This avoids React state updates after navigation
        window.location.href = "/dashboard/kf-supply/manage/floors"
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Floor</CardTitle>
        <CardDescription>Update the information for this floor</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => (window.location.href = "/dashboard/kf-supply/manage/floors")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Floor"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
