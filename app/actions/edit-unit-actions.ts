"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function updateUnitAction(id: string, formData: FormData) {
  try {
    console.log("Updating unit with ID:", id)

    // Extract and validate form data
    const unit_no = formData.get("unit_no") as string
    const status = formData.get("status") as string
    const chargeable_area = Number(formData.get("chargeable_area"))
    const carpet_area = Number(formData.get("carpet_area"))
    const premises_condition = formData.get("premises_condition") as string

    // Validate required fields
    if (!unit_no) {
      return { success: false, error: "Unit number is required" }
    }

    if (!status) {
      return { success: false, error: "Status is required" }
    }

    if (isNaN(chargeable_area) || chargeable_area <= 0) {
      return { success: false, error: "Chargeable area must be a positive number" }
    }

    if (isNaN(carpet_area) || carpet_area <= 0) {
      return { success: false, error: "Carpet area must be a positive number" }
    }

    // Create unit object with validated data
    const unit = {
      unit_no,
      status,
      chargeable_area,
      carpet_area,
      premises_condition: premises_condition || "Shell and Core",
    }

    console.log("Unit data to update:", unit)

    // Update the unit in the database using supabaseAdmin
    const { data, error } = await supabaseAdmin.from("units").update(unit).eq("id", id).select().single()

    if (error) {
      console.error("Error updating unit:", error)
      return { success: false, error: error.message }
    }

    // Get floor and building info for path revalidation
    const { data: unitData } = await supabaseAdmin.from("units").select("floor_id").eq("id", id).single()

    if (unitData) {
      const { data: floorData } = await supabaseAdmin
        .from("floors")
        .select("building_id")
        .eq("id", unitData.floor_id)
        .single()

      if (floorData) {
        revalidatePath(`/dashboard/buildings/${floorData.building_id}`)
      }
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/kf-supply")
    revalidatePath("/dashboard/kf-supply/manage/units")

    console.log("Unit updated successfully:", data)

    return {
      success: true,
      data,
      message: `Unit ${unit_no} updated successfully`,
    }
  } catch (error) {
    console.error("Unexpected error updating unit:", error)
    return {
      success: false,
      error: "An unexpected error occurred while updating the unit",
    }
  }
}
