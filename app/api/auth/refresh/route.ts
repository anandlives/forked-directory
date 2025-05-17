import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // This will attempt to refresh the session if needed
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      session: data.session ? true : false,
    })
  } catch (error) {
    console.error("Error refreshing session:", error)
    return NextResponse.json({ error: "Failed to refresh session" }, { status: 500 })
  }
}
