import type React from "react"
import { Header } from "@/components/header"
import { getServerSession } from "@/lib/supabase-auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen">
      <Header />
      {children}
    </div>
  )
}
