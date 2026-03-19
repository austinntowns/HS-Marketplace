'use client'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Photo } from '@/lib/listings/types'

interface SortablePhotoProps {
  photo: Photo
  isFirst: boolean
  onRemove: (id: string) => void
}

function SortablePhoto({ photo, isFirst, onRemove }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
      {...attributes}
      {...listeners}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt="" className="w-full h-full object-cover" />
      {isFirst && (
        <span className="absolute top-2 left-2 bg-pink-600 text-white text-xs px-2 py-1 rounded">
          Cover
        </span>
      )}
      <button
        type="button"
        onClick={() => onRemove(photo.id)}
        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
      >
        ×
      </button>
    </div>
  )
}

interface PhotoGridProps {
  photos: Photo[]
  onReorder: (photos: Photo[]) => void
  onRemove: (id: string) => void
}

export function PhotoGrid({ photos, onReorder, onRemove }: PhotoGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = photos.findIndex(p => p.id === active.id)
      const newIndex = photos.findIndex(p => p.id === over?.id)
      const reordered = arrayMove(photos, oldIndex, newIndex)
      onReorder(reordered.map((p, i) => ({ ...p, order: i })))
    }
  }

  if (photos.length === 0) {
    return null
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {photos.map((photo, index) => (
            <SortablePhoto
              key={photo.id}
              photo={photo}
              isFirst={index === 0}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
