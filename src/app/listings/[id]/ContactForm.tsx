'use client'

import { useActionState } from 'react'
import { submitContactForm } from '@/lib/contact-actions'

interface ContactFormProps {
  listingId: string
  buyerName: string | null
  buyerEmail: string | null
  hasContacted: boolean
}

export function ContactForm({ listingId, buyerName, buyerEmail, hasContacted }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(submitContactForm, null)

  // Already contacted (from server-side check before render)
  if (hasContacted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-medium">You&apos;ve already contacted this seller</p>
        <p className="text-green-600 text-sm mt-1">They have your contact information and will reach out if interested.</p>
      </div>
    )
  }

  // Submission succeeded — show success message
  if (state?.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-medium">Message sent!</p>
        <p className="text-green-600 text-sm mt-1">The seller has been notified and will contact you directly.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="listingId" value={listingId} />

      <div>
        <label className="block text-sm font-medium text-gray-700">Your Name</label>
        <input
          name="name"
          defaultValue={buyerName ?? ''}
          readOnly
          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm text-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Your Email</label>
        <input
          name="email"
          type="email"
          defaultValue={buyerEmail ?? ''}
          readOnly
          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm text-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
        <input
          name="phone"
          type="tel"
          placeholder="(555) 555-5555"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Message (optional)</label>
        <textarea
          name="message"
          rows={4}
          placeholder="Tell the seller why you're interested..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="text-red-600 text-sm">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
