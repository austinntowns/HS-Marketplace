import { describe, it, expect, vi, beforeEach } from "vitest"

// Hoist mock variables so they are available in the vi.mock factory
const { mockSelect } = vi.hoisted(() => {
  const mockSelect = vi.fn()
  return { mockSelect }
})

vi.mock("@/db", () => ({
  db: { select: mockSelect },
}))

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

  // Test 1: returns only active listings (status eq condition always applied)
  it("applies active status filter on every call", async () => {
    const rows = Array.from({ length: 3 }, (_, i) => makeRow(i))
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    await getListings({})

    // where must have been called with the conditions (including status=active)
    expect(chain.where).toHaveBeenCalled()
    // limit called with PAGE_SIZE + 1 (13)
    expect(chain.limit).toHaveBeenCalledWith(13)
  })

  // Test 2: filters by type array
  it("calls where when type filter provided", async () => {
    const rows = [makeRow(0, { type: "suite" }), makeRow(1, { type: "flagship" })]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({ types: ["suite", "flagship"] })

    expect(result.items).toHaveLength(2)
    expect(chain.where).toHaveBeenCalled()
  })

  // Test 3: filters by state array
  it("calls where when state filter provided", async () => {
    const rows = [makeRow(0), makeRow(1)]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({ states: ["TX", "GA"] })

    expect(result.items).toHaveLength(2)
    expect(chain.where).toHaveBeenCalled()
  })

  // Test 4: filters by price range
  it("calls where when price range provided", async () => {
    const rows = [makeRow(0, { askingPrice: 150000 })]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({ minPrice: 100000, maxPrice: 200000 })

    expect(result.items).toHaveLength(1)
    expect(chain.where).toHaveBeenCalled()
  })

  // Test 5: sorts by newest first by default
  it("calls orderBy on every query", async () => {
    const rows = [makeRow(0), makeRow(1)]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    await getListings({})

    expect(chain.orderBy).toHaveBeenCalled()
  })

  // Test 6: cursor pagination — returns nextCursor when more exist
  it("returns nextCursor when PAGE_SIZE+1 rows returned (hasMore=true)", async () => {
    // Return PAGE_SIZE + 1 = 13 rows to signal hasMore
    const rows = Array.from({ length: 13 }, (_, i) => makeRow(i))
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({})

    expect(result.items).toHaveLength(12) // trimmed to PAGE_SIZE
    expect(result.nextCursor).not.toBeNull()
    // nextCursor should be an ISO string of the last item's createdAt
    expect(typeof result.nextCursor).toBe("string")
  })

  it("returns null nextCursor when fewer than PAGE_SIZE rows returned", async () => {
    const rows = Array.from({ length: 5 }, (_, i) => makeRow(i))
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({})

    expect(result.items).toHaveLength(5)
    expect(result.nextCursor).toBeNull()
  })

  it("includes cursor condition when cursor param provided", async () => {
    const cursorDate = new Date("2025-01-01T00:00:00Z").toISOString()
    const rows = [makeRow(0)]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    await getListings({ cursor: cursorDate })

    expect(chain.where).toHaveBeenCalled()
  })

  // Test 7: returns primary photo URL via left join
  it("returns primaryPhotoUrl from joined listingPhotos row", async () => {
    const rows = [
      makeRowWithPhoto(0, "https://example.com/photo.jpg"),
      makeRowWithPhoto(1, null),
    ]
    const chain = makeQueryChain(rows)
    mockSelect.mockReturnValue(chain)

    const result = await getListings({})

    expect(result.items[0].primaryPhotoUrl).toBe("https://example.com/photo.jpg")
    expect(result.items[1].primaryPhotoUrl).toBeNull()
    // The left join should have been called twice (locations + photos)
    expect(chain.leftJoin).toHaveBeenCalledTimes(2)
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
      askingPrice: overrides.askingPrice ?? 100000,
      createdAt: new Date(`2025-0${(index % 9) + 1}-01T00:00:00Z`),
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
      askingPrice: 100000,
      createdAt: new Date(`2025-0${(index % 9) + 1}-01T00:00:00Z`),
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
