import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { units } = body

    if (!units || !Array.isArray(units) || units.length === 0) {
      return NextResponse.json({ success: false, error: "No units provided" }, { status: 400 })
    }

    console.log(`API: Creating ${units.length} units`)

    // Insert all units in a single transaction
    const { data, error } = await supabaseAdmin.from("units").insert(units).select()

    if (error) {
      console.error(`Error creating units: ${error.message}`)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log(`API: Successfully created ${data?.length || 0} units`)
    return NextResponse.json({ success: true, units: data })
  } catch (error) {
    console.error("Unexpected error in units create API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
