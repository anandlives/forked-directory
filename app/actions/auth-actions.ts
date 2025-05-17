"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"

export async function signInWithPassword(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const supabase = createServerActionClient({ cookies })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Authentication error:", error.message)
      return { error: error.message }
    }

    // Return the session data to confirm successful login
    return { success: true, session: data.session }
  } catch (err) {
    console.error("Server authentication error:", err)
    return { error: "An unexpected error occurred during authentication" }
  }
}

export async function signOut() {
  const supabase = createServerActionClient({ cookies })
  await supabase.auth.signOut()
  redirect("/login")
}

// Remove magic link method if not needed
