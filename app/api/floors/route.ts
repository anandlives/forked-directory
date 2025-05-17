import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const buildingId = searchParams.get("buildingId")

    if (!buildingId) {
      return NextResponse.json({ success: false, error: "Building ID is required" }, { status: 400 })
    }

    console.log(`API: Fetching floors for building ID: ${buildingId}`)

    // Fetch floors for the specified building
    const { data, error, status } = await supabase
      .from("floors")
      .select("id, building_id, floor_no")
      .eq("building_id", buildingId)
      .order("floor_no")

    if (error) {
      console.error(`Error fetching floors: ${error.message} (Status: ${status})`)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log(`API: Found ${data?.length || 0} floors for building ID: ${buildingId}`)
    return NextResponse.json({ success: true, floors: data || [] })
  } catch (error) {
    console.error("Unexpected error in floors API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
