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
  const [startIndex, setStartIndex] = useState(0)

  function handlePhotoClick(index: number) {
    setStartIndex(index)
    setGalleryOpen(true)
  }

  function handleShowAll() {
    setStartIndex(0)
    setGalleryOpen(true)
  }

  return (
    <>
      <PhotoCollage
        photos={photos}
        onShowAll={handleShowAll}
        onPhotoClick={handlePhotoClick}
      />
      <FullGallery
        photos={photos}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        startIndex={startIndex}
      />
    </>
  )
}
