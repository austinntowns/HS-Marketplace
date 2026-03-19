import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { listings, listingPhotos } from '@/db/schema/listings'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userListings = await db.query.listings.findMany({
    where: eq(listings.sellerId, session.user.id!),
    orderBy: [desc(listings.createdAt)],
    with: {
      locations: true,
      photos: { orderBy: [listingPhotos.displayOrder] },
    },
  })

  return NextResponse.json(userListings)
}
