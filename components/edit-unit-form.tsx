"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { updateUnitAction } from "@/app/actions/edit-unit-actions"
import type { Unit } from "@/types/units"
import type { Floor } from "@/types/floors"

interface EditUnitFormProps {
  unit: Unit
  floor?: Floor & { building_name?: string }
}

const unitSchema = z.object({
  unit_no: z.string().min(1, "Unit number is required"),
  status: z.string().min(1, "Status is required"),
  chargeable_area: z.coerce.number().min(1, "Chargeable area must be greater than 0"),
  carpet_area: z.coerce.number().min(1, "Carpet area must be greater than 0"),
  premises_condition: z.string().optional(),
})

type UnitFormValues = z.infer<typeof unitSchema>

export function EditUnitForm({ unit, floor }: EditUnitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: UnitFormValues = {
    unit_no: unit.unit_no || "",
    status: unit.status || "Vacant",
    chargeable_area: unit.chargeable_area,
    carpet_area: unit.carpet_area,
    premises_condition: unit.premises_condition || "Shell and Core",
  }

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues,
  })

  async function onSubmit(data: UnitFormValues) {
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

      // Pass the ID as a string
      const result = await updateUnitAction(unit.id as string, formData)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Unit updated successfully",
        })

        // Use window.location for full page navigation to avoid React errors
        window.location.href = "/dashboard/kf-supply/manage/units"
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update unit",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error updating unit:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    window.location.href = "/dashboard/kf-supply/manage/units"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Unit</CardTitle>
        <CardDescription>
          Update the information for this unit
          {floor && (
            <span className="block mt-1 text-sm">
              Floor: {floor.floor_no} {floor.building_name ? `(${floor.building_name})` : ""}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="unit_no">Unit Number *</Label>
              <Input id="unit_no" {...form.register("unit_no")} placeholder="Enter unit number" />
              {form.formState.errors.unit_no && (
                <p className="text-sm text-red-500">{form.formState.errors.unit_no.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select defaultValue={form.getValues("status")} onValueChange={(value) => form.setValue("status", value)}>
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
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Unit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
