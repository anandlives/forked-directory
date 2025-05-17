import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase.from("developers").select("id, name").order("name")

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching developers:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch developers" }, { status: 500 })
  }
}
