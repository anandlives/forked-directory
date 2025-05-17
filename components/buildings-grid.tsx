"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Building } from "@/types/buildings"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

interface BuildingWithAvailableSpace extends Building {
  availableSpace: {
    totalAvailableArea: number | null
    availableUnitsCount: number
    averageRent: number | null
    availableUnits: (number | null)[]
  }
}

interface BuildingsGridProps {
  buildings: BuildingWithAvailableSpace[]
  currentPage: number
  onPageChange: (page: number) => void
}

const ITEMS_PER_PAGE = 12

export function BuildingsGrid({ buildings, currentPage, onPageChange }: BuildingsGridProps) {
  const totalPages = Math.ceil(buildings.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedBuildings = buildings.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const renderPaginationLinks = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => onPageChange(i)} isActive={currentPage === i}>
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      } else if (
        (i === currentPage - 2 && currentPage > 3) ||
        (i === currentPage + 2 && currentPage < totalPages - 2)
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
    }
    return pages
  }

  const formatArea = (area: number | null): string => {
    return area ? area.toLocaleString() : "N/A"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedBuildings.map((building) => (
          <div key={building.id} className="group rounded-lg overflow-hidden border bg-card">
            <Link href={`/dashboard/buildings/${building.id}`} className="block relative aspect-video overflow-hidden">
              <img
                src={building.building_image_link || "/placeholder.svg?height=400&width=600"}
                alt={building.name}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
              />
              {building.certifications && building.certifications.toLowerCase().includes("leed") && (
                <Badge className="absolute top-4 left-4 bg-green-500">LEED Certified</Badge>
              )}
            </Link>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Link href={`/dashboard/buildings/${building.id}`} className="hover:underline">
                  <h3 className="text-xl font-semibold">{building.name || "Unnamed Building"}</h3>
                </Link>
                {building.availableSpace.averageRent ? (
                  <p className="text-lg font-bold">
                    ₹{Math.round(building.availableSpace.averageRent).toLocaleString()}/sq ft
                  </p>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">Price N/A</p>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{building.location || "Location N/A"}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>
                    Total Area: {building.total_area ? `${building.total_area.toLocaleString()} sq ft` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Grade: {building.grade || "N/A"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Built: {building.year_built || "N/A"}</span>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <p className="font-semibold">Available Space:</p>
                <p>
                  {formatArea(building.availableSpace.totalAvailableArea)} sq ft in{" "}
                  {building.availableSpace.availableUnitsCount} unit(s)
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Available Units:</span>{" "}
                  {building.availableSpace.availableUnits.length > 0
                    ? building.availableSpace.availableUnits.map((area, index) => (
                        <span key={index} className="inline-block mr-2">
                          {formatArea(area)} sq ft
                          {index < building.availableSpace.availableUnits.length - 1 ? "," : ""}
                        </span>
                      ))
                    : "No units available"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} />
              </PaginationItem>
            )}
            {renderPaginationLinks()}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext onClick={() => onPageChange(currentPage + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
