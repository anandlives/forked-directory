import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("Debug API - Received unit ID:", id)

    const unitId = Number.parseInt(id)

    if (isNaN(unitId)) {
      return NextResponse.json({ error: "Invalid unit ID", providedId: id }, { status: 400 })
    }

    // Test Supabase connection with a simple query
    const { data, error, status } = await supabaseAdmin
      .from("units")
      .select("id, unit_no, floor_id")
      .eq("id", unitId)
      .single()

    if (error) {
      return NextResponse.json(
        {
          error: "Database error",
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          status,
        },
        { status: 500 },
      )
    }

    if (!data) {
      return NextResponse.json({ error: "Unit not found", unitId }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Unit found successfully",
    })
  } catch (error) {
    console.error("Debug API - Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Unexpected error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
