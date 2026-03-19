'use client'

import { useState } from 'react'
import { PhotoCollage } from '@/components/listing-detail/PhotoCollage'
import { FullGallery } from '@/components/listing-detail/FullGallery'

interface Photo {
  id: string
  url: string
}

interface ListingPhotosProps {
  photos: Photo[]
}

export function ListingPhotos({ photos }: ListingPhotosProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)

  return (
    <>
      <PhotoCollage
        photos={photos}
        onShowAll={() => setGalleryOpen(true)}
      />
      <FullGallery
        photos={photos}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </>
  )
}
