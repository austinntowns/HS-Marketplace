"use client"

import { useEffect, useRef } from "react"
import * as maptilersdk from "@maptiler/sdk"
import "@maptiler/sdk/dist/maptiler-sdk.css"
import type { ListingCard } from "@/lib/listings-query"

interface MapViewProps {
  listings: ListingCard[]
  hoveredId: string | null
  onHover: (id: string | null) => void
  onListingClick: (id: string) => void
  center?: { lng: number; lat: number } | null
}

function formatPrice(cents: number): string {
  const dollars = cents / 100
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}k`
  return `$${dollars.toLocaleString()}`
}

export function MapView({ listings, hoveredId, onHover, onListingClick, center }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maptilersdk.Map | null>(null)
  const markers = useRef<{ marker: maptilersdk.Marker; id: string }[]>([])
  const mapReady = useRef(false)

  // Initialize map once
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY!

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [-95, 39],
      zoom: 4,
    })

    map.current.on("load", () => {
      mapReady.current = true
    })

    return () => {
      map.current?.remove()
      map.current = null
      mapReady.current = false
    }
  }, [])

  // Update markers when listings change
  useEffect(() => {
    if (!map.current) return

    const addMarkers = () => {
      // Remove existing markers
      markers.current.forEach(({ marker }) => marker.remove())
      markers.current = []

      const validListings = listings.filter(
        (l) => l.latitude !== null && l.longitude !== null
      )

      for (const listing of validListings) {
        const el = document.createElement("div")
        el.className =
          "map-marker w-8 h-8 bg-pink-600 border-2 border-white rounded-full cursor-pointer flex items-center justify-center shadow-md transition-transform hover:scale-110"
        el.style.cssText = `
          width: 32px;
          height: 32px;
          background-color: #db2777;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: transform 0.15s ease;
        `
        el.dataset.listingId = listing.id

        const popup = new maptilersdk.Popup({
          offset: 20,
          closeButton: false,
          maxWidth: "220px",
        }).setHTML(`
          <div style="font-family: sans-serif; padding: 4px;">
            ${listing.primaryPhotoUrl ? `<img src="${listing.primaryPhotoUrl}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />` : ""}
            <div style="font-size:16px;font-weight:600;color:#111;">${formatPrice(listing.askingPrice)}</div>
            <div style="font-size:13px;color:#6b7280;">${[listing.city, listing.state].filter(Boolean).join(", ") || "Location not specified"}</div>
            <div style="margin-top:6px;">
              <span style="font-size:11px;font-weight:500;background:#fce7f3;color:#9d174d;padding:2px 8px;border-radius:999px;">${listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}</span>
            </div>
            <a href="/listings/${listing.id}" style="display:block;margin-top:8px;font-size:13px;color:#db2777;font-weight:500;">View listing →</a>
          </div>
        `)

        const marker = new maptilersdk.Marker({ element: el })
          .setLngLat([listing.longitude!, listing.latitude!])
          .setPopup(popup)
          .addTo(map.current!)

        el.addEventListener("mouseenter", () => {
          onHover(listing.id)
        })
        el.addEventListener("mouseleave", () => {
          onHover(null)
        })
        el.addEventListener("click", () => {
          popup.addTo(map.current!)
        })

        markers.current.push({ marker, id: listing.id })
      }

      // Auto-fit bounds to show all markers
      if (validListings.length > 0) {
        const bounds = new maptilersdk.LngLatBounds()
        validListings.forEach((l) => {
          bounds.extend([l.longitude!, l.latitude!])
        })
        map.current?.fitBounds(bounds, { padding: 60, maxZoom: 14 })
      }
    }

    if (mapReady.current) {
      addMarkers()
    } else {
      map.current.once("load", addMarkers)
    }
  }, [listings, onHover])

  // Highlight hovered marker
  useEffect(() => {
    for (const { marker, id } of markers.current) {
      const el = marker.getElement()
      if (id === hoveredId) {
        el.style.transform = "scale(1.3)"
        el.style.zIndex = "10"
        el.style.backgroundColor = "#9d174d"
      } else {
        el.style.transform = "scale(1)"
        el.style.zIndex = ""
        el.style.backgroundColor = "#db2777"
      }
    }
  }, [hoveredId])

  // Re-center map when location search fires
  useEffect(() => {
    if (!center || !map.current) return
    map.current.flyTo({ center: [center.lng, center.lat], zoom: 10 })
  }, [center])

  return (
    <div ref={mapContainer} className="h-full w-full" />
  )
}
