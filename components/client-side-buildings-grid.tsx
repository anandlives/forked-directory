"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BuildingsGrid } from "./buildings-grid"
import type { Building } from "@/types/buildings"

interface ClientSideBuildingsGridProps {
  buildings: (Building & {
    availableSpace: {
      totalAvailableArea: number | null
      availableUnitsCount: number
      averageRent: number | null
      availableUnits: (number | null)[]
    }
  })[]
  initialPage: number
}

export function ClientSideBuildingsGrid({ buildings, initialPage }: ClientSideBuildingsGridProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(initialPage)

  useEffect(() => {
    // Update URL when page changes, but preserve other search params
    if (currentPage !== initialPage) {
      const url = new URL(window.location.href)
      url.searchParams.set("page", currentPage.toString())
      router.push(url.pathname + url.search)
    }
  }, [currentPage, initialPage, router])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return <BuildingsGrid buildings={buildings} currentPage={currentPage} onPageChange={handlePageChange} />
}
