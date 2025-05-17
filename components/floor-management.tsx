"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Layers, Edit, Plus } from "lucide-react"
import Link from "next/link"

interface Floor {
  id: string
  building_id: string
  floor_no: number
  floor_plate: number
  no_of_units: number
  efficiency: number
  type_of_space: string
  building_name: string
  floor_plan?: string
}

interface FloorManagementProps {
  floors: Floor[]
}

export function FloorManagement({ floors }: FloorManagementProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const filteredFloors = floors.filter(
    (floor) =>
      floor.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      floor.floor_no.toString().includes(searchTerm) ||
      floor.type_of_space?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Floors Management</CardTitle>
            <CardDescription>Manage all floor records in the database</CardDescription>
          </div>
          <Link href="/dashboard/kf-supply/new/floor">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Multiple Floors
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search by building name, floor number, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredFloors.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Building</TableHead>
                    <TableHead>Floor No</TableHead>
                    <TableHead>Floor Plate (sq ft)</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Type of Space</TableHead>
                    <TableHead>Floor Plan</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFloors.map((floor) => (
                    <TableRow key={floor.id}>
                      <TableCell className="font-medium">{floor.building_name}</TableCell>
                      <TableCell>{floor.floor_no}</TableCell>
                      <TableCell>{floor.floor_plate ? floor.floor_plate.toLocaleString() : "N/A"}</TableCell>
                      <TableCell>{floor.no_of_units}</TableCell>
                      <TableCell>{floor.efficiency ? `${floor.efficiency}%` : "N/A"}</TableCell>
                      <TableCell>{floor.type_of_space || "N/A"}</TableCell>
                      <TableCell>
                        {floor.floor_plan ? (
                          <a
                            href={floor.floor_plan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Plan
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/kf-supply/edit/floor/${floor.id}`)}
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
              <Layers className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No floors found</h3>
              <p className="text-muted-foreground">
                {floors.length > 0 ? "Try adjusting your search terms" : "Get started by adding your first floor"}
              </p>
              {floors.length === 0 && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/dashboard/kf-supply/new/floor")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Floors
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
