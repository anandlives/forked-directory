import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for browser-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zceqqjtglbexuzueknwi.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXFxanRnbGJleHV6dWVrbndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyOTgzMzgsImV4cCI6MjA1MTg3NDMzOH0.oeEtY_-IbLZ1gV6HLMakc3sZiL5jfAMLAJn_g_WPEl8"

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false, // Disable auto refresh
    detectSessionInUrl: true,
  },
})

// Add a custom refresh function
export async function refreshSession() {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      // Handle failed refresh - maybe redirect to login
      window.location.href = "/login"
      return false
    }

    return true
  } catch (error) {
    console.error("Error refreshing session:", error)
    return false
  }
}
