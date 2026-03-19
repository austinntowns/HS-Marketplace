import { describe, it, expect, vi, beforeEach } from "vitest"

// Hoist mocks so factories can reference outer variables safely
const { mockAuth, mockQueryFn, mockInsert } = vi.hoisted(() => {
  const mockAuth = vi.fn()
  const mockQueryFn = vi.fn()
  const mockInsert = vi.fn()
  return { mockAuth, mockQueryFn, mockInsert }
})

vi.mock("@/auth", () => ({
  auth: mockAuth,
}))

vi.mock("@/lib/email", () => ({
  sendContactNotification: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock("@/db", () => ({
  db: {
    query: {
      listings: { findFirst: mockQueryFn },
      contacts: { findFirst: mockQueryFn },
    },
    insert: mockInsert,
  },
}))

// Import after mocks
import { submitContactForm, hasContactedListing } from "@/lib/contact-actions"
import { sendContactNotification } from "@/lib/email"

// Helper to build a FormData
function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, val] of Object.entries(fields)) {
    fd.append(key, val)
  }
  return fd
}

const VALID_LISTING_ID = "550e8400-e29b-41d4-a716-446655440000"

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset insert chain
    mockInsert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) })
  })

  // Test 1: returns error if not authenticated
  it("returns error if not authenticated", async () => {
    mockAuth.mockResolvedValue(null)

    const fd = makeFormData({ listingId: VALID_LISTING_ID })
    const result = await submitContactForm(null, fd)

    expect(result).toEqual({ error: "Not authenticated" })
  })

  // Test 2: returns error if listing not found
  it("returns error if listing not found", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Alice", email: "alice@example.com" },
    })
    // listings.findFirst returns null (first call), contacts.findFirst not reached
    mockQueryFn.mockResolvedValueOnce(null)

    const fd = makeFormData({ listingId: VALID_LISTING_ID })
    const result = await submitContactForm(null, fd)

    expect(result).toEqual({ error: "Listing not found" })
  })

  // Test 3: returns error if already contacted (duplicate check)
  it("returns error if already contacted", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Alice", email: "alice@example.com" },
    })
    // listings.findFirst returns a listing (first call)
    mockQueryFn.mockResolvedValueOnce({
      id: VALID_LISTING_ID,
      status: "active",
      locationName: "Test Location",
      city: "Austin",
      state: "TX",
      seller: { id: "seller-1", name: "Bob", email: "bob@hellosugar.salon" },
    })
    // contacts.findFirst returns existing contact (second call)
    mockQueryFn.mockResolvedValueOnce({ id: "contact-1" })

    const fd = makeFormData({ listingId: VALID_LISTING_ID })
    const result = await submitContactForm(null, fd)

    expect(result).toEqual({ error: "Already contacted" })
  })

  // Test 4: creates contact record on success
  it("inserts contact record on successful submission", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Alice", email: "alice@example.com" },
    })
    // listings.findFirst returns listing (first call)
    mockQueryFn.mockResolvedValueOnce({
      id: VALID_LISTING_ID,
      status: "active",
      locationName: "Test Location",
      city: "Austin",
      state: "TX",
      seller: { id: "seller-1", name: "Bob", email: "bob@hellosugar.salon" },
    })
    // contacts.findFirst returns null — no duplicate (second call)
    mockQueryFn.mockResolvedValueOnce(null)

    const insertValues = vi.fn().mockResolvedValue(undefined)
    mockInsert.mockReturnValue({ values: insertValues })

    const fd = makeFormData({
      listingId: VALID_LISTING_ID,
      message: "I am very interested!",
      phone: "555-123-4567",
    })
    await submitContactForm(null, fd)

    expect(mockInsert).toHaveBeenCalled()
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        listingId: VALID_LISTING_ID,
        buyerId: "user-1",
        message: "I am very interested!",
        buyerName: "Alice",
        buyerEmail: "alice@example.com",
        buyerPhone: "555-123-4567",
      })
    )
  })

  // Test 5: calls sendContactNotification with correct data
  it("calls sendContactNotification with correct seller and buyer data", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Alice", email: "alice@example.com" },
    })
    mockQueryFn.mockResolvedValueOnce({
      id: VALID_LISTING_ID,
      status: "active",
      locationName: null,
      city: "Austin",
      state: "TX",
      seller: { id: "seller-1", name: "Bob", email: "bob@hellosugar.salon" },
    })
    mockQueryFn.mockResolvedValueOnce(null)

    const fd = makeFormData({
      listingId: VALID_LISTING_ID,
      message: "Hello!",
    })
    await submitContactForm(null, fd)

    expect(sendContactNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerEmail: "bob@hellosugar.salon",
        sellerName: "Bob",
        buyerName: "Alice",
        buyerEmail: "alice@example.com",
        listingId: VALID_LISTING_ID,
        message: "Hello!",
      })
    )
  })

  // Test 6: returns success: true on valid submission
  it("returns success: true on valid submission", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Alice", email: "alice@example.com" },
    })
    mockQueryFn.mockResolvedValueOnce({
      id: VALID_LISTING_ID,
      status: "active",
      locationName: "Test Location",
      city: "Austin",
      state: "TX",
      seller: { id: "seller-1", name: "Bob", email: "bob@hellosugar.salon" },
    })
    mockQueryFn.mockResolvedValueOnce(null)

    const fd = makeFormData({ listingId: VALID_LISTING_ID })
    const result = await submitContactForm(null, fd)

    expect(result).toEqual({ success: true })
  })
})

describe("hasContactedListing", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns false if not authenticated", async () => {
    mockAuth.mockResolvedValue(null)

    const result = await hasContactedListing(VALID_LISTING_ID)

    expect(result).toBe(false)
  })

  it("returns false if no existing contact found", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Alice", email: "alice@example.com" },
    })
    mockQueryFn.mockResolvedValueOnce(null)

    const result = await hasContactedListing(VALID_LISTING_ID)

    expect(result).toBe(false)
  })

  it("returns true if existing contact found", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Alice", email: "alice@example.com" },
    })
    mockQueryFn.mockResolvedValueOnce({ id: "contact-1" })

    const result = await hasContactedListing(VALID_LISTING_ID)

    expect(result).toBe(true)
  })
})
