import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.unit_id || !body.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    console.log(`API: Creating tenant for unit ID: ${body.unit_id}`)

    // Create the tenant
    const { data, error } = await supabase.from("tenants").insert([body]).select()

    if (error) {
      console.error(`Error creating tenant: ${error.message}`)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Update the unit status to Leased
    const { error: updateError } = await supabase.from("units").update({ status: "Leased" }).eq("id", body.unit_id)

    if (updateError) {
      console.error(`Error updating unit status: ${updateError.message}`)
      // We don't want to fail the whole operation if just the status update fails
      console.log("Tenant created but unit status not updated")
    }

    console.log(`API: Successfully created tenant for unit ID: ${body.unit_id}`)
    return NextResponse.json({ success: true, tenant: data?.[0] })
  } catch (error) {
    console.error("Unexpected error in tenants create API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
