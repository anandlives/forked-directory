import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UpdateEntryPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Link
            href="/dashboard/kf-supply"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Property Management
          </Link>
          <h1 className="text-3xl font-bold mt-2">Update or Edit an Entry</h1>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Search for an entry to edit</CardTitle>
            <CardDescription>
              Enter the property ID or search by name to find the entry you want to update.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="search">Search by ID or Name</Label>
                <Input id="search" placeholder="Enter property ID or name" />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="type">Entry Type</Label>
                <Select>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select entry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="building">Building</SelectItem>
                    <SelectItem value="floor">Floor</SelectItem>
                    <SelectItem value="unit">Unit</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Search</Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>No entries found. Try adjusting your search criteria.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
