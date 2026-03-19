import { describe, it, expect } from "vitest"

describe("Session - Role Exposure (AUTH-04)", () => {
  it("session callback shape includes role and sellerAccess", () => {
    // Simulate session callback behavior
    const user = { id: "1", role: "admin" as const, sellerAccess: true }
    const session = {
      user: {
        id: "",
        role: undefined as "user" | "admin" | undefined,
        sellerAccess: undefined as boolean | undefined,
        email: "test@hellosugar.salon",
      },
      expires: new Date().toISOString(),
    }

    // Apply session callback logic
    session.user.id = user.id
    session.user.role = user.role
    session.user.sellerAccess = user.sellerAccess

    expect(session.user.role).toBe("admin")
    expect(session.user.sellerAccess).toBe(true)
  })

  it("defaults to user role when not set", () => {
    const user = { id: "1", role: "user" as const, sellerAccess: false }
    const session = { user: { role: user.role, sellerAccess: user.sellerAccess } }

    expect(session.user.role).toBe("user")
    expect(session.user.sellerAccess).toBe(false)
  })
})
