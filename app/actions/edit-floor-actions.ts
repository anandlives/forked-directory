"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { Floor } from "@/types/floors"

export async function editFloor(id: string, formData: FormData) {
  try {
    console.log(`Editing floor with ID: ${id}`)

    // Extract and validate form data
    const floor = {
      floor_no: Number(formData.get("floor_no")),
      floor_plate: Number(formData.get("floor_plate")),
      no_of_units: Number(formData.get("no_of_units")),
      efficiency: Number(formData.get("efficiency")),
      type_of_space: formData.get("type_of_space") as string,
      floor_plan: formData.get("floor_plan") as string,
    }

    // Validate required fields
    if (!floor.floor_no && floor.floor_no !== 0) {
      return { success: false, error: "Floor number is required" }
    }

    if (!floor.floor_plate) {
      return { success: false, error: "Floor plate is required" }
    }

    if (!floor.no_of_units) {
      return { success: false, error: "Number of units is required" }
    }

    if (!floor.type_of_space) {
      return { success: false, error: "Type of space is required" }
    }

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin.from("floors").update(floor).eq("id", id).select().single()

    if (error) {
      console.error("Error updating floor:", error)
      return { success: false, error: error.message }
    }

    // Get building_id to revalidate the building page
    const { data: floorData } = await supabaseAdmin.from("floors").select("building_id").eq("id", id).single()

    if (floorData) {
      revalidatePath(`/dashboard/buildings/${floorData.building_id}`)
      revalidatePath(`/buildings/${floorData.building_id}`)
    }

    // Revalidate all relevant paths
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/kf-supply")
    revalidatePath("/dashboard/kf-supply/manage")
    revalidatePath("/dashboard/kf-supply/manage/floors")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating floor:", error)
    return { success: false, error: "Failed to update floor" }
  }
}

export async function getFloorById(id: string): Promise<{ floor?: Floor; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.from("floors").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching floor:", error)
      return { error: error.message }
    }

    return { floor: data }
  } catch (error) {
    console.error("Error fetching floor:", error)
    return { error: "Failed to fetch floor" }
  }
}
