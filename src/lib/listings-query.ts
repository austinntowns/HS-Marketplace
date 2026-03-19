"use server"

import { db } from "@/db"
import { listings, listingLocations, listingPhotos } from "@/db/schema/listings"
import { and, desc, asc, lt, inArray, gte, lte, eq, ilike, or } from "drizzle-orm"

const PAGE_SIZE = 12

export interface ListingFilters {
  types?: string[]
  states?: string[]
  minPrice?: number
  maxPrice?: number
  cursor?: string // ISO timestamp from createdAt
  sort?: "newest" | "price-asc" | "price-desc"
  query?: string // text search: location name, city, or notes
  minYearsOpen?: number // minimum years a location has been open
}

export interface ListingCard {
  id: string
  type: "suite" | "flagship" | "territory" | "bundle"
  locationName: string | null
  city: string | null
  state: string | null
  askingPrice: number
  latitude: number | null
  longitude: number | null
  createdAt: Date
  primaryPhotoUrl: string | null
}

export interface ListingsResult {
  items: ListingCard[]
  nextCursor: string | null
}

export async function getListings(filters: ListingFilters): Promise<ListingsResult> {
  const { types, states, minPrice, maxPrice, cursor, sort = "newest", query, minYearsOpen } = filters

  // Build WHERE conditions
  const conditions = [
    eq(listings.status, "active"),
    types && types.length > 0 ? inArray(listings.type, types as ("suite" | "flagship" | "territory" | "bundle")[]) : undefined,
    states && states.length > 0 ? inArray(listingLocations.state, states) : undefined,
    minPrice !== undefined ? gte(listings.askingPrice, minPrice) : undefined,
    maxPrice !== undefined ? lte(listings.askingPrice, maxPrice) : undefined,
    cursor ? lt(listings.createdAt, new Date(cursor)) : undefined,
    query && query.trim()
      ? or(
          ilike(listingLocations.name, `%${query.trim()}%`),
          ilike(listingLocations.city, `%${query.trim()}%`),
          ilike(listings.notes, `%${query.trim()}%`)
        )
      : undefined,
    minYearsOpen && minYearsOpen > 0
      ? lte(listingLocations.openingDate, new Date(Date.now() - minYearsOpen * 365.25 * 24 * 60 * 60 * 1000))
      : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined)

  // Determine sort order
  const orderBy =
    sort === "price-asc"
      ? asc(listings.askingPrice)
      : sort === "price-desc"
        ? desc(listings.askingPrice)
        : desc(listings.createdAt) // "newest" default

  // Join primary location (displayOrder = 0) and primary photo (displayOrder = 0)
  const rows = await db
    .select({
      listing: {
        id: listings.id,
        type: listings.type,
        askingPrice: listings.askingPrice,
        createdAt: listings.createdAt,
      },
      primaryLocation: {
        name: listingLocations.name,
        city: listingLocations.city,
        state: listingLocations.state,
        territoryLat: listingLocations.territoryLat,
        territoryLng: listingLocations.territoryLng,
      },
      primaryPhoto: {
        url: listingPhotos.url,
      },
    })
    .from(listings)
    .leftJoin(
      listingLocations,
      and(
        eq(listingLocations.listingId, listings.id),
        eq(listingLocations.displayOrder, 0),
      ),
    )
    .leftJoin(
      listingPhotos,
      and(
        eq(listingPhotos.listingId, listings.id),
        eq(listingPhotos.displayOrder, 0),
      ),
    )
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(PAGE_SIZE + 1)

  const hasMore = rows.length > PAGE_SIZE
  const pageRows = rows.slice(0, PAGE_SIZE)

  const items: ListingCard[] = pageRows.map((row) => ({
    id: row.listing.id,
    type: row.listing.type,
    locationName: row.primaryLocation?.name ?? null,
    city: row.primaryLocation?.city ?? null,
    state: row.primaryLocation?.state ?? null,
    askingPrice: row.listing.askingPrice,
    latitude: row.primaryLocation?.territoryLat ?? null,
    longitude: row.primaryLocation?.territoryLng ?? null,
    createdAt: row.listing.createdAt,
    primaryPhotoUrl: row.primaryPhoto?.url ?? null,
  }))

  const nextCursor = hasMore ? pageRows[PAGE_SIZE - 1].listing.createdAt.toISOString() : null

  return { items, nextCursor }
}
