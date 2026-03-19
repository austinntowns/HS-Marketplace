'use client'

import { useState, useCallback } from 'react'
import { upload } from '@vercel/blob/client'
import { nanoid } from 'nanoid'
import { compressImage } from '@/lib/upload/compress'
import type { Photo } from '@/lib/listings/types'

interface UploadProgress {
  id: string
  filename: string
  percentage: number
  status: 'uploading' | 'complete' | 'error'
}

interface PhotoUploaderProps {
  onUploadComplete: (photo: Photo) => void
  currentCount: number
  maxCount: number
}

export function PhotoUploader({ onUploadComplete, currentCount, maxCount }: PhotoUploaderProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])

  const handleFiles = useCallback(async (files: FileList) => {
    const remaining = maxCount - currentCount
    const filesToUpload = Array.from(files).slice(0, remaining)

    for (const file of filesToUpload) {
      const id = nanoid()

      setUploads(prev => [...prev, {
        id,
        filename: file.name,
        percentage: 0,
        status: 'uploading',
      }])

      try {
        const compressed = await compressImage(file)

        const blob = await upload(compressed.name, compressed, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          onUploadProgress: (e) => {
            setUploads(prev => prev.map(u =>
              u.id === id ? { ...u, percentage: e.percentage } : u
            ))
          },
        })

        setUploads(prev => prev.map(u =>
          u.id === id ? { ...u, status: 'complete', percentage: 100 } : u
        ))

        onUploadComplete({
          id,
          url: blob.url,
          filename: file.name,
          order: currentCount,
        })

        // Remove from progress list after a delay
        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.id !== id))
        }, 1000)
      } catch (error) {
        console.error('Upload failed:', error)
        setUploads(prev => prev.map(u =>
          u.id === id ? { ...u, status: 'error' } : u
        ))
      }
    }
  }, [currentCount, maxCount, onUploadComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const canUpload = currentCount < maxCount

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${canUpload ? 'border-gray-300 hover:border-pink-400 cursor-pointer' : 'border-gray-200 bg-gray-50'}
        `}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          id="photo-upload"
          disabled={!canUpload}
        />
        <label htmlFor="photo-upload" className={canUpload ? 'cursor-pointer' : 'cursor-not-allowed'}>
          <div className="text-gray-500">
            {canUpload ? (
              <>
                <p className="font-medium">Drop photos here or click to upload</p>
                <p className="text-sm mt-1">
                  {currentCount}/{maxCount} photos • JPG, PNG, WebP up to 10MB
                </p>
              </>
            ) : (
              <p>Maximum {maxCount} photos reached</p>
            )}
          </div>
        </label>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map(u => (
            <div key={u.id} className="flex items-center gap-3 text-sm">
              <span className="truncate flex-1">{u.filename}</span>
              {u.status === 'uploading' && (
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-600 transition-all"
                    style={{ width: `${u.percentage}%` }}
                  />
                </div>
              )}
              {u.status === 'complete' && <span className="text-green-600">✓</span>}
              {u.status === 'error' && <span className="text-red-600">Failed</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
