"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase"
import { z } from "zod"

// Define the schema for tenant update validation based on the Tenant interface
const updateTenantSchema = z.object({
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

export type UpdateTenantFormData = z.infer<typeof updateTenantSchema>

export async function updateTenantAction(formData: UpdateTenantFormData) {
  try {
    // Validate the form data
    const validatedData = updateTenantSchema.parse(formData)

    // Update the tenant in the database
    const { data, error } = await supabaseAdmin
      .from("tenants")
      .update({
        unit_id: validatedData.unit_id,
        name: validatedData.name,
        lease_commencement_date: validatedData.lease_commencement_date,
        primary_industry_sector: validatedData.primary_industry_sector,
        security_deposit: validatedData.security_deposit,
        lock_in_period: validatedData.lock_in_period,
        lock_in_expiry: validatedData.lock_in_expiry,
        lease_period: validatedData.lease_period,
        type_of_user: validatedData.type_of_user,
        lease_expiry: validatedData.lease_expiry,
        escalation: validatedData.escalation,
        current_rent: validatedData.current_rent,
        handover_conditions: validatedData.handover_conditions,
        car_parking_charges: validatedData.car_parking_charges,
        notice_period: validatedData.notice_period,
        car_parking_ratio: validatedData.car_parking_ratio,
        status: validatedData.status,
      })
      .eq("id", validatedData.id)
      .select()

    if (error) {
      console.error("Error updating tenant:", error)
      return {
        success: false,
        message: `Failed to update tenant: ${error.message}`,
        error: error,
      }
    }

    // Revalidate related paths to update the UI
    revalidatePath("/dashboard/kf-supply/manage/tenants")
    revalidatePath(`/dashboard/kf-supply/edit/tenant/${validatedData.id}`)
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Tenant updated successfully",
      tenant: data[0],
    }
  } catch (error) {
    console.error("Error in updateTenantAction:", error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors,
      }
    }

    return {
      success: false,
      message: "An unexpected error occurred",
      error: error,
    }
  }
}
