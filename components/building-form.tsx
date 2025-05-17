"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { createBuilding, updateBuilding } from "@/app/actions/data-operations"
import {
  getNextBuildingId,
  getExistingDeveloperIds,
  getExistingLocations,
  getExistingMicromarketZones,
  getExistingCertifications,
} from "@/app/actions/building-suggestions"
import type { Building } from "@/types/buildings"

interface BuildingFormProps {
  building?: Building
  isEditing?: boolean
}

// Update the Zod schema to handle id and developer_id as strings with uppercase
const buildingSchema = z.object({
  id: z
    .string()
    .min(1, "ID is required")
    .transform((val) => val.toUpperCase()),
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  micromarket_zone: z.string().optional(),
  building_structure: z.string().optional(),
  building_title: z.string().optional(),
  grade: z.string().optional(),
  total_area: z.coerce.number().min(1, "Total area must be greater than 0"),
  certifications: z.string().optional(),
  google_coordinates: z.string().optional(),
  cam: z.coerce.number().optional(),
  year_built: z.coerce.number().optional(),
  construction_status: z.string().optional(),
  building_status: z.string().optional(),
  building_image_link: z.string().url().optional().or(z.literal("")),
  developer_id: z
    .string()
    .min(1, "Developer ID is required")
    .transform((val) => val.toUpperCase()),
})

type BuildingFormValues = z.infer<typeof buildingSchema>

export function BuildingForm({ building, isEditing = false }: BuildingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!isEditing)
  const [developerIds, setDeveloperIds] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [micromarketZones, setMicromarketZones] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [isNewLocation, setIsNewLocation] = useState(false)
  const [isNewMicromarketZone, setIsNewMicromarketZone] = useState(false)
  const [isNewCertification, setIsNewCertification] = useState(false)
  const [developers, setDevelopers] = useState<{ id: string; name: string }[]>([])

  const defaultValues: Partial<BuildingFormValues> = building
    ? {
        id: building.id,
        name: building.name || "",
        location: building.location || "",
        micromarket_zone: building.micromarket_zone || "",
        building_structure: building.building_structure || "",
        building_title: building.building_title || "",
        grade: building.grade || "",
        total_area: building.total_area || 0,
        certifications: building.certifications || "",
        google_coordinates: building.google_coordinates || "",
        cam: building.cam || 0,
        year_built: building.year_built || 0,
        construction_status: building.construction_status || "",
        building_status: building.building_status || "",
        building_image_link: building.building_image_link || "",
        developer_id: building.developer_id || "D1",
      }
    : {
        developer_id: "D1", // Default developer_id
      }

  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues,
  })

  // Fetch the next suggested building ID, existing developer IDs, locations, micromarket zones, and certifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data in parallel
        const [nextId, existingDeveloperIds, existingLocations, existingMicromarketZones, existingCertifications] =
          await Promise.all([
            !isEditing ? getNextBuildingId() : Promise.resolve(""),
            getExistingDeveloperIds(),
            getExistingLocations(),
            getExistingMicromarketZones(),
            getExistingCertifications(),
          ])

        if (!isEditing && nextId) {
          form.setValue("id", nextId)
        }

        setDeveloperIds(existingDeveloperIds)
        setLocations(existingLocations)
        setMicromarketZones(existingMicromarketZones)
        setCertifications(existingCertifications)
      } catch (error) {
        console.error("Error fetching form data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isEditing, form, building])

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await fetch("/api/developers")
        const data = await response.json()
        if (data.success) {
          setDevelopers(data.data)
        }
      } catch (error) {
        console.error("Error fetching developers:", error)
      }
    }

    fetchDevelopers()
  }, [])

  // Handle location change
  const handleLocationChange = (value: string) => {
    if (value === "ADD_NEW") {
      setIsNewLocation(true)
      form.setValue("location", "")
    } else {
      setIsNewLocation(false)
      form.setValue("location", value)
    }
  }

  // Handle micromarket zone change
  const handleMicromarketZoneChange = (value: string) => {
    if (value === "ADD_NEW") {
      setIsNewMicromarketZone(true)
      form.setValue("micromarket_zone", "")
    } else {
      setIsNewMicromarketZone(false)
      form.setValue("micromarket_zone", value)
    }
  }

  // Handle certifications change
  const handleCertificationsChange = (value: string) => {
    if (value === "ADD_NEW") {
      setIsNewCertification(true)
      form.setValue("certifications", "")
    } else {
      setIsNewCertification(false)
      form.setValue("certifications", value)
    }
  }

  async function onSubmit(data: BuildingFormValues) {
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      let result

      if (isEditing && building) {
        result = await updateBuilding(building.id, formData)
      } else {
        result = await createBuilding(formData)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Building updated" : "Building created",
          description: `Successfully ${isEditing ? "updated" : "created"} ${data.name}`,
        })

        // Add a small delay before redirecting to ensure the toast is visible
        setTimeout(() => {
          router.push("/dashboard/kf-supply/manage/buildings")
          router.refresh()
        }, 1500)
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong",
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
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Building" : "Add New Building"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the information for this building"
            : "Enter the details to add a new building to the database"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="id">Building ID *</Label>
                <Input
                  id="id"
                  {...form.register("id")}
                  placeholder={isLoading ? "Loading suggestion..." : "Enter building ID"}
                  disabled={isLoading}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase()
                    form.setValue("id", e.target.value)
                  }}
                />
                {form.formState.errors.id && <p className="text-sm text-red-500">{form.formState.errors.id.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Suggested ID based on existing buildings. You can modify if needed.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Building Name *</Label>
              <Input id="name" {...form.register("name")} placeholder="Enter building name" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              {isLoading ? (
                <Input placeholder="Loading locations..." disabled />
              ) : (
                <>
                  {!isNewLocation ? (
                    <Select defaultValue={building?.location || ""} onValueChange={handleLocationChange}>
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                        <SelectItem value="ADD_NEW" className="text-primary font-medium">
                          + Add New Location
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        id="location"
                        {...form.register("location")}
                        placeholder="Enter new location"
                        defaultValue={building?.location || ""}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsNewLocation(false)}
                        className="text-xs"
                      >
                        Select from existing
                      </Button>
                    </div>
                  )}
                </>
              )}
              {form.formState.errors.location && (
                <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="micromarket_zone">Micromarket Zone</Label>
              {isLoading ? (
                <Input placeholder="Loading micromarket zones..." disabled />
              ) : (
                <>
                  {!isNewMicromarketZone ? (
                    <Select defaultValue={building?.micromarket_zone || ""} onValueChange={handleMicromarketZoneChange}>
                      <SelectTrigger id="micromarket_zone">
                        <SelectValue placeholder="Select micromarket zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {micromarketZones.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                        <SelectItem value="ADD_NEW" className="text-primary font-medium">
                          + Add New Micromarket Zone
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        id="micromarket_zone"
                        {...form.register("micromarket_zone")}
                        placeholder="Enter new micromarket zone"
                        defaultValue={building?.micromarket_zone || ""}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsNewMicromarketZone(false)}
                        className="text-xs"
                      >
                        Select from existing
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_area">Total Area (sq ft) *</Label>
              <Input id="total_area" type="number" {...form.register("total_area")} placeholder="Enter total area" />
              {form.formState.errors.total_area && (
                <p className="text-sm text-red-500">{form.formState.errors.total_area.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select defaultValue={building?.grade || ""} onValueChange={(value) => form.setValue("grade", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="building_structure">Building Structure</Label>
              <Input
                id="building_structure"
                {...form.register("building_structure")}
                placeholder="Enter building structure"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="building_title">Building Title</Label>
              <Select
                defaultValue={building?.building_title || ""}
                onValueChange={(value) => form.setValue("building_title", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select building title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT/ITES">IT/ITES</SelectItem>
                  <SelectItem value="IT/ITES SEZ">IT/ITES SEZ</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Institutional">Institutional</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Mix Land">Mix Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_built">Year Built</Label>
              <Input id="year_built" type="number" {...form.register("year_built")} placeholder="Enter year built" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_coordinates">Google Coordinates</Label>
              <Input
                id="google_coordinates"
                {...form.register("google_coordinates")}
                placeholder="latitude,longitude (e.g. 28.6139,77.2090)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              {isLoading ? (
                <Input placeholder="Loading certifications..." disabled />
              ) : (
                <>
                  {!isNewCertification ? (
                    <Select defaultValue={building?.certifications || ""} onValueChange={handleCertificationsChange}>
                      <SelectTrigger id="certifications">
                        <SelectValue placeholder="Select certification" />
                      </SelectTrigger>
                      <SelectContent>
                        {certifications.map((certification) => (
                          <SelectItem key={certification} value={certification}>
                            {certification}
                          </SelectItem>
                        ))}
                        <SelectItem value="ADD_NEW" className="text-primary font-medium">
                          + Add New Certification
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        id="certifications"
                        {...form.register("certifications")}
                        placeholder="Enter new certification (e.g. LEED Gold, IGBC, etc.)"
                        defaultValue={building?.certifications || ""}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsNewCertification(false)}
                        className="text-xs"
                      >
                        Select from existing
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cam">CAM (per sq ft)</Label>
              <Input id="cam" type="number" {...form.register("cam")} placeholder="Enter CAM charges" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="construction_status">Construction Status</Label>
              <Select
                defaultValue={building?.construction_status || ""}
                onValueChange={(value) => form.setValue("construction_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select construction status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Under Construction">Under Construction</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="building_status">Building Status</Label>
              <Select
                defaultValue={building?.building_status || ""}
                onValueChange={(value) => form.setValue("building_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select building status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lease">Lease</SelectItem>
                  <SelectItem value="Purchase">Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="building_image_link">Building Image URL</Label>
              <Input id="building_image_link" {...form.register("building_image_link")} placeholder="Enter image URL" />
              {form.formState.errors.building_image_link && (
                <p className="text-sm text-red-500">{form.formState.errors.building_image_link.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="developer_id">Developer ID *</Label>
              <Select
                defaultValue={building?.developer_id || "D1"}
                onValueChange={(value) => form.setValue("developer_id", value.toUpperCase())}
                disabled={isLoading}
              >
                <SelectTrigger id="developer_id">
                  <SelectValue placeholder={isLoading ? "Loading developer IDs..." : "Select developer ID"} />
                </SelectTrigger>
                <SelectContent>
                  {developers.map((dev) => (
                    <SelectItem key={dev.id} value={dev.id}>
                      {dev.name} ({dev.id})
                    </SelectItem>
                  ))}
                  {/* Option to add a new developer ID if needed */}
                  <SelectItem value="ADD_NEW" className="text-primary font-medium">
                    + Add New Developer ID
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.developer_id && (
                <p className="text-sm text-red-500">{form.formState.errors.developer_id.message}</p>
              )}
              {form.watch("developer_id") === "ADD_NEW" && (
                <div className="mt-2">
                  <Input
                    placeholder="Enter new developer ID"
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase()
                      form.setValue("developer_id", value)
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/kf-supply/manage/buildings")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Building" : "Add Building"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
