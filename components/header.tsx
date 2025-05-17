import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { getServerSession } from "@/lib/supabase-auth"

export async function Header() {
  const session = await getServerSession()

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={session ? "/dashboard" : "/"} className="text-xl font-bold">
            Buildings Directory
          </Link>
          {session && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium">
                Properties
              </Link>
              <Link href="/dashboard/kf-supply" className="text-sm font-medium text-muted-foreground">
                KF Supply
              </Link>
              <Link href="/dashboard/faqs" className="text-sm font-medium text-muted-foreground">
                FAQs
              </Link>
              <Link href="/dashboard/about" className="text-sm font-medium text-muted-foreground">
                About Us
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard/contact" className="text-sm font-medium text-muted-foreground">
                Contact Us
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Welcome, {session.user.email}</span>
                <LogoutButton />
              </div>
              <Button>Book a Call</Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
