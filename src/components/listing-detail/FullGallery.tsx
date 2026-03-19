'use client'

import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface Photo {
  id: string
  url: string
}

interface FullGalleryProps {
  photos: Photo[]
  open: boolean
  onClose: () => void
  startIndex?: number
}

export function FullGallery({ photos, open, onClose, startIndex = 0 }: FullGalleryProps) {
  const slides = photos.map(p => ({ src: p.url }))

  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={slides}
      index={startIndex}
    />
  )
}
