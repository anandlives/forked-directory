"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/actions/auth-actions"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error("Error logging out:", error)
      alert("Failed to log out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  )
}
