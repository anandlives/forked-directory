import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zceqqjtglbexuzueknwi.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXFxanRnbGJleHV6dWVrbndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyOTgzMzgsImV4cCI6MjA1MTg3NDMzOH0.oeEtY_-IbLZ1gV6HLMakc3sZiL5jfAMLAJn_g_WPEl8"
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXFxanRnbGJleHV6dWVrbndpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjI5ODMzOCwiZXhwIjoyMDUxODc0MzM4fQ.oeEtY_-IbLZ1gV6HLMakc3sZiL5jfAMLAJn_g_WPEl8"

// Create the standard client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a service role client that can bypass RLS
// This should be used ONLY in server-side code and with caution
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
