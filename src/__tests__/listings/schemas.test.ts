import { describe, it, expect } from 'vitest'
import { typeLocationSchema, financialsSchema, photosDetailsSchema, listingSchema } from '@/lib/listings/schemas'

describe('typeLocationSchema', () => {
  it('rejects empty locations array', () => {
    const result = typeLocationSchema.safeParse({
      type: 'suite',
      locations: [],
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid suite with location', () => {
    const result = typeLocationSchema.safeParse({
      type: 'suite',
      locations: [{ id: '1', type: 'salon', name: 'Test Salon' }],
    })
    expect(result.success).toBe(true)
  })

  it('requires territory fields for territory type', () => {
    const result = typeLocationSchema.safeParse({
      type: 'territory',
      locations: [{ id: '1', type: 'territory', name: 'Test Territory' }], // missing lat/lng/radius
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid territory with all required fields', () => {
    const result = typeLocationSchema.safeParse({
      type: 'territory',
      locations: [{
        id: '1',
        type: 'territory',
        name: 'Test Territory',
        territoryLat: 33.749,
        territoryLng: -84.388,
        territoryRadius: 5000,
      }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid listing type', () => {
    const result = typeLocationSchema.safeParse({
      type: 'invalid',
      locations: [{ id: '1', type: 'salon', name: 'Test Salon' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('financialsSchema', () => {
  it('requires positive askingPrice', () => {
    const result = financialsSchema.safeParse({ askingPrice: -100 })
    expect(result.success).toBe(false)
  })

  it('rejects zero askingPrice', () => {
    const result = financialsSchema.safeParse({ askingPrice: 0 })
    expect(result.success).toBe(false)
  })

  it('accepts valid financials', () => {
    const result = financialsSchema.safeParse({ askingPrice: 50000 })
    expect(result.success).toBe(true)
  })

  it('accepts financials with optional fields', () => {
    const result = financialsSchema.safeParse({
      askingPrice: 75000,
      ttmProfit: 30000,
      reasonForSelling: 'Relocating to another state',
    })
    expect(result.success).toBe(true)
  })

  it('rejects reasonForSelling over 500 characters', () => {
    const result = financialsSchema.safeParse({
      askingPrice: 50000,
      reasonForSelling: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe('photosDetailsSchema', () => {
  const validPhoto = {
    id: '1',
    url: 'https://example.com/photo.jpg',
    filename: 'photo.jpg',
    order: 0,
  }

  it('requires at least 1 photo', () => {
    const result = photosDetailsSchema.safeParse({
      photos: [],
      inventoryIncluded: false,
      laserIncluded: false,
    })
    expect(result.success).toBe(false)
  })

  it('rejects more than 10 photos', () => {
    const photos = Array.from({ length: 11 }, (_, i) => ({
      id: `${i}`,
      url: `https://example.com/${i}.jpg`,
      filename: `${i}.jpg`,
      order: i,
    }))
    const result = photosDetailsSchema.safeParse({
      photos,
      inventoryIncluded: false,
      laserIncluded: false,
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid photos and details', () => {
    const result = photosDetailsSchema.safeParse({
      photos: [validPhoto],
      inventoryIncluded: true,
      laserIncluded: false,
    })
    expect(result.success).toBe(true)
  })

  it('accepts exactly 10 photos', () => {
    const photos = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      url: `https://example.com/${i}.jpg`,
      filename: `${i}.jpg`,
      order: i,
    }))
    const result = photosDetailsSchema.safeParse({
      photos,
      inventoryIncluded: false,
      laserIncluded: false,
    })
    expect(result.success).toBe(true)
  })
})
