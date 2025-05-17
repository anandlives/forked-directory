"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building, Edit, Plus } from "lucide-react"
import Link from "next/link"
import type { Developer } from "@/types/developers"

interface DeveloperManagementProps {
  developers: Developer[]
}

export function DeveloperManagement({ developers }: DeveloperManagementProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDevelopers = developers.filter(
    (developer) =>
      developer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (developer.spoc_name && developer.spoc_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (developer.spoc_email_id && developer.spoc_email_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (developer.spoc_contact_no && developer.spoc_contact_no.includes(searchTerm)),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Developers Management</CardTitle>
            <CardDescription>Manage all developer records in the database</CardDescription>
          </div>
          <Link href="/dashboard/kf-supply/new/developer">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Developer
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search by name, SPOC name, email, or contact number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredDevelopers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SPOC Name</TableHead>
                    <TableHead>SPOC Contact</TableHead>
                    <TableHead>SPOC Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevelopers.map((developer) => (
                    <TableRow key={developer.id}>
                      <TableCell className="font-medium">{developer.id}</TableCell>
                      <TableCell>{developer.name}</TableCell>
                      <TableCell>{developer.spoc_name || "N/A"}</TableCell>
                      <TableCell>{developer.spoc_contact_no || "N/A"}</TableCell>
                      <TableCell>{developer.spoc_email_id || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/kf-supply/edit/developer/${developer.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Building className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No developers found</h3>
              <p className="text-muted-foreground">
                {developers.length > 0
                  ? "Try adjusting your search terms"
                  : "Get started by adding your first developer"}
              </p>
              {developers.length === 0 && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/dashboard/kf-supply/new/developer")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Developer
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
