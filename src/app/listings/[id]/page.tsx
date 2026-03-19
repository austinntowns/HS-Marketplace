import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getListingById } from '@/lib/listing-detail'
import { hasContactedListing } from '@/lib/contact-actions'
import { ListingPhotos } from './ListingPhotos'
import { ContactForm } from './ContactForm'
import { FinancialsGrid } from '@/components/listing-detail/FinancialsGrid'
import { DetailMap } from '@/components/listing-detail/DetailMap'
import { KpiPlaceholder } from '@/components/listing-detail/KpiPlaceholder'
import { FloatingContactCta } from '@/components/listing-detail/FloatingContactCta'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await getListingById(id)
  if (!listing) return { title: 'Listing Not Found' }

  const primaryLocation = listing.locations[0]
  const displayName = listing.title || primaryLocation?.name || `${primaryLocation?.city}, ${primaryLocation?.state}`

  return {
    title: `${displayName} - Hello Sugar Marketplace`,
    description: `${listing.type} listing${primaryLocation?.city ? ` in ${primaryLocation.city}, ${primaryLocation.state}` : ''}`,
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params

  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const listing = await getListingById(id)
  if (!listing) {
    notFound()
  }

  const contacted = await hasContactedListing(listing.id)

  // Primary salon location for display
  const primaryLocation = listing.locations.find(l => l.locationType === 'salon') ?? listing.locations[0]

  // Coordinates for map (first salon location with coords)
  const mapLocation = listing.locations.find(
    l => l.locationType === 'salon' || (l.territoryLat != null && l.territoryLng != null)
  )
  const mapLat = mapLocation?.locationType === 'territory'
    ? mapLocation.territoryLat
    : null // salon locations don't store lat/lng directly in this schema
  const mapLng = mapLocation?.locationType === 'territory'
    ? mapLocation.territoryLng
    : null

  const displayName = listing.title || primaryLocation?.name || 'Listing'

  const photos = listing.photos.map(p => ({ id: p.id, url: p.url }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Photo Gallery */}
      <ListingPhotos photos={photos} />

      {/* Header: Name, Type Badge, Location */}
      <div className="mt-6">
        <span className="inline-block px-3 py-1 text-sm font-medium bg-pink-100 text-pink-800 rounded-full capitalize">
          {listing.type}
        </span>
        <h1 className="text-3xl font-bold mt-2 text-gray-900">{displayName}</h1>
        {listing.locations.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {listing.locations.map(loc => (
              <p key={loc.id} className="text-gray-600">
                {loc.name}
                {loc.city && ` — ${loc.city}, ${loc.state}`}
                {loc.squareFootage && ` · ${loc.squareFootage.toLocaleString()} sq ft`}
                {loc.openingDate && ` · Opened ${new Date(loc.openingDate).getFullYear()}`}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Two column layout on desktop */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2 cols */}
        <div className="lg:col-span-2 space-y-8">
          {/* Financials */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Financials</h2>
            <FinancialsGrid listing={listing} />
          </section>

          {/* KPI Placeholder */}
          <section>
            <KpiPlaceholder />
          </section>

          {/* About / Notes */}
          {listing.notes && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">About This Location</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.notes}</p>
            </section>
          )}

          {/* Reason for Selling */}
          {listing.reasonForSelling && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Reason for Selling</h2>
              <p className="text-gray-700">{listing.reasonForSelling}</p>
            </section>
          )}
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-6">
          {/* Map — only shown for territory listings which have lat/lng */}
          {mapLat && mapLng && (
            <DetailMap
              latitude={mapLat}
              longitude={mapLng}
              locationName={primaryLocation?.name ?? null}
            />
          )}

          {/* Location details card */}
          {listing.locations.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
              <h3 className="font-semibold text-gray-900">Location Details</h3>
              {listing.locations.map(loc => (
                <div key={loc.id} className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-800">{loc.name}</p>
                  {loc.address && <p>{loc.address}</p>}
                  {loc.city && <p>{loc.city}, {loc.state} {loc.zipCode}</p>}
                  {loc.squareFootage && <p>{loc.squareFootage.toLocaleString()} sq ft</p>}
                  {loc.openingDate && (
                    <p>Opened {new Date(loc.openingDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Contact CTA */}
      <FloatingContactCta />

      {/* Contact Form Section */}
      <section id="contact" className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Contact Seller</h2>
        <div className="max-w-md">
          <ContactForm
            listingId={listing.id}
            buyerName={session.user.name ?? null}
            buyerEmail={session.user.email ?? null}
            hasContacted={contacted}
          />
        </div>
      </section>
    </div>
  )
}
