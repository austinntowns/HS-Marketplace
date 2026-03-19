'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { contacts } from '@/db/schema/contacts'
import { listings } from '@/db/schema/listings'
import { sendContactNotification } from '@/lib/email'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const contactFormSchema = z.object({
  listingId: z.string().uuid(),
  message: z.string().optional(),
  phone: z.string().optional(),
})

export async function submitContactForm(prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: 'Not authenticated' }

  const parsed = contactFormSchema.safeParse({
    listingId: formData.get('listingId'),
    message: formData.get('message') || undefined,
    phone: formData.get('phone') || undefined,
  })
  if (!parsed.success) return { error: 'Invalid form data' }

  // Fetch listing with seller info
  const listing = await db.query.listings.findFirst({
    where: and(
      eq(listings.id, parsed.data.listingId),
      eq(listings.status, 'active'),
    ),
    with: { seller: true },
  })
  if (!listing) return { error: 'Listing not found' }

  // Check for duplicate contact
  const existing = await db.query.contacts.findFirst({
    where: and(
      eq(contacts.listingId, parsed.data.listingId),
      eq(contacts.buyerId, session.user.id!),
    ),
  })
  if (existing) return { error: 'Already contacted' }

  // Create contact record
  await db.insert(contacts).values({
    listingId: parsed.data.listingId,
    buyerId: session.user.id!,
    message: parsed.data.message,
    buyerName: session.user.name ?? null,
    buyerEmail: session.user.email ?? null,
    buyerPhone: parsed.data.phone ?? null,
  })

  // Send email notification to seller
  await sendContactNotification({
    sellerEmail: listing.seller.email!,
    sellerName: listing.seller.name ?? 'Seller',
    buyerName: session.user.name ?? 'A buyer',
    buyerEmail: session.user.email!,
    listingTitle: listing.title ?? `${listing.seller.name ?? 'Location'}`,
    listingId: listing.id,
    message: parsed.data.message,
  })

  return { success: true }
}

export async function hasContactedListing(listingId: string): Promise<boolean> {
  const session = await auth()
  if (!session?.user) return false

  const existing = await db.query.contacts.findFirst({
    where: and(
      eq(contacts.listingId, listingId),
      eq(contacts.buyerId, session.user.id!),
    ),
  })
  return !!existing
}
