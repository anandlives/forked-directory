import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"

// Get the session on the server
export async function getServerSession() {
  try {
    // Use the server-side supabase client
    const cookieStore = cookies()
    const supabaseServer = createServerActionClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabaseServer.auth.getSession()

    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// For server actions
export function createServerAction() {
  return createServerActionClient({ cookies })
}

// Check if the user is authenticated on the server
export async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

// Get the user on the server
export async function getUser() {
  const session = await getServerSession()
  return session?.user || null
}

// Server action for sign out
export async function signOut() {
  "use server"
  const supabaseServer = createServerAction()
  await supabaseServer.auth.signOut()
  redirect("/login")
}
