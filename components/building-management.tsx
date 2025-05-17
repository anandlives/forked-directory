"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Building } from "@/types/buildings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BuildingIcon, Edit, Plus } from "lucide-react"
import Link from "next/link"

interface BuildingManagementProps {
  buildings: Building[]
}

export function BuildingManagement({ buildings }: BuildingManagementProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBuildings = buildings.filter(
    (building) =>
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Buildings Management</CardTitle>
            <CardDescription>Manage all building records in the database</CardDescription>
          </div>
          <Link href="/dashboard/kf-supply/new/building">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Building
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredBuildings.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Building Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Total Area (sq ft)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuildings.map((building) => (
                    <TableRow key={building.id}>
                      <TableCell className="font-medium">{building.name}</TableCell>
                      <TableCell>{building.location}</TableCell>
                      <TableCell>{building.grade || "N/A"}</TableCell>
                      <TableCell>{building.total_area ? building.total_area.toLocaleString() : "N/A"}</TableCell>
                      <TableCell>{building.building_status || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/kf-supply/edit/building/${building.id}`)}
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
              <BuildingIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No buildings found</h3>
              <p className="text-muted-foreground">
                {buildings.length > 0 ? "Try adjusting your search terms" : "Get started by adding your first building"}
              </p>
              {buildings.length === 0 && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/dashboard/kf-supply/new/building")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Building
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
