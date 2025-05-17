import { SignupForm } from "@/components/signup-form"
import { Header } from "@/components/header"
import { getServerSession } from "@/lib/supabase-auth"
import { redirect } from "next/navigation"

export default async function SignupPage() {
  const session = await getServerSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <SignupForm />
        </div>
      </main>
    </div>
  )
}
