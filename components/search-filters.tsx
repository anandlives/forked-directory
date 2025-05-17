"use client"

import type React from "react"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface SearchFiltersProps {
  locations: string[]
  buildingNames: string[]
  initialFilters: {
    name: string
    locations: string[]
    minArea: string
    maxArea: string
    minPrice: string
    maxPrice: string
  }
}

export function SearchFilters({ locations, buildingNames, initialFilters }: SearchFiltersProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [openBuildingSearch, setOpenBuildingSearch] = useState(false)
  const [selectedLocations, setSelectedLocations] = useState<string[]>(initialFilters.locations)
  const [buildingName, setBuildingName] = useState(initialFilters.name)
  const [minArea, setMinArea] = useState(initialFilters.minArea)
  const [maxArea, setMaxArea] = useState(initialFilters.maxArea)
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice)
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const searchParams = new URLSearchParams()

    if (buildingName) searchParams.set("name", buildingName)

    if (selectedLocations.length > 0) {
      selectedLocations.forEach((location) => searchParams.append("locations", location))
    }

    if (minArea) searchParams.set("minArea", minArea)
    if (maxArea) searchParams.set("maxArea", maxArea)
    if (minPrice) searchParams.set("minPrice", minPrice)
    if (maxPrice) searchParams.set("maxPrice", maxPrice)

    // Preserve the current page if it exists
    const currentPage = new URLSearchParams(window.location.search).get("page")
    if (currentPage) searchParams.set("page", currentPage)

    router.push(`/dashboard?${searchParams.toString()}`)
  }

  const resetFilters = () => {
    setBuildingName("")
    setSelectedLocations([])
    setMinArea("")
    setMaxArea("")
    setMinPrice("")
    setMaxPrice("")
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSearch} className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <p className="mb-2 text-sm">Looking For</p>
          <Popover open={openBuildingSearch} onOpenChange={setOpenBuildingSearch}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={openBuildingSearch}
                className="w-full justify-between"
              >
                {buildingName || "Search buildings..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search buildings..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No buildings found.</CommandEmpty>
                  <CommandGroup>
                    {buildingNames.map((name) => (
                      <CommandItem
                        key={name}
                        onSelect={() => {
                          setBuildingName(name)
                          setOpenBuildingSearch(false)
                        }}
                      >
                        {name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <p className="mb-2 text-sm">Area Requirement (sq ft)</p>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Min" type="number" value={minArea} onChange={(e) => setMinArea(e.target.value)} />
            <Input placeholder="Max" type="number" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm">Price Range (₹/sq ft)</p>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Min" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <Input placeholder="Max" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm">Location</p>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedLocations.length === 0 ? "Select locations" : `${selectedLocations.length} selected`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search locations..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No location found.</CommandEmpty>
                  <CommandGroup>
                    {locations.map((location) => (
                      <CommandItem
                        key={location}
                        onSelect={() => {
                          setSelectedLocations((prev) =>
                            prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location],
                          )
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedLocations.includes(location) ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {location}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col">
          <p className="mb-2 text-sm">Search</p>
          <Button type="submit" className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
        <div className="flex flex-col">
          <p className="mb-2 text-sm">Reset</p>
          <Button type="button" variant="outline" className="w-full" onClick={resetFilters}>
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>
    </form>
  )
}
