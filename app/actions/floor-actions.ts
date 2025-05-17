"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Generate a UUID for unique floor IDs
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Make sure the server action returns a proper success response
export async function createMultipleFloors(floors: any[]) {
  try {
    // Ensure we're using the admin client with service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not defined")
      return { success: false, error: "Server configuration error", status: 500 }
    }

    // Ensure each floor has an ID and handle floor_plan
    const floorsWithIds = floors.map((floor) => ({
      ...floor,
      id: floor.id || generateUUID(),
      floor_plan: floor.floor_plan || "", // Ensure floor_plan is included
    }))

    console.log("Creating floors with service role key:", floorsWithIds)

    // Use supabaseAdmin to bypass RLS
    const { data, error, status } = await supabaseAdmin.from("floors").insert(floorsWithIds).select()

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, error: error.message, status: status || 500 }
    }

    // Revalidate paths
    if (floorsWithIds.length > 0) {
      revalidatePath(`/dashboard/buildings/${floorsWithIds[0].building_id}`)
    }
    revalidatePath("/dashboard/kf-supply")

    return { success: true, data, status: 201 }
  } catch (error) {
    console.error("Error creating multiple floors:", error)
    return { success: false, error: "Failed to create floors", status: 500 }
  }
}
