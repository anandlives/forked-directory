import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get a list of available units
    const { data, error } = await supabaseAdmin
      .from("units")
      .select("id, unit_no, floor_id, floors!inner(floor_number, buildings!inner(name))")
      .order("id", { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json(
        {
          error: "Database error",
          message: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Unexpected error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
