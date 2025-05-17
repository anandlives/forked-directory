"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { fetchFloorsByBuildingId, fetchUnitsByFloorId, createTenant } from "@/app/actions/tenant-actions"
import type { Building } from "@/types/buildings"

// Form schema
const tenantSchema = z.object({
  building_id: z.string().min(1, "Building is required"),
  floor_id: z.string().min(1, "Floor is required"),
  unit_id: z.string().min(1, "Unit is required"),
  name: z.string().min(1, "Tenant name is required"),
  lease_commencement_date: z.string().min(1, "Lease commencement date is required"),
  lease_expiry: z.string().min(1, "Lease expiry date is required"),
  lock_in_period: z.coerce.number().min(0, "Lock-in period cannot be negative"),
  lock_in_expiry: z.string().optional(),
  lease_period: z.coerce.number().min(0, "Lease period cannot be negative"),
  current_rent: z.coerce.number().min(0, "Current rent cannot be negative"),
  escalation: z.coerce.number().min(0, "Escalation cannot be negative"),
  security_deposit: z.coerce.number().min(0, "Security deposit cannot be negative"),
  notice_period: z.coerce.number().min(0, "Notice period cannot be negative"),
  primary_industry_sector: z.string().optional(),
  type_of_user: z.string().optional(),
  handover_conditions: z.string().optional(),
  car_parking_charges: z.coerce.number().min(0, "Car parking charges cannot be negative").optional(),
  car_parking_ratio: z.coerce.number().min(0, "Car parking ratio cannot be negative").optional(),
  status: z.string().default("Active"),
})

type TenantFormValues = z.infer<typeof tenantSchema>

interface MultiTenantFormProps {
  initialBuildings: Building[]
}

export function MultiTenantForm({ initialBuildings }: MultiTenantFormProps) {
  const router = useRouter()
  const [buildings] = useState<Building[]>(initialBuildings)
  const [floors, setFloors] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [isLoadingFloors, setIsLoadingFloors] = useState<boolean>(false)
  const [isLoadingUnits, setIsLoadingUnits] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with default values
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      building_id: "",
      floor_id: "",
      unit_id: "",
      name: "",
      lease_commencement_date: "",
      lease_expiry: "",
      lock_in_period: 0,
      lock_in_expiry: "",
      lease_period: 0,
      current_rent: 0,
      escalation: 0,
      security_deposit: 0,
      notice_period: 0,
      primary_industry_sector: "",
      type_of_user: "",
      handover_conditions: "",
      car_parking_charges: 0,
      car_parking_ratio: 0,
      status: "Active",
    },
  })

  // Fetch floors when building selection changes
  const handleBuildingChange = async (buildingId: string) => {
    form.setValue("building_id", buildingId)
    form.setValue("floor_id", "") // Reset floor selection
    form.setValue("unit_id", "") // Reset unit selection
    setFloors([])
    setUnits([])
    setError(null)

    if (!buildingId) return

    setIsLoadingFloors(true)

    try {
      const result = await fetchFloorsByBuildingId(buildingId)

      if (result.success) {
        setFloors(result.floors)
        if (result.floors.length === 0) {
          setError("No floors found for this building. Please add floors first.")
        }
      } else {
        setError(result.error || "Failed to fetch floors")
      }
    } catch (err) {
      console.error("Error fetching floors:", err)
      setError("An unexpected error occurred while fetching floors")
    } finally {
      setIsLoadingFloors(false)
    }
  }

  // Fetch units when floor selection changes
  const handleFloorChange = async (floorId: string) => {
    form.setValue("floor_id", floorId)
    form.setValue("unit_id", "") // Reset unit selection
    setUnits([])
    setError(null)

    if (!floorId) return

    setIsLoadingUnits(true)

    try {
      const result = await fetchUnitsByFloorId(floorId)

      if (result.success) {
        setUnits(result.units)
        if (result.units.length === 0) {
          setError("No vacant units found for this floor. Please add units first.")
        }
      } else {
        setError(result.error || "Failed to fetch units")
      }
    } catch (err) {
      console.error("Error fetching units:", err)
      setError("An unexpected error occurred while fetching units")
    } finally {
      setIsLoadingUnits(false)
    }
  }

  // Handle form submission
  const onSubmit = async (data: TenantFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Create FormData object
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      // Call the server action
      const result = await createTenant(formData)

      if (result.success) {
        toast({
          title: "Tenant created",
          description: `Successfully created tenant: ${data.name}`,
        })

        // Navigate to tenants management page
        router.push("/dashboard/kf-supply/manage/tenants")
        router.refresh()
      } else {
        setError(result.error || "Failed to create tenant")
        toast({
          title: "Error",
          description: result.error || "Failed to create tenant",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Tenant</CardTitle>
        <CardDescription>Create a new tenant for a vacant unit</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Building Selection */}
            <div className="space-y-2">
              <Label htmlFor="building_id">Building *</Label>
              <Select onValueChange={handleBuildingChange}>
                <SelectTrigger id="building_id" className="w-full">
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.length > 0 ? (
                    buildings.map((building) => (
                      <SelectItem key={building.id} value={String(building.id)}>
                        {building.name} (ID: {building.id})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-buildings" disabled>
                      No buildings found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.building_id && (
                <p className="text-sm text-red-500">{form.formState.errors.building_id.message}</p>
              )}
            </div>

            {/* Floor Selection */}
            <div className="space-y-2">
              <Label htmlFor="floor_id">Floor *</Label>
              <Select disabled={isLoadingFloors || floors.length === 0} onValueChange={handleFloorChange}>
                <SelectTrigger id="floor_id" className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingFloors
                        ? "Loading floors..."
                        : floors.length === 0
                          ? "No floors available"
                          : "Select floor"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingFloors ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading floors...
                      </div>
                    </SelectItem>
                  ) : floors.length > 0 ? (
                    floors.map((floor) => (
                      <SelectItem key={floor.id} value={String(floor.id)}>
                        Floor {floor.floor_no} (ID: {floor.id})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-floors" disabled>
                      No floors found for this building
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.floor_id && (
                <p className="text-sm text-red-500">{form.formState.errors.floor_id.message}</p>
              )}
            </div>

            {/* Unit Selection */}
            <div className="space-y-2">
              <Label htmlFor="unit_id">Unit *</Label>
              <Select
                disabled={isLoadingUnits || units.length === 0}
                onValueChange={(value) => form.setValue("unit_id", value)}
              >
                <SelectTrigger id="unit_id" className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingUnits
                        ? "Loading units..."
                        : units.length === 0
                          ? "No vacant units available"
                          : "Select unit"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingUnits ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading units...
                      </div>
                    </SelectItem>
                  ) : units.length > 0 ? (
                    units.map((unit) => (
                      <SelectItem key={unit.id} value={String(unit.id)}>
                        Unit {unit.unit_no} ({unit.chargeable_area} sq ft)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-units" disabled>
                      No vacant units found for this floor
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.unit_id && (
                <p className="text-sm text-red-500">{form.formState.errors.unit_id.message}</p>
              )}
            </div>

            {/* Tenant Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tenant Name *</Label>
              <Input id="name" {...form.register("name")} placeholder="Enter tenant name" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Lease Commencement Date */}
            <div className="space-y-2">
              <Label htmlFor="lease_commencement_date">Lease Commencement Date *</Label>
              <Input id="lease_commencement_date" type="date" {...form.register("lease_commencement_date")} />
              {form.formState.errors.lease_commencement_date && (
                <p className="text-sm text-red-500">{form.formState.errors.lease_commencement_date.message}</p>
              )}
            </div>

            {/* Lease Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="lease_expiry">Lease Expiry Date *</Label>
              <Input id="lease_expiry" type="date" {...form.register("lease_expiry")} />
              {form.formState.errors.lease_expiry && (
                <p className="text-sm text-red-500">{form.formState.errors.lease_expiry.message}</p>
              )}
            </div>

            {/* Lock-in Period */}
            <div className="space-y-2">
              <Label htmlFor="lock_in_period">Lock-in Period (months)</Label>
              <Input
                id="lock_in_period"
                type="number"
                {...form.register("lock_in_period", { valueAsNumber: true })}
                min={0}
              />
              {form.formState.errors.lock_in_period && (
                <p className="text-sm text-red-500">{form.formState.errors.lock_in_period.message}</p>
              )}
            </div>

            {/* Lock-in Expiry */}
            <div className="space-y-2">
              <Label htmlFor="lock_in_expiry">Lock-in Expiry Date</Label>
              <Input id="lock_in_expiry" type="date" {...form.register("lock_in_expiry")} />
            </div>

            {/* Lease Period */}
            <div className="space-y-2">
              <Label htmlFor="lease_period">Lease Period (months)</Label>
              <Input
                id="lease_period"
                type="number"
                {...form.register("lease_period", { valueAsNumber: true })}
                min={0}
              />
              {form.formState.errors.lease_period && (
                <p className="text-sm text-red-500">{form.formState.errors.lease_period.message}</p>
              )}
            </div>

            {/* Current Rent */}
            <div className="space-y-2">
              <Label htmlFor="current_rent">Current Rent *</Label>
              <Input
                id="current_rent"
                type="number"
                {...form.register("current_rent", { valueAsNumber: true })}
                min={0}
                step="0.01"
              />
              {form.formState.errors.current_rent && (
                <p className="text-sm text-red-500">{form.formState.errors.current_rent.message}</p>
              )}
            </div>

            {/* Escalation */}
            <div className="space-y-2">
              <Label htmlFor="escalation">Escalation (%)</Label>
              <Input
                id="escalation"
                type="number"
                {...form.register("escalation", { valueAsNumber: true })}
                min={0}
                step="0.01"
              />
              {form.formState.errors.escalation && (
                <p className="text-sm text-red-500">{form.formState.errors.escalation.message}</p>
              )}
            </div>

            {/* Security Deposit */}
            <div className="space-y-2">
              <Label htmlFor="security_deposit">Security Deposit</Label>
              <Input
                id="security_deposit"
                type="number"
                {...form.register("security_deposit", { valueAsNumber: true })}
                min={0}
                step="0.01"
              />
              {form.formState.errors.security_deposit && (
                <p className="text-sm text-red-500">{form.formState.errors.security_deposit.message}</p>
              )}
            </div>

            {/* Notice Period */}
            <div className="space-y-2">
              <Label htmlFor="notice_period">Notice Period (months)</Label>
              <Input
                id="notice_period"
                type="number"
                {...form.register("notice_period", { valueAsNumber: true })}
                min={0}
              />
              {form.formState.errors.notice_period && (
                <p className="text-sm text-red-500">{form.formState.errors.notice_period.message}</p>
              )}
            </div>

            {/* Primary Industry Sector */}
            <div className="space-y-2">
              <Label htmlFor="primary_industry_sector">Primary Industry Sector</Label>
              <Input
                id="primary_industry_sector"
                {...form.register("primary_industry_sector")}
                placeholder="e.g., Technology, Finance, etc."
              />
            </div>

            {/* Type of User */}
            <div className="space-y-2">
              <Label htmlFor="type_of_user">Type of User</Label>
              <Select
                defaultValue={form.getValues("type_of_user")}
                onValueChange={(value) => form.setValue("type_of_user", value)}
              >
                <SelectTrigger id="type_of_user">
                  <SelectValue placeholder="Select type of user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Handover Conditions */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="handover_conditions">Handover Conditions</Label>
              <Textarea
                id="handover_conditions"
                {...form.register("handover_conditions")}
                placeholder="Enter handover conditions"
                rows={3}
              />
            </div>

            {/* Car Parking Charges */}
            <div className="space-y-2">
              <Label htmlFor="car_parking_charges">Car Parking Charges</Label>
              <Input
                id="car_parking_charges"
                type="number"
                {...form.register("car_parking_charges", { valueAsNumber: true })}
                min={0}
                step="0.01"
              />
            </div>

            {/* Car Parking Ratio */}
            <div className="space-y-2">
              <Label htmlFor="car_parking_ratio">Car Parking Ratio</Label>
              <Input
                id="car_parking_ratio"
                type="number"
                {...form.register("car_parking_ratio", { valueAsNumber: true })}
                min={0}
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/kf-supply/manage/tenants")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !form.getValues("unit_id")}>
              {isSubmitting ? "Creating Tenant..." : "Create Tenant"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
