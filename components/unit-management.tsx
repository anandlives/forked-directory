"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Grid, Edit, Trash2, Plus, AlertCircle } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteUnit } from "@/app/actions/data-operations"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Unit {
  id: number
  floor_id: number
  unit_no: string
  status: string
  chargeable_area: number
  carpet_area: number
  premises_condition: string
  building_name: string
  floor_no: number
}

interface UnitManagementProps {
  units: Unit[]
}

export function UnitManagement({ units }: UnitManagementProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredUnits = units.filter(
    (unit) =>
      unit.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.unit_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.floor_no.toString().includes(searchTerm),
  )

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteUnit(unitToDelete.id)

      if (result.success) {
        toast({
          title: "Unit deleted",
          description: `Successfully deleted unit ${unitToDelete.unit_no} from ${unitToDelete.building_name}, Floor ${unitToDelete.floor_no}`,
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete unit",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setUnitToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "vacant":
        return <Badge className="bg-green-500">Vacant</Badge>
      case "occupied":
        return <Badge className="bg-blue-500">Occupied</Badge>
      case "under renovation":
        return <Badge className="bg-yellow-500">Under Renovation</Badge>
      case "reserved":
        return <Badge className="bg-purple-500">Reserved</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Units Management</CardTitle>
            <CardDescription>Manage all unit records in the database</CardDescription>
          </div>
          <Link href="/dashboard/kf-supply/new/unit">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Multiple Units
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search by building name, floor number, or unit number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredUnits.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Building</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Unit No</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Chargeable Area (sq ft)</TableHead>
                    <TableHead>Carpet Area (sq ft)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.building_name}</TableCell>
                      <TableCell>{unit.floor_no}</TableCell>
                      <TableCell>{unit.unit_no}</TableCell>
                      <TableCell>{getStatusBadge(unit.status)}</TableCell>
                      <TableCell>{unit.chargeable_area ? unit.chargeable_area.toLocaleString() : "N/A"}</TableCell>
                      <TableCell>{unit.carpet_area ? unit.carpet_area.toLocaleString() : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/kf-supply/edit/unit/${unit.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setUnitToDelete(unit)}
                          >
                            <Trash2 className="h-4 w-4" />
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
              <Grid className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No units found</h3>
              <p className="text-muted-foreground">
                {units.length > 0 ? "Try adjusting your search terms" : "Get started by adding your first unit"}
              </p>
              {units.length === 0 && (
                <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/kf-supply/new/unit")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Units
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={unitToDelete !== null} onOpenChange={(open) => !open && setUnitToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete unit {unitToDelete?.unit_no} from{" "}
              <strong>{unitToDelete?.building_name}</strong>, Floor {unitToDelete?.floor_no}? This action will also
              delete all associated tenants and vacant spaces. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
