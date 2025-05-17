"use server"

import { supabase } from "@/lib/supabase"

export async function getNextBuildingId(): Promise<string> {
  try {
    // Fetch all building IDs
    const { data, error } = await supabase.from("buildings").select("id").order("id", { ascending: false })

    if (error) {
      console.error("Error fetching building IDs:", error)
      return "B1" // Default if there's an error
    }

    if (!data || data.length === 0) {
      return "B1" // First building
    }

    // Find the highest numeric value from IDs that follow the pattern 'B{number}'
    let highestNum = 0

    data.forEach((building) => {
      const id = String(building.id)
      if (id.startsWith("B")) {
        const numPart = id.substring(1)
        const num = Number.parseInt(numPart)
        if (!isNaN(num) && num > highestNum) {
          highestNum = num
        }
      }
    })

    // Increment and return the next ID
    return `B${highestNum + 1}`
  } catch (error) {
    console.error("Unexpected error getting next building ID:", error)
    return "B1" // Default fallback
  }
}

export async function getExistingDeveloperIds(): Promise<string[]> {
  try {
    // Fetch all unique developer IDs
    const { data, error } = await supabase.from("buildings").select("developer_id").order("developer_id")

    if (error) {
      console.error("Error fetching developer IDs:", error)
      return ["D1"] // Default if there's an error
    }

    if (!data || data.length === 0) {
      return ["D1"] // Default if no data
    }

    // Extract unique developer IDs
    const uniqueDeveloperIds = Array.from(
      new Set(
        data
          .map((item) => item.developer_id)
          .filter(Boolean) // Remove null/undefined values
          .map((id) => String(id).toUpperCase()), // Convert to uppercase strings
      ),
    ).sort()

    return uniqueDeveloperIds.length > 0 ? uniqueDeveloperIds : ["D1"]
  } catch (error) {
    console.error("Unexpected error getting developer IDs:", error)
    return ["D1"] // Default fallback
  }
}

export async function getExistingLocations(): Promise<string[]> {
  try {
    // Fetch all unique locations
    const { data, error } = await supabase.from("buildings").select("location").order("location")

    if (error) {
      console.error("Error fetching locations:", error)
      return [] // Return empty array if there's an error
    }

    if (!data || data.length === 0) {
      return [] // Return empty array if no data
    }

    // Extract unique locations
    const uniqueLocations = Array.from(
      new Set(
        data
          .map((item) => item.location)
          .filter(Boolean), // Remove null/undefined values
      ),
    ).sort()

    return uniqueLocations
  } catch (error) {
    console.error("Unexpected error getting locations:", error)
    return [] // Return empty array on error
  }
}

export async function getExistingMicromarketZones(): Promise<string[]> {
  try {
    // Fetch all unique micromarket zones
    const { data, error } = await supabase.from("buildings").select("micromarket_zone").order("micromarket_zone")

    if (error) {
      console.error("Error fetching micromarket zones:", error)
      return [] // Return empty array if there's an error
    }

    if (!data || data.length === 0) {
      return [] // Return empty array if no data
    }

    // Extract unique micromarket zones
    const uniqueMicromarketZones = Array.from(
      new Set(
        data
          .map((item) => item.micromarket_zone)
          .filter(Boolean), // Remove null/undefined values
      ),
    ).sort()

    return uniqueMicromarketZones
  } catch (error) {
    console.error("Unexpected error getting micromarket zones:", error)
    return [] // Return empty array on error
  }
}

export async function getExistingCertifications(): Promise<string[]> {
  try {
    // Fetch all unique certifications
    const { data, error } = await supabase.from("buildings").select("certifications").order("certifications")

    if (error) {
      console.error("Error fetching certifications:", error)
      return [] // Return empty array if there's an error
    }

    if (!data || data.length === 0) {
      return [] // Return empty array if no data
    }

    // Extract unique certifications
    const uniqueCertifications = Array.from(
      new Set(
        data
          .map((item) => item.certifications)
          .filter(Boolean), // Remove null/undefined values
      ),
    ).sort()

    return uniqueCertifications
  } catch (error) {
    console.error("Unexpected error getting certifications:", error)
    return [] // Return empty array on error
  }
}
