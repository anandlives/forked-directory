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
import { createTenant, updateTenant } from "@/app/actions/data-operations"
import { supabase } from "@/lib/supabase"
import type { Tenant } from "@/types/tenants"
import type { Unit } from "@/types/units"

interface TenantFormProps {
  tenant?: Tenant
  isEditing?: boolean
  unitId?: number
}

const tenantSchema = z.object({
  unit_id: z.coerce.number().min(1, "Unit is required"),
  name: z.string().min(1, "Tenant name is required"),
  lease_commencement_date: z.string().min(1, "Lease commencement date is required"),
  primary_industry_sector: z.string().optional(),
  security_deposit: z.coerce.number().min(0, "Security deposit must be a positive number"),
  lock_in_period: z.coerce.number().min(0, "Lock-in period must be a positive number"),
  lock_in_expiry: z.string().optional(),
  lease_period: z.coerce.number().min(1, "Lease period must be at least 1 month"),
  type_of_user: z.string().optional(),
  lease_expiry: z.string().min(1, "Lease expiry date is required"),
  escalation: z.coerce.number().min(0, "Escalation must be a positive number"),
  current_rent: z.coerce.number().min(1, "Current rent must be greater than 0"),
  handover_conditions: z.string().optional(),
  car_parking_charges: z.coerce.number().min(0, "Car parking charges must be a positive number"),
  notice_period: z.coerce.number().min(0, "Notice period must be a positive number"),
  car_parking_ratio: z.coerce.number().min(0, "Car parking ratio must be a positive number"),
  status: z.string().min(1, "Status is required"),
})

type TenantFormValues = z.infer<typeof tenantSchema>

export function TenantForm({ tenant, isEditing = false, unitId }: TenantFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [units, setUnits] = useState<(Unit & { building_name: string; floor_no: number })[]>([])

  const defaultValues: Partial<TenantFormValues> = tenant
    ? {
        unit_id: tenant.unit_id,
        name: tenant.name || "",
        lease_commencement_date: tenant.lease_commencement_date || "",
        primary_industry_sector: tenant.primary_industry_sector || "",
        security_deposit: tenant.security_deposit || 0,
        lock_in_period: tenant.lock_in_period || 0,
        lock_in_expiry: tenant.lock_in_expiry || "",
        lease_period: tenant.lease_period || 0,
        type_of_user: tenant.type_of_user || "",
        lease_expiry: tenant.lease_expiry || "",
        escalation: tenant.escalation || 0,
        current_rent: tenant.current_rent || 0,
        handover_conditions: tenant.handover_conditions || "",
        car_parking_charges: tenant.car_parking_charges || 0,
        notice_period: tenant.notice_period || 0,
        car_parking_ratio: tenant.car_parking_ratio || 0,
        status: tenant.status || "Active",
      }
    : {
        unit_id: unitId || 0,
        name: "",
        lease_commencement_date: new Date().toISOString().split("T")[0],
        primary_industry_sector: "",
        security_deposit: 0,
        lock_in_period: 36, // Default 36 months
        lock_in_expiry: "",
        lease_period: 60, // Default 60 months
        type_of_user: "",
        lease_expiry: "",
        escalation: 15, // Default 15%
        current_rent: 0,
        handover_conditions: "",
        car_parking_charges: 0,
        notice_period: 6, // Default 6 months
        car_parking_ratio: 0,
        status: "Active",
      }

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues,
  })

  // Fetch units for the dropdown
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        // Join with floors and buildings to get building names and floor numbers
        const { data, error } = await supabase
          .from("units")
          .select(`*, floors(floor_no, buildings(name))`)
          .eq("status", "Vacant") // Only show vacant units for new tenants
          .order("floor_id")

        if (error) throw error

        // Transform the data to include building_name and floor_no
        const formattedUnits = data.map((unit) => ({
          ...unit,
          building_name: unit.floors?.buildings?.name || "Unknown Building",
          floor_no: unit.floors?.floor_no || 0,
        }))

        // If editing, also fetch the current unit
        if (isEditing && tenant) {
          const { data: currentUnit, error: currentUnitError } = await supabase
            .from("units")
            .select(`*, floors(floor_no, buildings(name))`)
            .eq("id", tenant.unit_id)
            .single()

          if (!currentUnitError && currentUnit) {
            const formattedCurrentUnit = {
              ...currentUnit,
              building_name: currentUnit.floors?.buildings?.name || "Unknown Building",
              floor_no: currentUnit.floors?.floor_no || 0,
            }

            // Add the current unit to the list if it's not already there
            if (!formattedUnits.some((unit) => unit.id === formattedCurrentUnit.id)) {
              formattedUnits.push(formattedCurrentUnit)
            }
          }
        }

        setUnits(formattedUnits)
      } catch (error) {
        console.error("Error fetching units:", error)
        toast({
          title: "Error",
          description: "Failed to load units",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUnits()
  }, [isEditing, tenant])

  // Set unit_id when unitId prop changes
  useEffect(() => {
    if (unitId && !isEditing) {
      form.setValue("unit_id", unitId)
    }
  }, [unitId, form, isEditing])

  // Calculate lock_in_expiry and lease_expiry when lease_commencement_date, lock_in_period, or lease_period changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "lease_commencement_date" || name === "lock_in_period" || name === "lease_period") {
        const commencementDate = value.lease_commencement_date
        const lockInPeriod = value.lock_in_period
        const leasePeriod = value.lease_period

        if (commencementDate && lockInPeriod) {
          const lockInExpiryDate = new Date(commencementDate)
          lockInExpiryDate.setMonth(lockInExpiryDate.getMonth() + Number(lockInPeriod))
          form.setValue("lock_in_expiry", lockInExpiryDate.toISOString().split("T")[0])
        }

        if (commencementDate && leasePeriod) {
          const leaseExpiryDate = new Date(commencementDate)
          leaseExpiryDate.setMonth(leaseExpiryDate.getMonth() + Number(leasePeriod))
          form.setValue("lease_expiry", leaseExpiryDate.toISOString().split("T")[0])
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

  async function onSubmit(data: TenantFormValues) {
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

      if (isEditing && tenant) {
        result = await updateTenant(tenant.id, formData)
      } else {
        result = await createTenant(formData)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Tenant updated" : "Tenant created",
          description: `Successfully ${isEditing ? "updated" : "created"} tenant ${data.name}`,
        })

        router.push("/dashboard/kf-supply/manage/tenants")
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
        <CardTitle>{isEditing ? "Edit Tenant" : "Add New Tenant"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the information for this tenant"
            : "Enter the details to add a new tenant to the database"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="unit_id">Unit *</Label>
              <Select
                disabled={isLoading || (unitId !== undefined && !isEditing)}
                defaultValue={String(form.getValues("unit_id") || "")}
                onValueChange={(value) => form.setValue("unit_id", Number(value))}
              >
                <SelectTrigger id="unit_id">
                  <SelectValue placeholder={isLoading ? "Loading units..." : "Select unit"} />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={String(unit.id)}>
                      {unit.building_name} - Floor {unit.floor_no} - Unit {unit.unit_no} (ID: {unit.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.unit_id && (
                <p className="text-sm text-red-500">{form.formState.errors.unit_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tenant Name *</Label>
              <Input id="name" {...form.register("name")} placeholder="Enter tenant name" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_industry_sector">Industry Sector</Label>
              <Select
                defaultValue={form.getValues("primary_industry_sector") || ""}
                onValueChange={(value) => form.setValue("primary_industry_sector", value)}
              >
                <SelectTrigger id="primary_industry_sector">
                  <SelectValue placeholder="Select industry sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT/ITES">IT/ITES</SelectItem>
                  <SelectItem value="BFSI">BFSI</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_of_user">Type of User</Label>
              <Select
                defaultValue={form.getValues("type_of_user") || ""}
                onValueChange={(value) => form.setValue("type_of_user", value)}
              >
                <SelectTrigger id="type_of_user">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India Facing">India Facing</SelectItem>
                  <SelectItem value="GCC">GCC</SelectItem>
                  <SelectItem value="IT/ITeS">IT/ITeS</SelectItem>
                  <SelectItem value="Flex">Flex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lease_commencement_date">Lease Commencement Date *</Label>
              <Input id="lease_commencement_date" type="date" {...form.register("lease_commencement_date")} />
              {form.formState.errors.lease_commencement_date && (
                <p className="text-sm text-red-500">{form.formState.errors.lease_commencement_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lease_period">Lease Period (months) *</Label>
              <Input
                id="lease_period"
                type="number"
                {...form.register("lease_period")}
                placeholder="Enter lease period in months"
              />
              {form.formState.errors.lease_period && (
                <p className="text-sm text-red-500">{form.formState.errors.lease_period.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lease_expiry">Lease Expiry Date *</Label>
              <Input id="lease_expiry" type="date" {...form.register("lease_expiry")} readOnly />
              {form.formState.errors.lease_expiry && (
                <p className="text-sm text-red-500">{form.formState.errors.lease_expiry.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Auto-calculated based on commencement date and lease period
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lock_in_period">Lock-in Period (months) *</Label>
              <Input
                id="lock_in_period"
                type="number"
                {...form.register("lock_in_period")}
                placeholder="Enter lock-in period in months"
              />
              {form.formState.errors.lock_in_period && (
                <p className="text-sm text-red-500">{form.formState.errors.lock_in_period.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lock_in_expiry">Lock-in Expiry Date</Label>
              <Input id="lock_in_expiry" type="date" {...form.register("lock_in_expiry")} readOnly />
              <p className="text-xs text-muted-foreground">
                Auto-calculated based on commencement date and lock-in period
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_rent">Current Rent (₹/sq ft) *</Label>
              <Input
                id="current_rent"
                type="number"
                step="0.01"
                {...form.register("current_rent")}
                placeholder="Enter current rent per sq ft"
              />
              {form.formState.errors.current_rent && (
                <p className="text-sm text-red-500">{form.formState.errors.current_rent.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="escalation">Escalation (%) *</Label>
              <Input
                id="escalation"
                type="number"
                step="0.01"
                {...form.register("escalation")}
                placeholder="Enter escalation percentage"
              />
              {form.formState.errors.escalation && (
                <p className="text-sm text-red-500">{form.formState.errors.escalation.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="security_deposit">Security Deposit (months) *</Label>
              <Input
                id="security_deposit"
                type="number"
                step="0.01"
                {...form.register("security_deposit")}
                placeholder="Enter security deposit in months of rent"
              />
              {form.formState.errors.security_deposit && (
                <p className="text-sm text-red-500">{form.formState.errors.security_deposit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notice_period">Notice Period (months) *</Label>
              <Input
                id="notice_period"
                type="number"
                {...form.register("notice_period")}
                placeholder="Enter notice period in months"
              />
              {form.formState.errors.notice_period && (
                <p className="text-sm text-red-500">{form.formState.errors.notice_period.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="car_parking_ratio">Car Parking Ratio</Label>
              <Input
                id="car_parking_ratio"
                type="number"
                step="0.01"
                {...form.register("car_parking_ratio")}
                placeholder="Enter car parking ratio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="car_parking_charges">Car Parking Charges (₹)</Label>
              <Input
                id="car_parking_charges"
                type="number"
                step="0.01"
                {...form.register("car_parking_charges")}
                placeholder="Enter car parking charges"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="handover_conditions">Handover Conditions</Label>
              <Input
                id="handover_conditions"
                {...form.register("handover_conditions")}
                placeholder="Enter handover conditions"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                defaultValue={form.getValues("status") || "Active"}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Renewal">Renewal</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/kf-supply/manage/tenants")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Tenant" : "Add Tenant"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
