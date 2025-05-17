import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { Floor } from "@/types/floors"
import type { Unit } from "@/types/units"
import type { VacantSpace } from "@/types/vacant-spaces"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Tenant } from "@/types/tenants"

interface ProcessedFloor {
  floor_no: number
  floor_plate: number
  units: number[]
  efficiency: number
  type_of_space: string
  available_space: {
    total_area: number
    units: Array<{
      unit_no: string
      area: number
      quoted_rent?: number
      availability_date?: string
      handover_condition?: string
    }>
  }
  occupied_space: {
    tenants: Array<{
      name: string
      unit_no: string
      area: number
      current_rent: number
    }>
  }
}

function processFloorData(
  floors: Floor[],
  units: Unit[],
  vacantSpaces: VacantSpace[],
  tenants: Tenant[],
): ProcessedFloor[] {
  const vacantSpacesMap = vacantSpaces.reduce(
    (acc, space) => {
      acc[space.unit_id] = space
      return acc
    },
    {} as Record<number, VacantSpace>,
  )

  const tenantsMap = tenants.reduce(
    (acc, tenant) => {
      acc[tenant.unit_id] = tenant
      return acc
    },
    {} as Record<number, Tenant>,
  )

  const unitsByFloor = units.reduce(
    (acc, unit) => {
      if (!acc[unit.floor_id]) {
        acc[unit.floor_id] = []
      }
      acc[unit.floor_id].push(unit)
      return acc
    },
    {} as Record<number, Unit[]>,
  )

  const groupedFloors = floors
    .filter((floor) => floor.floor_no !== null && floor.floor_no !== undefined)
    .reduce(
      (acc, floor) => {
        const key = floor.floor_no
        const floorUnits = unitsByFloor[floor.id] || []

        const availableUnits = floorUnits.filter((unit) => vacantSpacesMap[unit.id])
        const occupiedUnits = floorUnits.filter((unit) => tenantsMap[unit.id])

        const availableSpace = {
          total_area: availableUnits.reduce((sum, unit) => sum + unit.chargeable_area, 0),
          units: availableUnits.map((unit) => {
            const vacantSpace = vacantSpacesMap[unit.id]
            return {
              unit_no: unit.unit_no,
              area: unit.chargeable_area,
              quoted_rent: vacantSpace?.quoted_rent,
              availability_date: vacantSpace?.availability_date,
              handover_condition: vacantSpace?.handover_condition,
            }
          }),
        }

        const occupied_space = {
          tenants: occupiedUnits.map((unit) => {
            const tenant = tenantsMap[unit.id]
            return {
              name: tenant?.name || "Unknown Tenant",
              unit_no: unit.unit_no,
              area: unit.chargeable_area,
              current_rent: tenant?.current_rent || 0,
            }
          }),
        }

        if (!acc[key]) {
          acc[key] = {
            floor_no: floor.floor_no,
            floor_plate: floor.floor_plate,
            units: [floor.no_of_units],
            efficiency: floor.efficiency,
            type_of_space: floor.type_of_space,
            available_space: availableSpace,
            occupied_space: occupied_space,
          }
        } else {
          acc[key].units.push(floor.no_of_units)
          acc[key].available_space.total_area += availableSpace.total_area
          acc[key].available_space.units.push(...availableSpace.units)
          acc[key].occupied_space.tenants.push(...occupied_space.tenants)
        }
        return acc
      },
      {} as Record<number, ProcessedFloor>,
    )

  return Object.values(groupedFloors).sort((a, b) => b.floor_no - a.floor_no)
}

function calculateAverageRent(processedFloors: ProcessedFloor[]): number {
  let totalRent = 0
  let totalArea = 0

  processedFloors.forEach((floor) => {
    floor.available_space.units.forEach((unit) => {
      if (unit.quoted_rent && unit.area) {
        totalRent += unit.quoted_rent * unit.area
        totalArea += unit.area
      }
    })
  })

  return totalArea > 0 ? totalRent / totalArea : 0
}

function formatEfficiency(efficiency: number | null | undefined): string {
  if (efficiency === null || efficiency === undefined) return "N/A"
  const percentage = efficiency < 1 ? efficiency * 100 : efficiency
  return `${Math.round(percentage)}%`
}

interface BuildingPageProps {
  params: { id: string }
}

export default async function BuildingPage({ params }: BuildingPageProps) {
  const { data: building } = await supabase.from("buildings").select("*").eq("id", params.id).single()

  if (!building) {
    notFound()
  }

  const { data: floors } = await supabase.from("floors").select("*").eq("building_id", params.id)
  const floorIds = floors?.map((f) => f.id) || []
  const { data: units } = await supabase.from("units").select("*").in("floor_id", floorIds)
  const unitIds = units?.map((u) => u.id) || []
  const { data: vacantSpaces } = await supabase.from("vacant_spaces").select("*").in("unit_id", unitIds)
  const { data: tenants } = await supabase.from("tenants").select("*").in("unit_id", unitIds)

  const processedFloors = processFloorData(floors || [], units || [], vacantSpaces || [], tenants || [])
  const averageRent = calculateAverageRent(processedFloors)

  return (
    <div className="min-h-screen">
      {/*Removed Header*/}

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Buildings
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{building.name}</h1>
          <Link href={`/dashboard/buildings/${params.id}/dashboard`}>
            <Button>View Dashboard</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={building.building_image_link || "/placeholder.svg?height=400&width=600"}
              alt={building.name}
              className="object-cover w-full h-full"
            />
            {building.certifications && building.certifications.toLowerCase().includes("leed") && (
              <Badge className="absolute top-4 left-4 bg-green-500">LEED Certified</Badge>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{building.name || "Unnamed Building"}</h1>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Location</h2>
                <p className="text-muted-foreground">{building.location || "Location not available"}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Details</h2>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Average Rent</dt>
                    <dd className="text-lg font-medium">
                      {averageRent > 0 ? `₹${Math.round(averageRent).toLocaleString()}/sq ft` : "No available space"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Total Area</dt>
                    <dd className="text-lg font-medium">
                      {building.total_area ? `${building.total_area.toLocaleString()} sq ft` : "N/A"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Grade</dt>
                    <dd className="text-lg font-medium">{building.grade || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Year Built</dt>
                    <dd className="text-lg font-medium">{building.year_built || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Status</dt>
                    <dd className="text-lg font-medium">{building.building_status || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Structure</dt>
                    <dd className="text-lg font-medium">{building.building_structure || "N/A"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Floor Details</h2>
          {processedFloors.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Floor No</TableHead>
                    <TableHead className="w-[140px]">Floor Plate</TableHead>
                    <TableHead className="w-[100px]">Units</TableHead>
                    <TableHead className="w-[500px]">Space Details</TableHead>
                    <TableHead className="w-[100px]">Efficiency</TableHead>
                    <TableHead className="w-[120px]">Type of Space</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedFloors.map((floor) => (
                    <TableRow
                      key={floor.floor_no}
                      className={floor.available_space.total_area > 0 ? "bg-green-50 dark:bg-green-900/20" : ""}
                    >
                      <TableCell className="font-medium">{floor.floor_no}</TableCell>
                      <TableCell>{floor.floor_plate ? floor.floor_plate.toLocaleString() : "N/A"} sq ft</TableCell>
                      <TableCell>{floor.units.join(", ") || "N/A"}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {floor.available_space.total_area > 0 && (
                            <div>
                              <div className="font-medium text-sm text-primary mb-1">Available Space:</div>
                              <table className="w-full text-xs">
                                <tbody>
                                  {floor.available_space.units.map((unit, idx) => (
                                    <tr key={idx} className="border-b last:border-0">
                                      <td className="py-1.5 w-1/3">
                                        <span className="font-medium">Unit {unit.unit_no}</span>
                                      </td>
                                      <td className="py-1.5 w-1/3 text-right">
                                        {unit.area ? unit.area.toLocaleString() : "N/A"} sq ft
                                      </td>
                                      <td className="py-1.5 w-1/3 text-right text-muted-foreground">
                                        {unit.quoted_rent ? `₹${unit.quoted_rent.toLocaleString()}/sq ft` : "N/A"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {floor.occupied_space.tenants.length > 0 && (
                            <div>
                              <table className="w-full text-xs">
                                <tbody>
                                  {floor.occupied_space.tenants.map((tenant, idx) => (
                                    <tr key={idx} className="border-b last:border-0">
                                      <td className="py-1.5 w-1/3">
                                        <span className="font-medium">{tenant.name}</span>
                                      </td>
                                      <td className="py-1.5 w-1/3 text-right">
                                        Unit {tenant.unit_no}: {tenant.area ? tenant.area.toLocaleString() : "N/A"} sq
                                        ft
                                      </td>
                                      <td className="py-1.5 w-1/3 text-right text-muted-foreground">
                                        {tenant.current_rent > 0
                                          ? `₹${tenant.current_rent.toLocaleString()}/sq ft`
                                          : "N/A"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatEfficiency(floor.efficiency)}</TableCell>
                      <TableCell>{floor.type_of_space || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No floor details available for this building.</p>
          )}
        </div>
      </div>
    </div>
  )
}
