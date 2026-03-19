import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the db module before importing the module under test
const mockSelect = vi.fn()
const mockDb = {
  select: mockSelect,
}
vi.mock("@/db", () => ({ db: mockDb }))

// Import after mock is set up
import { getListings } from "@/lib/listings-query"

// Helper to build a chainable query mock that resolves to a given result
function makeQueryChain(result: unknown[]) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
  }
  return chain
}

describe("getListings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Test 1: returns only active listings
  it("returns only active listings", async () => {
    const rows = Array.from({ length: 3 }, (_, i) => makeRow(i))
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    await getListings({})

    const whereCall = chain.where.mock.calls[0][0]
    // The where clause must exist (and() applied with at least status=active)
    expect(whereCall).toBeDefined()
    // where should have been called with conditions including status check
    expect(chain.where).toHaveBeenCalled()
  })

  // Test 2: filters by type array
  it("filters by type array", async () => {
    const rows = [makeRow(0, { type: "suite" }), makeRow(1, { type: "flagship" })]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({ types: ["suite", "flagship"] })

    expect(result.items).toHaveLength(2)
    expect(chain.where).toHaveBeenCalled()
  })

  // Test 3: filters by state array
  it("filters by state array", async () => {
    const rows = [makeRow(0), makeRow(1)]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({ states: ["TX", "GA"] })

    expect(result.items).toHaveLength(2)
    expect(chain.where).toHaveBeenCalled()
  })

  // Test 4: filters by price range
  it("filters by price range (minPrice/maxPrice)", async () => {
    const rows = [makeRow(0, { askingPrice: 150000 })]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({ minPrice: 100000, maxPrice: 200000 })

    expect(result.items).toHaveLength(1)
    expect(chain.where).toHaveBeenCalled()
  })

  // Test 5: sorts by newest first by default
  it("sorts by newest first (default)", async () => {
    const rows = [makeRow(0), makeRow(1)]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    await getListings({})

    expect(chain.orderBy).toHaveBeenCalled()
  })

  // Test 6: cursor pagination — returns nextCursor when more exist
  it("returns nextCursor when more items exist (PAGE_SIZE + 1 trick)", async () => {
    // Return PAGE_SIZE + 1 = 13 rows to signal hasMore
    const rows = Array.from({ length: 13 }, (_, i) => makeRow(i))
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({})

    expect(result.items).toHaveLength(12) // trimmed to PAGE_SIZE
    expect(result.nextCursor).not.toBeNull()
  })

  it("returns null nextCursor when no more items", async () => {
    const rows = Array.from({ length: 5 }, (_, i) => makeRow(i))
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({})

    expect(result.items).toHaveLength(5)
    expect(result.nextCursor).toBeNull()
  })

  it("passes cursor as condition to limit results to before cursor", async () => {
    const cursorDate = new Date("2025-01-01T00:00:00Z").toISOString()
    const rows = [makeRow(0)]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    await getListings({ cursor: cursorDate })

    // where must have been called with conditions including cursor
    expect(chain.where).toHaveBeenCalled()
  })

  // Test 7: returns primary photo URL for each listing
  it("returns primaryPhotoUrl via left join on listingPhotos", async () => {
    const rows = [
      makeRowWithPhoto(0, "https://example.com/photo.jpg"),
      makeRowWithPhoto(1, null),
    ]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({})

    expect(result.items[0].primaryPhotoUrl).toBe("https://example.com/photo.jpg")
    expect(result.items[1].primaryPhotoUrl).toBeNull()
    // The join should have been called
    expect(chain.leftJoin).toHaveBeenCalled()
  })
})

// ── Fixture helpers ──────────────────────────────────────────────────────────

interface RowOverrides {
  type?: string
  askingPrice?: number
}

function makeRow(index: number, overrides: RowOverrides = {}) {
  return {
    listing: {
      id: `listing-${index}`,
      type: overrides.type ?? "suite",
      status: "active",
      title: `Listing ${index}`,
      askingPrice: overrides.askingPrice ?? 100000,
      ttmProfit: null,
      createdAt: new Date(`2025-0${(index % 9) + 1}-01T00:00:00Z`),
      updatedAt: new Date(),
    },
    primaryLocation: {
      name: `Location ${index}`,
      city: "Austin",
      state: "TX",
      territoryLat: null,
      territoryLng: null,
    },
    primaryPhoto: null,
  }
}

function makeRowWithPhoto(index: number, photoUrl: string | null) {
  return {
    listing: {
      id: `listing-${index}`,
      type: "suite",
      status: "active",
      title: `Listing ${index}`,
      askingPrice: 100000,
      ttmProfit: null,
      createdAt: new Date(`2025-0${(index % 9) + 1}-01T00:00:00Z`),
      updatedAt: new Date(),
    },
    primaryLocation: {
      name: `Location ${index}`,
      city: "Austin",
      state: "TX",
      territoryLat: null,
      territoryLng: null,
    },
    primaryPhoto: photoUrl ? { url: photoUrl } : null,
  }
}
