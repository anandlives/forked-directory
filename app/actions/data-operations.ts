"use server"

import { supabase, supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Generate a UUID for unique floor IDs
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Building CRUD operations
export async function createBuilding(formData: FormData) {
  try {
    const building = {
      id: (formData.get("id") as string).toUpperCase(),
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      micromarket_zone: formData.get("micromarket_zone") as string,
      building_structure: formData.get("building_structure") as string,
      building_title: formData.get("building_title") as string,
      grade: formData.get("grade") as string,
      total_area: Number(formData.get("total_area")),
      certifications: formData.get("certifications") as string,
      google_coordinates: formData.get("google_coordinates") as string,
      cam: Number(formData.get("cam") || 0),
      year_built: Number(formData.get("year_built")),
      construction_status: formData.get("construction_status") as string,
      building_status: formData.get("building_status") as string,
      building_image_link: formData.get("building_image_link") as string,
      developer_id: (formData.get("developer_id") as string).toUpperCase(),
    }

    // Validate that id is provided
    if (!building.id) {
      return { success: false, error: "Building ID is required", status: 400 }
    }

    // Ensure we're using the admin client with service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not defined")
      return { success: false, error: "Server configuration error", status: 500 }
    }

    // Use supabaseAdmin to bypass RLS
    const { data, error, status } = await supabaseAdmin.from("buildings").insert(building).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, error: error.message, status: status || 500 }
    }

    revalidatePath("/dashboard/kf-supply")
    revalidatePath("/dashboard")

    return { success: true, data, status: 201 }
  } catch (error) {
    console.error("Error creating building:", error)
    return { success: false, error: "Failed to create building", status: 500 }
  }
}

// Also update the other functions to use supabaseAdmin
export async function updateBuilding(id: number, formData: FormData) {
  try {
    const building = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      micromarket_zone: formData.get("micromarket_zone") as string,
      building_structure: formData.get("building_structure") as string,
      building_title: formData.get("building_title") as string,
      grade: formData.get("grade") as string,
      total_area: Number(formData.get("total_area")),
      certifications: formData.get("certifications") as string,
      google_coordinates: formData.get("google_coordinates") as string,
      cam: Number(formData.get("cam") || 0),
      year_built: Number(formData.get("year_built")),
      construction_status: formData.get("construction_status") as string,
      building_status: formData.get("building_status") as string,
      building_image_link: formData.get("building_image_link") as string,
    }

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin.from("buildings").update(building).eq("id", id).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/buildings/${id}`)
    revalidatePath("/dashboard/kf-supply")
    revalidatePath("/dashboard")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating building:", error)
    return { success: false, error: "Failed to update building" }
  }
}

export async function deleteBuilding(id: number) {
  try {
    // First, we need to delete all related floors, units, tenants, and vacant spaces
    // Get all floors related to this building
    const { data: floors } = await supabaseAdmin.from("floors").select("id").eq("building_id", id)

    if (floors && floors.length > 0) {
      const floorIds = floors.map((f) => f.id)

      // Get all units related to these floors
      const { data: units } = await supabaseAdmin.from("units").select("id").in("floor_id", floorIds)

      if (units && units.length > 0) {
        const unitIds = units.map((u) => u.id)

        // Delete all vacant spaces and tenants related to these units
        await Promise.all([
          supabaseAdmin.from("vacant_spaces").delete().in("unit_id", unitIds),
          supabaseAdmin.from("tenants").delete().in("unit_id", unitIds),
        ])

        // Delete all units
        await supabaseAdmin.from("units").delete().in("floor_id", floorIds)
      }

      // Delete all floors
      await supabaseAdmin.from("floors").delete().eq("building_id", id)
    }

    // Finally, delete the building
    const { error } = await supabaseAdmin.from("buildings").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/kf-supply")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error deleting building:", error)
    return { success: false, error: "Failed to delete building" }
  }
}

// Floor CRUD operations
// Update the createFloor function to handle the id field
export async function createFloor(formData: FormData) {
  try {
    const floor = {
      id: (formData.get("id") as string) || generateUUID(), // Use UUID if no ID is provided
      building_id: formData.get("building_id") as string,
      floor_no: Number(formData.get("floor_no")),
      floor_plate: Number(formData.get("floor_plate")),
      no_of_units: Number(formData.get("no_of_units")),
      efficiency: Number(formData.get("efficiency")),
      type_of_space: formData.get("type_of_space") as string,
      floor_plan: formData.get("floor_plan") as string,
    }

    // Validate that building_id is provided
    if (!floor.building_id) {
      return { success: false, error: "Building ID is required" }
    }

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin.from("floors").insert(floor).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/buildings/${floor.building_id}`)
    revalidatePath("/dashboard/kf-supply")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating floor:", error)
    return { success: false, error: "Failed to create floor" }
  }
}

// Also update the updateFloor function to handle string IDs:

export async function updateFloor(id: string, formData: FormData) {
  try {
    const floor = {
      floor_no: Number(formData.get("floor_no")),
      floor_plate: Number(formData.get("floor_plate")),
      no_of_units: Number(formData.get("no_of_units")),
      efficiency: Number(formData.get("efficiency")),
      type_of_space: formData.get("type_of_space") as string,
      floor_plan: formData.get("floor_plan") as string,
    }

    const { data, error } = await supabaseAdmin.from("floors").update(floor).eq("id", id).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Get building_id to revalidate the building page
    const { data: floorData } = await supabase.from("floors").select("building_id").eq("id", id).single()

    if (floorData) {
      revalidatePath(`/dashboard/buildings/${floorData.building_id}`)
    }

    revalidatePath("/dashboard/kf-supply")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating floor:", error)
    return { success: false, error: "Failed to update floor" }
  }
}

// Update the deleteFloor function to handle string IDs:

export async function deleteFloor(id: string) {
  try {
    // First get the building_id for path revalidation
    const { data: floorData } = await supabase.from("floors").select("building_id").eq("id", id).single()

    // Get all units related to this floor
    const { data: units } = await supabaseAdmin.from("units").select("id").eq("floor_id", id)

    if (units && units.length > 0) {
      const unitIds = units.map((u) => u.id)

      // Delete all vacant spaces and tenants related to these units
      await Promise.all([
        supabaseAdmin.from("vacant_spaces").delete().in("unit_id", unitIds),
        supabaseAdmin.from("tenants").delete().in("unit_id", unitIds),
      ])

      // Delete all units
      await supabaseAdmin.from("units").delete().eq("floor_id", id)
    }

    // Delete the floor
    const { error } = await supabaseAdmin.from("floors").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    if (floorData) {
      revalidatePath(`/dashboard/buildings/${floorData.building_id}`)
    }

    revalidatePath("/dashboard/kf-supply")

    return { success: true }
  } catch (error) {
    console.error("Error deleting floor:", error)
    return { success: false, error: "Failed to delete floor" }
  }
}

// Add this new function to handle multiple floor insertions
export async function createMultipleFloors(floors: any[]) {
  try {
    // Ensure we're using the admin client with service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not defined")
      return { success: false, error: "Server configuration error" }
    }

    // Ensure each floor has an ID
    const floorsWithIds = floors.map((floor) => ({
      ...floor,
      id: floor.id || generateUUID(),
    }))

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin.from("floors").insert(floorsWithIds).select()

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, error: error.message }
    }

    // Revalidate paths
    if (floorsWithIds.length > 0) {
      revalidatePath(`/dashboard/buildings/${floorsWithIds[0].building_id}`)
    }
    revalidatePath("/dashboard/kf-supply")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating multiple floors:", error)
    return { success: false, error: "Failed to create floors" }
  }
}

// Unit CRUD operations
export async function createUnit(formData: FormData) {
  try {
    const unit = {
      floor_id: Number(formData.get("floor_id")),
      unit_no: formData.get("unit_no") as string,
      status: formData.get("status") as string,
      chargeable_area: Number(formData.get("chargeable_area")),
      carpet_area: Number(formData.get("carpet_area")),
      premises_condition: formData.get("premises_condition") as string,
    }

    const { data, error } = await supabaseAdmin.from("units").insert(unit).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Get floor and building info for path revalidation
    const { data: floorData } = await supabase.from("floors").select("building_id").eq("id", unit.floor_id).single()

    if (floorData) {
      revalidatePath(`/dashboard/buildings/${floorData.building_id}`)
    }

    revalidatePath("/dashboard/kf-supply")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating unit:", error)
    return { success: false, error: "Failed to create unit" }
  }
}

export async function updateUnit(id: number, formData: FormData) {
  try {
    const unit = {
      unit_no: formData.get("unit_no") as string,
      status: formData.get("status") as string,
      chargeable_area: Number(formData.get("chargeable_area")),
      carpet_area: Number(formData.get("carpet_area")),
      premises_condition: formData.get("premises_condition") as string,
    }

    const { data, error } = await supabaseAdmin.from("units").update(unit).eq("id", id).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Get floor and building info for path revalidation
    const { data: unitData } = await supabase.from("units").select("floor_id").eq("id", id).single()

    if (unitData) {
      const { data: floorData } = await supabase
        .from("floors")
        .select("building_id")
        .eq("id", unitData.floor_id)
        .single()

      if (floorData) {
        revalidatePath(`/dashboard/buildings/${floorData.building_id}`)
      }
    }

    revalidatePath("/dashboard/kf-supply")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating unit:", error)
    return { success: false, error: "Failed to update unit" }
  }
}

export async function deleteUnit(id: number) {
  try {
    // First get the floor_id and building_id for path revalidation
    const { data: unitData } = await supabase.from("units").select("floor_id").eq("id", id).single()

    let buildingId: number | null = null

    if (unitData) {
      const { data: floorData } = await supabase
        .from("floors")
        .select("building_id")
        .eq("id", unitData.floor_id)
        .single()

      if (floorData) {
        buildingId = floorData.building_id
      }
    }

    // Delete all vacant spaces and tenants related to this unit
    await Promise.all([
      supabaseAdmin.from("vacant_spaces").delete().eq("unit_id", id),
      supabaseAdmin.from("tenants").delete().eq("unit_id", id),
    ])

    // Delete the unit
    const { error } = await supabaseAdmin.from("units").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    if (buildingId) {
      revalidatePath(`/dashboard/buildings/${buildingId}`)
    }

    revalidatePath("/dashboard/kf-supply")

    return { success: true }
  } catch (error) {
    console.error("Error deleting unit:", error)
    return { success: false, error: "Failed to delete unit" }
  }
}

// Tenant CRUD operations
// Update the createTenant function to handle UUID strings for unit_id
export async function createTenant(formData: FormData) {
  try {
    // Log all form data entries to debug
    console.log("Form data entries:")
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }

    // Get the unit_id directly
    const unitId = formData.get("unit_id")
    console.log("unit_id from FormData:", unitId)

    if (!unitId) {
      console.error("No unit_id found in form data")
      return { success: false, error: "Unit ID is required" }
    }

    // Generate a UUID for the tenant ID
    const id = generateUUID()

    // Create tenant object with all fields
    const tenant = {
      id,
      unit_id: unitId, // Use the unit_id as is, without conversion
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

    // Insert the tenant
    const { data, error } = await supabaseAdmin.from("tenants").insert(tenant).select().single()

    if (error) {
      console.error("Error inserting tenant:", error)
      return { success: false, error: error.message }
    }

    // Get unit, floor, and building info for path revalidation
    const { data: unitData } = await supabase.from("units").select("floor_id").eq("id", unitId).single()

    if (unitData) {
      const { data: floorData } = await supabase
        .from("floors")
        .select("building_id")
        .eq("id", unitData.floor_id)
        .single()

      if (floorData) {
        revalidatePath(`/dashboard/buildings/${floorData.building_id}`)
        revalidatePath(`/dashboard/buildings/${floorData.building_id}/dashboard`)
      }
    }

    revalidatePath("/dashboard/kf-supply")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating tenant:", error)
    return { success: false, error: "Failed to create tenant" }
  }
}

export async function updateTenant(id: number, formData: FormData) {
  try {
    const tenant = {
      name: formData.get("name") as string,
      lease_commencement_date: formData.get("lease_commencement_date") as string,
      primary_industry_sector: formData.get("primary_industry_sector") as string,
      security_deposit: Number(formData.get("security_deposit")),
      lock_in_period: Number(formData.get("lock_in_period")),
      lock_in_expiry: formData.get("lock_in_expiry") as string,
      lease_period: Number(formData.get("lease_period")),
      type_of_user: formData.get("type_of_user") as string,
      lease_expiry: formData.get("lease_expiry") as string,
      escalation: Number(formData.get("escalation")),
      current_rent: Number(formData.get("current_rent")),
      handover_conditions: formData.get("handover_conditions") as string,
      car_parking_charges: Number(formData.get("car_parking_charges") || 0),
      notice_period: Number(formData.get("notice_period")),
      car_parking_ratio: Number(formData.get("car_parking_ratio") || 0),
      status: formData.get("status") as string,
    }

    const { data, error } = await supabaseAdmin.from("tenants").update(tenant).eq("id", id).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Get unit, floor, and building info for path revalidation
    const { data: tenantData } = await supabase.from("tenants").select("unit_id").eq("id", id).single()

    if (tenantData) {
      const { data: unitData } = await supabase.from("units").select("floor_id").eq("id", tenantData.unit_id).single()

      if (unitData) {
        const { data: floorData } = await supabase
          .from("floors")
          .select("building_id")
          .eq("id", unitData.floor_id)
          .single()

        if (floorData) {
          revalidatePath(`/dashboard/buildings/${floorData.building_id}`)
          revalidatePath(`/dashboard/buildings/${floorData.building_id}/dashboard`)
        }
      }
    }

    revalidatePath("/dashboard/kf-supply")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating tenant:", error)
    return { success: false, error: "Failed to update tenant" }
  }
}

export async function deleteTenant(id: number) {
  try {
    // First get unit, floor, and building info for path revalidation
    const { data: tenantData } = await supabase.from("tenants").select("unit_id").eq("id", id).single()

    let buildingId: number | null = null

    if (tenantData) {
      const { data: unitData } = await supabase.from("units").select("floor_id").eq("id", tenantData.unit_id).single()

      if (unitData) {
        const { data: floorData } = await supabase
          .from("floors")
          .select("building_id")
          .eq("id", unitData.floor_id)
          .single()

        if (floorData) {
          buildingId = floorData.building_id
        }
      }
    }

    // Delete the tenant
    const { error } = await supabaseAdmin.from("tenants").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    if (buildingId) {
      revalidatePath(`/dashboard/buildings/${buildingId}`)
      revalidatePath(`/dashboard/buildings/${buildingId}/dashboard`)
    }

    revalidatePath("/dashboard/kf-supply")

    return { success: true }
  } catch (error) {
    console.error("Error deleting tenant:", error)
    return { success: false, error: "Failed to delete tenant" }
  }
}

// Vacant Space CRUD operations
export async function createVacantSpace(formData: FormData) {
  try {
    const vacantSpace = {
      unit_id: Number(formData.get("unit_id")),
      quoted_rent: Number(formData.get("quoted_rent")),
      availability_date: formData.get("availability_date") as string,
      handover_condition: formData.get("handover_condition") as string,
    }

    const { data, error } = await supabaseAdmin.from("vacant_spaces").insert(vacantSpace).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Get unit, floor, and building info for path revalidation
    const { data: unitData } = await supabase.from("units").select("floor_id").eq("id", vacantSpace.unit_id).single()

    if (unitData) {
      const { data: floorData } = await supabase
        .from("floors")
        .select("building_id")
        .eq("id", unitData.floor_id)
        .single()

      if (floorData) {
        revalidatePath(`/dashboard/buildings/${floorData.building_id}`)
      }
    }

    revalidatePath("/dashboard/kf-supply")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating vacant space:", error)
    return { success: false, error: "Failed to create vacant space" }
  }
}

export async function updateVacantSpace(id: number, formData: FormData) {
  try {
    const vacantSpace = {
      quoted_rent: Number(formData.get("quoted_rent")),
      availability_date: formData.get("availability_date") as string,
      handover_condition: formData.get("handover_condition") as string,
    }

    const { data, error } = await supabaseAdmin.from("vacant_spaces").update(vacantSpace).eq("id", id).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Get unit, floor, and building info for path revalidation
    const { data: vacantSpaceData } = await supabase.from("vacant_spaces").select("unit_id").eq("id", id).single()

    if (vacantSpaceData) {
      const { data: unitData } = await supabase
        .from("units")
        .select("floor_id")
        .eq("id", vacantSpaceData.unit_id)
        .single()

      if (unitData) {
        const { data: floorData } = await supabase
          .from("floors")
          .select("building_id")
          .eq("id", unitData.floor_id)
          .single()

        if (floorData) {
          revalidatePath(`/dashboard/buildings/${floorData.building_id}`)
        }
      }
    }

    revalidatePath("/dashboard/kf-supply")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating vacant space:", error)
    return { success: false, error: "Failed to update vacant space" }
  }
}

export async function deleteVacantSpace(id: number) {
  try {
    // First get unit, floor, and building info for path revalidation
    const { data: vacantSpaceData } = await supabase.from("vacant_spaces").select("unit_id").eq("id", id).single()

    let buildingId: number | null = null

    if (vacantSpaceData) {
      const { data: unitData } = await supabase
        .from("units")
        .select("floor_id")
        .eq("id", vacantSpaceData.unit_id)
        .single()

      if (unitData) {
        const { data: floorData } = await supabase
          .from("floors")
          .select("building_id")
          .eq("id", unitData.floor_id)
          .single()

        if (floorData) {
          buildingId = floorData.building_id
        }
      }
    }

    // Delete the vacant space
    const { error } = await supabaseAdmin.from("vacant_spaces").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    if (buildingId) {
      revalidatePath(`/dashboard/buildings/${buildingId}`)
    }

    revalidatePath("/dashboard/kf-supply")

    return { success: true }
  } catch (error) {
    console.error("Error deleting vacant space:", error)
    return { success: false, error: "Failed to delete vacant space" }
  }
}

// Add a function to fetch buildings for the form
export async function fetchBuildings() {
  try {
    const { data, error } = await supabase.from("buildings").select("id, name").order("name")

    if (error) {
      console.error("Error fetching buildings:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching buildings:", error)
    return { success: false, error: "Failed to fetch buildings", data: [] }
  }
}
