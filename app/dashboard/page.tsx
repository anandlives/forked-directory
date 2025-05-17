import { supabase } from "@/lib/supabase"
import { SearchFilters } from "@/components/search-filters"
import { BuildingsMap } from "@/components/buildings-map"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClientSideBuildingsGrid } from "@/components/client-side-buildings-grid"

async function getAvailableSpaceSummary(buildingId: number) {
  const { data: floors } = await supabase.from("floors").select("id").eq("building_id", buildingId)
  const floorIds = floors?.map((f) => f.id) || []
  const { data: units } = await supabase.from("units").select("id, chargeable_area").in("floor_id", floorIds)
  const unitIds = units?.map((u) => u.id) || []
  const { data: vacantSpaces } = await supabase
    .from("vacant_spaces")
    .select("unit_id, quoted_rent")
    .in("unit_id", unitIds)

  const vacantUnitIds = new Set(vacantSpaces?.map((vs) => vs.unit_id) || [])
  const availableUnits = units?.filter((unit) => vacantUnitIds.has(unit.id)) || []
  const totalAvailableArea = availableUnits.reduce((sum, unit) => sum + (unit.chargeable_area || 0), 0)
  const availableUnitsCount = availableUnits.length
  const totalRent = vacantSpaces?.reduce((sum, space) => sum + (space.quoted_rent || 0), 0) || 0
  const averageRent = availableUnitsCount > 0 ? totalRent / availableUnitsCount : 0

  return {
    totalAvailableArea,
    availableUnitsCount,
    averageRent,
    availableUnits: availableUnits.map((unit) => unit.chargeable_area),
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { data: buildings, error } = await supabase.from("buildings").select("*")

  if (error) {
    return <div className="p-4">Error loading buildings: {error.message}</div>
  }

  const uniqueLocations = Array.from(new Set(buildings.map((b) => b.location))).filter(Boolean)
  const buildingNames = buildings.map((b) => b.name).filter(Boolean)

  const buildingsWithAvailableSpace = await Promise.all(
    buildings.map(async (building) => {
      const availableSpace = await getAvailableSpaceSummary(building.id)
      return { ...building, availableSpace }
    }),
  )

  let filteredBuildings = buildingsWithAvailableSpace

  if (searchParams.name) {
    const searchName = String(searchParams.name).toLowerCase()
    filteredBuildings = filteredBuildings.filter((b) => b.name.toLowerCase().includes(searchName))
  }

  if (searchParams.locations) {
    const locations = Array.isArray(searchParams.locations) ? searchParams.locations : [searchParams.locations]
    filteredBuildings = filteredBuildings.filter((b) => locations.includes(b.location))
  }

  if (searchParams.minArea || searchParams.maxArea) {
    const minArea = searchParams.minArea ? Number(searchParams.minArea) : 0
    const maxArea = searchParams.maxArea ? Number(searchParams.maxArea) : Number.POSITIVE_INFINITY

    filteredBuildings = filteredBuildings.filter((b) => {
      // Check if the building has available space that matches the criteria
      if (b.availableSpace.totalAvailableArea !== null) {
        return b.availableSpace.totalAvailableArea >= minArea && b.availableSpace.totalAvailableArea <= maxArea
      }
      return false
    })
  }

  if (searchParams.minPrice) {
    const minPrice = Number(searchParams.minPrice)
    filteredBuildings = filteredBuildings.filter(
      (b) => b.availableSpace.averageRent !== null && b.availableSpace.averageRent >= minPrice,
    )
  }

  if (searchParams.maxPrice) {
    const maxPrice = Number(searchParams.maxPrice)
    filteredBuildings = filteredBuildings.filter(
      (b) => b.availableSpace.averageRent !== null && b.availableSpace.averageRent <= maxPrice,
    )
  }

  const initialFilters = {
    name: (searchParams.name as string) || "",
    locations: Array.isArray(searchParams.locations)
      ? searchParams.locations
      : searchParams.locations
        ? [searchParams.locations]
        : [],
    minArea: (searchParams.minArea as string) || "",
    maxArea: (searchParams.maxArea as string) || "",
    minPrice: (searchParams.minPrice as string) || "",
    maxPrice: (searchParams.maxPrice as string) || "",
  }

  const currentPage = searchParams.page ? Number.parseInt(searchParams.page as string) : 1

  return (
    <div>
      <div className="bg-black text-white py-3 text-center text-sm">
        <p>Look in Your New Building with Flexible Payment Plans and Special Discounts!</p>
      </div>
      <SearchFilters locations={uniqueLocations} buildingNames={buildingNames} initialFilters={initialFilters} />

      <div className="container mx-auto px-4 mb-8">
        <BuildingsMap buildings={filteredBuildings} />
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Buildings Directory</h1>
            <p className="text-muted-foreground">We found {filteredBuildings.length} properties</p>
          </div>
          <Select defaultValue="default">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ClientSideBuildingsGrid buildings={filteredBuildings} initialPage={currentPage} />
      </div>
    </div>
  )
}
