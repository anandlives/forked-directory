"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Edit, Trash2, Plus, AlertCircle } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteTenant } from "@/app/actions/data-operations"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isValid } from "date-fns"

interface Tenant {
  id: number
  unit_id: number
  name: string
  lease_commencement_date: string
  primary_industry_sector: string
  security_deposit: number
  lock_in_period: number
  lock_in_expiry: string
  lease_period: number
  type_of_user: string
  lease_expiry: string
  escalation: number
  current_rent: number
  handover_conditions: string
  car_parking_charges: number
  notice_period: number
  car_parking_ratio: number
  status: string
  building_name: string
  floor_no: number
  unit_no: string
  chargeable_area: number
}

interface TenantManagementProps {
  tenants: Tenant[]
}

export function TenantManagement({ tenants }: TenantManagementProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Add null checks to prevent "Cannot read properties of null (reading 'toLowerCase')" error
  const filteredTenants = tenants.filter((tenant) => {
    const name = tenant.name?.toLowerCase() || ""
    const buildingName = tenant.building_name?.toLowerCase() || ""
    const unitNo = tenant.unit_no?.toLowerCase() || ""
    const industrySector = tenant.primary_industry_sector?.toLowerCase() || ""
    const status = tenant.status?.toLowerCase() || ""

    const search = searchTerm.toLowerCase()

    return (
      name.includes(search) ||
      buildingName.includes(search) ||
      unitNo.includes(search) ||
      industrySector.includes(search) ||
      status.includes(search)
    )
  })

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteTenant(tenantToDelete.id)

      if (result.success) {
        toast({
          title: "Tenant deleted",
          description: `Successfully deleted tenant ${tenantToDelete.name}`,
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete tenant",
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
      setTenantToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge>Unknown</Badge>

    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>
      case "notice period":
        return <Badge className="bg-yellow-500">Notice Period</Badge>
      case "vacated":
        return <Badge className="bg-red-500">Vacated</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = parseISO(dateString)
    return isValid(date) ? format(date, "dd MMM yyyy") : "Invalid Date"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tenants Management</CardTitle>
            <CardDescription>Manage all tenant records in the database</CardDescription>
          </div>
          <Link href="/dashboard/kf-supply/new/tenant">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search by tenant name, building, unit, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredTenants.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant Name</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Area (sq ft)</TableHead>
                    <TableHead>Current Rent (₹/sq ft)</TableHead>
                    <TableHead>Lease Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name || "N/A"}</TableCell>
                      <TableCell>{tenant.building_name || "N/A"}</TableCell>
                      <TableCell>
                        Floor {tenant.floor_no || "N/A"}, Unit {tenant.unit_no || "N/A"}
                      </TableCell>
                      <TableCell>{tenant.chargeable_area ? tenant.chargeable_area.toLocaleString() : "N/A"}</TableCell>
                      <TableCell>{tenant.current_rent ? `₹${tenant.current_rent.toLocaleString()}` : "N/A"}</TableCell>
                      <TableCell>{formatDate(tenant.lease_expiry)}</TableCell>
                      <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/kf-supply/edit/tenant/${tenant.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setTenantToDelete(tenant)}
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
              <Users className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No tenants found</h3>
              <p className="text-muted-foreground">
                {tenants.length > 0 ? "Try adjusting your search terms" : "Get started by adding your first tenant"}
              </p>
              {tenants.length === 0 && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/dashboard/kf-supply/new/tenant")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tenant
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={tenantToDelete !== null} onOpenChange={(open) => !open && setTenantToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete tenant <strong>{tenantToDelete?.name || "Unknown"}</strong> from{" "}
              <strong>{tenantToDelete?.building_name || "Unknown"}</strong>, Floor {tenantToDelete?.floor_no || "N/A"},
              Unit {tenantToDelete?.unit_no || "N/A"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTenantToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Tenant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
