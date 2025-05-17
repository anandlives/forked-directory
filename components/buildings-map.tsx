"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { Building } from "@/types/buildings"

interface BuildingsMapProps {
  buildings: (Building & {
    availableSpace: {
      totalAvailableArea: number
      availableUnitsCount: number
      averageRent: number
    }
  })[]
}

export function BuildingsMap({ buildings }: BuildingsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: number]: mapboxgl.Marker }>({})
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapboxToken, setMapboxToken] = useState<string>("")

  // Add this useEffect to fetch the token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch("/api/mapbox-token")
        const data = await response.json()
        if (data.token) {
          mapboxgl.accessToken = data.token
          setMapboxToken(data.token)
        }
      } catch (error) {
        console.error("Error fetching Mapbox token:", error)
      }
    }

    fetchMapboxToken()
  }, [])

  // Update the map initialization to wait for the token
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [78.9629, 20.5937],
      zoom: 5,
      attributionControl: false,
    })

    map.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
      }),
      "bottom-right",
    )

    map.current.on("load", () => {
      setMapLoaded(true)
    })

    // Note: We've removed all transit and metro layers to resolve styling conflicts

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapboxToken])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    const bounds = new mapboxgl.LngLatBounds()
    let hasValidCoordinates = false

    buildings.forEach((building) => {
      try {
        if (building.google_coordinates) {
          const [lat, lng] = building.google_coordinates.split(",").map(Number)
          if (!isNaN(lat) && !isNaN(lng)) {
            hasValidCoordinates = true

            // Create custom marker element
            const el = document.createElement("div")
            el.className = "custom-marker"
            const isLeedCertified = building.certifications?.toLowerCase().includes("leed")
            el.innerHTML = `
              <div class="marker-pin ${isLeedCertified ? "leed-certified" : ""}"></div>
            `

            // Create popup
            const popup = new mapboxgl.Popup({
              closeButton: false,
              maxWidth: "300px",
              offset: [0, -15],
            }).setHTML(`
              <div class="p-2">
                <p class="font-semibold mb-1">${building.name}</p>
                <p class="text-gray-600">Available: ${building.availableSpace.totalAvailableArea.toLocaleString()} sq ft</p>
              </div>
            `)

            // Add marker to map
            const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).setPopup(popup).addTo(map.current!)

            markersRef.current[building.id] = marker
            bounds.extend([lng, lat])
          }
        }
      } catch (error) {
        console.error(`Error processing coordinates for building ${building.name}:`, error)
      }
    })

    // Fit bounds if we have valid coordinates
    if (hasValidCoordinates && map.current) {
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
      })
    }
  }, [buildings, mapLoaded])

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border shadow-sm bg-white relative">
      <style jsx global>{`
        .custom-marker {
          width: 30px;
          height: 30px;
        }
        
        .marker-pin {
          width: 30px;
          height: 30px;
          background-color: #3b82f6; /* Default blue color */
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s;
        }

        .marker-pin.leed-certified {
          background-color: #22c55e; /* Green color for LEED certified */
        }
        
        .marker-pin:hover {
          transform: scale(1.1);
        }

        .mapboxgl-popup {
          z-index: 3;
        }

        .mapboxgl-canvas-container {
          z-index: 1;
        }

        .mapboxgl-ctrl-top-right {
          z-index: 2;
        }

        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          font-family: system-ui, sans-serif;
        }

        .mapboxgl-ctrl-bottom-right {
          bottom: 24px;
          right: 24px;
        }

        .mapboxgl-ctrl-group {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .mapboxgl-ctrl-group button {
          width: 36px;
          height: 36px;
        }

        .mapboxgl-ctrl-group button + button {
          border-top: 1px solid #e2e8f0;
        }

        .mapboxgl-map {
          font-family: system-ui, sans-serif;
        }

        .mapboxgl-map .mapboxgl-ctrl-logo {
          display: none;
        }
      `}</style>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}
