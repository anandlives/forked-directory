"use server"

import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import type { User } from "@/types/user"

export async function authenticate(username: string, password: string) {
  try {
    // Add a small delay to prevent brute force attempts
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Query the User_login table to find a matching user
    const { data, error } = await supabase
      .from("User_login")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle() // Use maybeSingle() instead of single() to avoid errors when no match is found

    if (error) {
      if (error.code === "PGRST116") {
        // Rate limit error
        return { success: false, error: "Too many attempts. Please try again later." }
      }
      console.error("Database error:", error)
      return { success: false, error: "An error occurred while authenticating" }
    }

    if (!data) {
      return { success: false, error: "Invalid username or password" }
    }

    // Create a session object (excluding the password)
    const user: User = data
    const session = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    }

    // Set a cookie with the session information
    cookies().set({
      name: "user_session",
      value: JSON.stringify(session),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    })

    return { success: true }
  } catch (error) {
    console.error("Unexpected error during authentication:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    }
  }
}

export async function logout() {
  try {
    cookies().delete("user_session")
    return { success: true }
  } catch (error) {
    console.error("Error during logout:", error)
    return { success: false, error: "Failed to logout" }
  }
}

export async function getSession() {
  try {
    const sessionCookie = cookies().get("user_session")
    if (!sessionCookie?.value) {
      return null
    }

    return JSON.parse(sessionCookie.value)
  } catch (error) {
    console.error("Error parsing session cookie:", error)
    cookies().delete("user_session") // Clear invalid session
    return null
  }
}
