"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Generate a UUID for unique unit IDs
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function createMultipleUnits(formData: FormData) {
  try {
    // Extract form data
    const buildingId = formData.get("building_id") as string
    const floorId = formData.get("floor_id") as string
    const unitCount = Number.parseInt(formData.get("unit_count") as string) || 1
    const unitPrefix = (formData.get("unit_prefix") as string) || ""
    const startingNumber = Number.parseInt(formData.get("starting_number") as string) || 1
    const chargeableArea = Number.parseFloat(formData.get("chargeable_area") as string) || 0
    const carpetArea = Number.parseFloat(formData.get("carpet_area") as string) || 0
    const premisesCondition = (formData.get("premises_condition") as string) || "Shell and Core"

    console.log(`Creating ${unitCount} units for floor ${floorId} with starting number ${startingNumber}`)

    // Validate required fields
    if (!floorId) {
      return { success: false, error: "Floor ID is required" }
    }

    // Create units array
    const units = []
    for (let i = 0; i < unitCount; i++) {
      units.push({
        id: generateUUID(), // Generate a UUID for each unit
        floor_id: floorId,
        unit_no: `${unitPrefix}${startingNumber + i}`,
        status: "Vacant",
        chargeable_area: chargeableArea,
        carpet_area: carpetArea,
        premises_condition: premisesCondition,
      })
    }

    console.log(`Prepared ${units.length} units for insertion`)

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin.from("units").insert(units).select()

    if (error) {
      console.error("Error creating units:", error)
      return { success: false, error: error.message }
    }

    // Revalidate paths
    if (buildingId) {
      revalidatePath(`/dashboard/buildings/${buildingId}`)
    }
    revalidatePath("/dashboard/kf-supply/manage/units")
    revalidatePath("/dashboard/kf-supply")

    return { success: true, data }
  } catch (error) {
    console.error("Error in createMultipleUnits:", error)
    return { success: false, error: "Failed to create units" }
  }
}

export async function fetchFloorsByBuildingId(buildingId: string) {
  try {
    if (!buildingId) {
      return { success: false, error: "Building ID is required" }
    }

    // Use supabaseAdmin to ensure we can access the data
    const { data, error } = await supabaseAdmin
      .from("floors")
      .select("id, floor_no, building_id")
      .eq("building_id", buildingId)
      .order("floor_no")

    if (error) {
      console.error("Error fetching floors:", error)
      return { success: false, error: error.message, floors: [] }
    }

    return { success: true, floors: data || [] }
  } catch (error) {
    console.error("Error in fetchFloorsByBuildingId:", error)
    return { success: false, error: "Failed to fetch floors", floors: [] }
  }
}
