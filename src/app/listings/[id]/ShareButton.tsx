'use client'

import { useState } from 'react'

interface ShareButtonProps {
  listingName: string
}

export function ShareButton({ listingName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    const shareData = {
      title: `${listingName} - Hello Sugar Marketplace`,
      url,
    }

    // Use native share API on mobile if available
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <button
      onClick={handleShare}
      className="
        inline-flex items-center gap-2 px-4 py-2.5
        border border-gray-300 rounded-xl bg-white
        text-sm font-medium text-gray-700
        hover:bg-gray-50 hover:border-gray-400
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2
        min-h-[44px]
      "
      aria-label="Share listing"
    >
      {copied ? (
        <>
          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </>
      )}
    </button>
  )
}
