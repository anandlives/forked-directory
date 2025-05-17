import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getServerSession } from "@/lib/supabase-auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await getServerSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <main className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-6">Buildings Directory</h1>
        <p className="text-xl text-gray-600 mb-8">Your comprehensive directory for commercial real estate properties</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="lg">
              Sign Up
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
