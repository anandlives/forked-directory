import { LoginForm } from "@/components/login-form"
import { Header } from "@/components/header"
import { getServerSession } from "@/lib/supabase-auth"
import { redirect } from "next/navigation"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { message?: string; from?: string }
}) {
  const session = await getServerSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {searchParams?.message && (
            <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">{searchParams.message}</div>
          )}
          <LoginForm returnTo={searchParams?.from || "/dashboard"} />
        </div>
      </main>
    </div>
  )
}
