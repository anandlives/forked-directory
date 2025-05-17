import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const floorId = searchParams.get("floorId")

    if (!floorId) {
      return NextResponse.json({ success: false, error: "Floor ID is required" }, { status: 400 })
    }

    console.log(`API: Fetching units for floor ID: ${floorId}`)

    // Fetch vacant units for the specified floor
    const { data, error, status } = await supabase
      .from("units")
      .select("id, floor_id, unit_no, status, chargeable_area, carpet_area, premises_condition")
      .eq("floor_id", floorId)
      .eq("status", "Vacant") // Only fetch vacant units
      .order("unit_no")

    if (error) {
      console.error(`Error fetching units: ${error.message} (Status: ${status})`)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log(`API: Found ${data?.length || 0} vacant units for floor ID: ${floorId}`)
    return NextResponse.json({ success: true, units: data || [] })
  } catch (error) {
    console.error("Unexpected error in units API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
