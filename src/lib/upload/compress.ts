'use client'

// Client-side image compression before upload
// Source: https://www.npmjs.com/package/browser-image-compression
import imageCompression from 'browser-image-compression'

export async function compressImage(file: File): Promise<File> {
  // Skip if already small (< 500KB)
  if (file.size < 500 * 1024) return file

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    fileType: 'image/webp' as const,
  }

  try {
    const compressed = await imageCompression(file, options)
    return new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), {
      type: 'image/webp',
    })
  } catch (error) {
    console.warn('Compression failed, using original:', error)
    return file
  }
}
