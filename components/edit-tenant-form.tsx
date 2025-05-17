"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateTenantAction } from "@/app/actions/edit-tenant-actions"
import { useToast } from "@/hooks/use-toast"
import type { Tenant } from "@/types/tenants"

// Define the schema for tenant form validation based on the Tenant interface
const tenantFormSchema = z.object({
  id: z.string(),
  unit_id: z.string().optional(), // Changed from number to string
  name: z.string().min(1, "Tenant name is required"),
  lease_commencement_date: z.string().optional(),
  primary_industry_sector: z.string().optional(),
  security_deposit: z.coerce.number().min(0).optional(),
  lock_in_period: z.coerce.number().min(0).optional(),
  lock_in_expiry: z.string().optional(),
  lease_period: z.coerce.number().min(0).optional(),
  type_of_user: z.string().optional(),
  lease_expiry: z.string().optional(),
  escalation: z.coerce.number().min(0).optional(),
  current_rent: z.coerce.number().min(0).optional(),
  handover_conditions: z.string().optional(),
  car_parking_charges: z.coerce.number().min(0).optional(),
  notice_period: z.coerce.number().min(0).optional(),
  car_parking_ratio: z.coerce.number().min(0).optional(),
  status: z.string().optional(),
})

type TenantFormValues = z.infer<typeof tenantFormSchema>

interface EditTenantFormProps {
  tenant: Tenant
}

export function EditTenantForm({ tenant }: EditTenantFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with tenant data
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      id: String(tenant.id),
      unit_id: tenant.unit_id ? String(tenant.unit_id) : undefined, // Convert to string
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
      status: tenant.status || "",
    },
  })

  const onSubmit = async (data: TenantFormValues) => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      // Call the server action to update the tenant
      const result = await updateTenantAction(data)

      if (result.success) {
        toast({
          title: "Success",
          description: "Tenant updated successfully",
        })

        // Use window.location for full page navigation to avoid React errors
        window.location.href = "/dashboard/kf-supply/manage/tenants"
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update tenant",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    window.location.href = "/dashboard/kf-supply/manage/tenants"
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register("id")} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tenant Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_id">Unit ID</Label>
              <Input id="unit_id" {...register("unit_id")} /> {/* Removed type="number" */}
              {errors.unit_id && <p className="text-sm text-red-500">{errors.unit_id.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lease_commencement_date">Lease Commencement Date</Label>
              <Input id="lease_commencement_date" type="date" {...register("lease_commencement_date")} />
              {errors.lease_commencement_date && (
                <p className="text-sm text-red-500">{errors.lease_commencement_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lease_expiry">Lease Expiry Date</Label>
              <Input id="lease_expiry" type="date" {...register("lease_expiry")} />
              {errors.lease_expiry && <p className="text-sm text-red-500">{errors.lease_expiry.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_rent">Current Rent</Label>
              <Input id="current_rent" type="number" step="0.01" {...register("current_rent")} />
              {errors.current_rent && <p className="text-sm text-red-500">{errors.current_rent.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="security_deposit">Security Deposit</Label>
              <Input id="security_deposit" type="number" step="0.01" {...register("security_deposit")} />
              {errors.security_deposit && <p className="text-sm text-red-500">{errors.security_deposit.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary_industry_sector">Primary Industry Sector</Label>
              <Input id="primary_industry_sector" {...register("primary_industry_sector")} />
              {errors.primary_industry_sector && (
                <p className="text-sm text-red-500">{errors.primary_industry_sector.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_of_user">Type of User</Label>
              <Input id="type_of_user" {...register("type_of_user")} />
              {errors.type_of_user && <p className="text-sm text-red-500">{errors.type_of_user.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="lock_in_period">Lock-in Period (months)</Label>
              <Input id="lock_in_period" type="number" {...register("lock_in_period")} />
              {errors.lock_in_period && <p className="text-sm text-red-500">{errors.lock_in_period.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lock_in_expiry">Lock-in Expiry Date</Label>
              <Input id="lock_in_expiry" type="date" {...register("lock_in_expiry")} />
              {errors.lock_in_expiry && <p className="text-sm text-red-500">{errors.lock_in_expiry.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lease_period">Lease Period (months)</Label>
              <Input id="lease_period" type="number" {...register("lease_period")} />
              {errors.lease_period && <p className="text-sm text-red-500">{errors.lease_period.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="escalation">Escalation (%)</Label>
              <Input id="escalation" type="number" step="0.01" {...register("escalation")} />
              {errors.escalation && <p className="text-sm text-red-500">{errors.escalation.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notice_period">Notice Period (days)</Label>
              <Input id="notice_period" type="number" {...register("notice_period")} />
              {errors.notice_period && <p className="text-sm text-red-500">{errors.notice_period.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" {...register("status")} />
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="car_parking_charges">Car Parking Charges</Label>
              <Input id="car_parking_charges" type="number" step="0.01" {...register("car_parking_charges")} />
              {errors.car_parking_charges && (
                <p className="text-sm text-red-500">{errors.car_parking_charges.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="car_parking_ratio">Car Parking Ratio</Label>
              <Input id="car_parking_ratio" type="number" step="0.01" {...register("car_parking_ratio")} />
              {errors.car_parking_ratio && <p className="text-sm text-red-500">{errors.car_parking_ratio.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="handover_conditions">Handover Conditions</Label>
            <Textarea id="handover_conditions" {...register("handover_conditions")} rows={4} />
            {errors.handover_conditions && <p className="text-sm text-red-500">{errors.handover_conditions.message}</p>}
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Tenant"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
