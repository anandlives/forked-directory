"use server"

import { supabase } from "@/lib/supabase"

// Function to fetch floors by building ID
export async function getFloorsByBuildingId(buildingId: string) {
  try {
    console.log(`Fetching floors for building ID: ${buildingId}`)

    const { data, error } = await supabase
      .from("floors")
      .select("id, building_id, floor_no")
      .eq("building_id", buildingId)
      .order("floor_no")

    if (error) {
      console.error("Error fetching floors:", error)
      return { success: false, error: error.message, floors: [] }
    }

    return { success: true, floors: data || [] }
  } catch (error) {
    console.error("Error in getFloorsByBuildingId:", error)
    return { success: false, error: "Failed to fetch floors", floors: [] }
  }
}

// Function to fetch vacant units by floor ID
export async function getUnitsByFloorId(floorId: string) {
  try {
    console.log(`Fetching units for floor ID: ${floorId}`)

    const { data, error } = await supabase
      .from("units")
      .select("id, floor_id, unit_no, status, chargeable_area, carpet_area, premises_condition")
      .eq("floor_id", floorId)
      .eq("status", "Vacant") // Only fetch vacant units
      .order("unit_no")

    if (error) {
      console.error("Error fetching units:", error)
      return { success: false, error: error.message, units: [] }
    }

    return { success: true, units: data || [] }
  } catch (error) {
    console.error("Error in getUnitsByFloorId:", error)
    return { success: false, error: "Failed to fetch units", units: [] }
  }
}
