"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Generate a UUID for unique tenant IDs
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function createMultipleTenants(tenants: any[]) {
  try {
    if (!tenants || tenants.length === 0) {
      return { success: false, error: "No tenants provided" }
    }

    console.log(`Server Action: Creating ${tenants.length} tenants`)

    // Insert all tenants in a single transaction using the admin client
    const { data, error } = await supabaseAdmin.from("tenants").insert(tenants).select()

    if (error) {
      console.error(`Error creating tenants: ${error.message}`)
      return { success: false, error: error.message }
    }

    // Revalidate the tenants page to reflect the changes
    revalidatePath("/dashboard/kf-supply/manage/tenants")

    console.log(`Server Action: Successfully created ${data?.length || 0} tenants`)
    return { success: true, tenants: data }
  } catch (error) {
    console.error("Unexpected error in createMultipleTenants:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function getFloorsByBuildingId(buildingId: string) {
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
    console.error("Error in getFloorsByBuildingId:", error)
    return { success: false, error: "Failed to fetch floors", floors: [] }
  }
}

export async function getUnitsByFloorId(floorId: string) {
  try {
    if (!floorId) {
      return { success: false, error: "Floor ID is required" }
    }

    // Use supabaseAdmin to ensure we can access the data
    const { data, error } = await supabaseAdmin
      .from("units")
      .select("id, unit_no, status, chargeable_area, carpet_area")
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

export async function fetchUnitsByFloorId(floorId: string) {
  try {
    if (!floorId) {
      return { success: false, error: "Floor ID is required" }
    }

    // Use supabaseAdmin to ensure we can access the data
    const { data, error } = await supabaseAdmin
      .from("units")
      .select("id, unit_no, status, chargeable_area, carpet_area")
      .eq("floor_id", floorId)
      .eq("status", "Vacant") // Only fetch vacant units
      .order("unit_no")

    if (error) {
      console.error("Error fetching units:", error)
      return { success: false, error: error.message, units: [] }
    }

    return { success: true, units: data || [] }
  } catch (error) {
    console.error("Error in fetchUnitsByFloorId:", error)
    return { success: false, error: "Failed to fetch units", units: [] }
  }
}

export async function createTenant(formData: FormData) {
  try {
    // Extract form data
    const unitId = formData.get("unit_id") as string

    if (!unitId) {
      return { success: false, error: "Unit ID is required" }
    }

    // Generate a UUID for the tenant ID
    const id = generateUUID()

    // Create tenant object with all fields
    const tenant = {
      id,
      unit_id: unitId,
      name: formData.get("name") as string,
      lease_commencement_date: formData.get("lease_commencement_date") as string,
      primary_industry_sector: (formData.get("primary_industry_sector") as string) || "",
      security_deposit: Number(formData.get("security_deposit")),
      lock_in_period: Number(formData.get("lock_in_period")),
      lock_in_expiry: (formData.get("lock_in_expiry") as string) || "",
      lease_period: Number(formData.get("lease_period")),
      type_of_user: (formData.get("type_of_user") as string) || "",
      lease_expiry: formData.get("lease_expiry") as string,
      escalation: Number(formData.get("escalation")),
      current_rent: Number(formData.get("current_rent")),
      handover_conditions: (formData.get("handover_conditions") as string) || "",
      car_parking_charges: Number(formData.get("car_parking_charges") || 0),
      notice_period: Number(formData.get("notice_period")),
      car_parking_ratio: Number(formData.get("car_parking_ratio") || 0),
      status: formData.get("status") as string,
    }

    console.log("Creating tenant with data:", tenant)

    // Insert the tenant using supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin.from("tenants").insert(tenant).select().single()

    if (error) {
      console.error("Error inserting tenant:", error)
      return { success: false, error: error.message }
    }

    // Update the unit status to "Leased"
    const { error: updateError } = await supabaseAdmin.from("units").update({ status: "Leased" }).eq("id", unitId)

    if (updateError) {
      console.error("Error updating unit status:", updateError)
      // We don't return an error here as the tenant was successfully created
    }

    // Get unit, floor, and building info for path revalidation
    const { data: unitData } = await supabaseAdmin.from("units").select("floor_id").eq("id", unitId).single()

    if (unitData) {
      const { data: floorData } = await supabaseAdmin
        .from("floors")
        .select("building_id")
        .eq("id", unitData.floor_id)
        .single()

      if (floorData) {
        revalidatePath(`/dashboard/buildings/${floorData.building_id}`)
        revalidatePath(`/dashboard/buildings/${floorData.building_id}/dashboard`)
      }
    }

    revalidatePath("/dashboard/kf-supply/manage/tenants")
    revalidatePath("/dashboard/kf-supply")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating tenant:", error)
    return { success: false, error: "Failed to create tenant" }
  }
}
