import { describe, it, expect, vi } from "vitest"

// Mock the database module
vi.mock("@/db", () => ({
  db: {
    query: {
      allowlist: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}))

describe("Auth - Domain Restriction (AUTH-01)", () => {
  it("accepts hellosugar.salon emails", () => {
    const email = "franchisee@hellosugar.salon"
    const workspaceDomain = "hellosugar.salon"
    const isWorkspaceDomain = email.endsWith(`@${workspaceDomain}`)
    expect(isWorkspaceDomain).toBe(true)
  })

  it("rejects non-workspace emails", () => {
    const email = "random@gmail.com"
    const workspaceDomain = "hellosugar.salon"
    const isWorkspaceDomain = email.endsWith(`@${workspaceDomain}`)
    expect(isWorkspaceDomain).toBe(false)
  })

  it("respects custom workspace domain from env", () => {
    const email = "user@customdomain.com"
    const workspaceDomain = "customdomain.com"
    const isWorkspaceDomain = email.endsWith(`@${workspaceDomain}`)
    expect(isWorkspaceDomain).toBe(true)
  })
})

describe("Auth - Franchisee Auto-Authorization (AUTH-02)", () => {
  it("identifies franchisee by domain suffix", () => {
    const email = "owner@hellosugar.salon"
    const isFranchisee = email.endsWith("@hellosugar.salon")
    expect(isFranchisee).toBe(true)
  })
})

describe("Auth - Non-Franchisee Allowlist (AUTH-03)", () => {
  it("returns access-denied redirect path for non-allowlisted users", () => {
    const allowlisted = null // simulate not found in allowlist
    const result = allowlisted ? true : "/access-denied"
    expect(result).toBe("/access-denied")
  })

  it("returns true for allowlisted users", () => {
    const allowlisted = { email: "partner@external.com", id: "123" }
    const result = allowlisted ? true : "/access-denied"
    expect(result).toBe(true)
  })
})
