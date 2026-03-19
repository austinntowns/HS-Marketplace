import { describe, it, expect } from "vitest"

describe("Smoke test", () => {
  it("runs without error", () => {
    expect(true).toBe(true)
  })

  it("can import from @/ alias", async () => {
    // This validates the path alias is working
    const envModule = await import("@/lib/env")
    expect(envModule).toBeDefined()
  })
})
