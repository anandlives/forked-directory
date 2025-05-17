"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Generate a UUID for unique developer IDs
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function createDeveloper(formData: FormData) {
  try {
    // Get the next developer ID
    const nextId = await getNextDeveloperId()

    const developer = {
      id: (formData.get("id") as string) || nextId,
      name: formData.get("name") as string,
      spoc_name: formData.get("spoc_name") as string,
      spoc_contact_no: formData.get("spoc_contact_no") as string,
      spoc_email_id: formData.get("spoc_email_id") as string,
      additional_contact_name: formData.get("additional_contact_name") as string,
      additional_contact_details: formData.get("additional_contact_details") as string,
      additional_contact_email_id: formData.get("additional_contact_email_id") as string,
    }

    // Validate that name is provided
    if (!developer.name) {
      return { success: false, error: "Developer name is required", status: 400 }
    }

    // Ensure we're using the admin client with service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not defined")
      return { success: false, error: "Server configuration error", status: 500 }
    }

    // Use supabaseAdmin to bypass RLS
    const { data, error, status } = await supabaseAdmin.from("developers").insert(developer).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, error: error.message, status: status || 500 }
    }

    revalidatePath("/dashboard/kf-supply")
    revalidatePath("/dashboard/kf-supply/manage/developers")

    return { success: true, data, status: 201 }
  } catch (error) {
    console.error("Error creating developer:", error)
    return { success: false, error: "Failed to create developer", status: 500 }
  }
}

export async function updateDeveloper(id: string, formData: FormData) {
  try {
    const developer = {
      name: formData.get("name") as string,
      spoc_name: formData.get("spoc_name") as string,
      spoc_contact_no: formData.get("spoc_contact_no") as string,
      spoc_email_id: formData.get("spoc_email_id") as string,
      additional_contact_name: formData.get("additional_contact_name") as string,
      additional_contact_details: formData.get("additional_contact_details") as string,
      additional_contact_email_id: formData.get("additional_contact_email_id") as string,
    }

    // Validate that name is provided
    if (!developer.name) {
      return { success: false, error: "Developer name is required", status: 400 }
    }

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin.from("developers").update(developer).eq("id", id).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/kf-supply")
    revalidatePath("/dashboard/kf-supply/manage/developers")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating developer:", error)
    return { success: false, error: "Failed to update developer" }
  }
}

export async function deleteDeveloper(id: string) {
  try {
    // Check if there are any buildings associated with this developer
    const { data: buildings, error: buildingsError } = await supabaseAdmin
      .from("buildings")
      .select("id")
      .eq("developer_id", id)

    if (buildingsError) {
      return { success: false, error: buildingsError.message }
    }

    if (buildings && buildings.length > 0) {
      return {
        success: false,
        error: `Cannot delete developer with ID ${id} because it has ${buildings.length} associated buildings. Please reassign or delete these buildings first.`,
      }
    }

    // Delete the developer
    const { error } = await supabaseAdmin.from("developers").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/kf-supply")
    revalidatePath("/dashboard/kf-supply/manage/developers")

    return { success: true }
  } catch (error) {
    console.error("Error deleting developer:", error)
    return { success: false, error: "Failed to delete developer" }
  }
}

export async function getNextDeveloperId(): Promise<string> {
  try {
    // Fetch all developer IDs
    const { data, error } = await supabaseAdmin.from("developers").select("id").order("id", { ascending: false })

    if (error) {
      console.error("Error fetching developer IDs:", error)
      return "D1" // Default if there's an error
    }

    if (!data || data.length === 0) {
      return "D1" // First developer
    }

    // Find the highest numeric value from IDs that follow the pattern 'D{number}'
    let highestNum = 0

    data.forEach((developer) => {
      const id = String(developer.id)
      if (id.startsWith("D")) {
        const numPart = id.substring(1)
        const num = Number.parseInt(numPart)
        if (!isNaN(num) && num > highestNum) {
          highestNum = num
        }
      }
    })

    // Increment and return the next ID
    return `D${highestNum + 1}`
  } catch (error) {
    console.error("Unexpected error getting next developer ID:", error)
    return "D1" // Default fallback
  }
}

export async function getAllDevelopers() {
  try {
    const { data, error } = await supabaseAdmin.from("developers").select("*").order("name")

    if (error) {
      console.error("Error fetching developers:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching developers:", error)
    return { success: false, error: "Failed to fetch developers", data: [] }
  }
}
