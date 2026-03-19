'use client'

import { useMapEvents } from 'react-leaflet'

interface MapClickHandlerProps {
  onMapClick: (latlng: { lat: number; lng: number }) => void
}

export default function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}
