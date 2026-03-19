import { describe, it, expect, vi } from "vitest"

// Mock server-only to be a no-op in tests
vi.mock("server-only", () => ({}))

import { aggregateBundleKpi } from "@/lib/kpi/aggregate"
import type { KpiData } from "@/lib/kpi/schema"

describe("aggregateBundleKpi", () => {
  it("sums revenue.lastMonth across all locations", () => {
    const locationKpis: Record<string, KpiData> = {
      "loc-1": {
        revenue: {
          lastMonth: 10000,
          momChange: 0.1,
          trend: [],
          updatedAt: "2026-03-19T00:00:00Z",
        },
      },
      "loc-2": {
        revenue: {
          lastMonth: 15000,
          momChange: 0.2,
          trend: [],
          updatedAt: "2026-03-19T00:00:00Z",
        },
      },
    }

    const result = aggregateBundleKpi(locationKpis)

    expect(result.revenue?.lastMonth).toBe(25000)
  })

  it("averages membershipConversion.lastMonth (not sums)", () => {
    const locationKpis: Record<string, KpiData> = {
      "loc-1": {
        membershipConversion: {
          lastMonth: 0.4,
          momChange: 0,
          trend: [],
          updatedAt: "2026-03-19T00:00:00Z",
        },
      },
      "loc-2": {
        membershipConversion: {
          lastMonth: 0.6,
          momChange: 0,
          trend: [],
          updatedAt: "2026-03-19T00:00:00Z",
        },
      },
    }

    const result = aggregateBundleKpi(locationKpis)

    expect(result.membershipConversion?.lastMonth).toBe(0.5)
  })

  it("calculates weighted average for momChange", () => {
    const locationKpis: Record<string, KpiData> = {
      "loc-1": {
        revenue: {
          lastMonth: 10000,
          momChange: 0.1, // +10%
          trend: [],
          updatedAt: "2026-03-19T00:00:00Z",
        },
      },
      "loc-2": {
        revenue: {
          lastMonth: 30000,
          momChange: 0.2, // +20%
          trend: [],
          updatedAt: "2026-03-19T00:00:00Z",
        },
      },
    }

    const result = aggregateBundleKpi(locationKpis)

    // Weighted avg: (0.1 * 10000 + 0.2 * 30000) / 40000 = (1000 + 6000) / 40000 = 0.175
    expect(result.revenue?.momChange).toBeCloseTo(0.175)
  })

  it("returns undefined for a metric if all locations are missing that metric", () => {
    const locationKpis: Record<string, KpiData> = {
      "loc-1": {
        revenue: {
          lastMonth: 10000,
          momChange: 0.1,
          trend: [],
          updatedAt: "2026-03-19T00:00:00Z",
        },
        // no bookings
      },
      "loc-2": {
        revenue: {
          lastMonth: 15000,
          momChange: 0.2,
          trend: [],
          updatedAt: "2026-03-19T00:00:00Z",
        },
        // no bookings
      },
    }

    const result = aggregateBundleKpi(locationKpis)

    expect(result.bookings).toBeUndefined()
  })

  it("handles empty input gracefully", () => {
    const result = aggregateBundleKpi({})

    expect(result).toEqual({})
  })

  it("aggregates trend data by summing values per month", () => {
    const locationKpis: Record<string, KpiData> = {
      "loc-1": {
        revenue: {
          lastMonth: 10000,
          momChange: 0.1,
          trend: [
            { month: "2026-01", value: 8000 },
            { month: "2026-02", value: 9000 },
          ],
          updatedAt: "2026-03-19T00:00:00Z",
        },
      },
      "loc-2": {
        revenue: {
          lastMonth: 15000,
          momChange: 0.2,
          trend: [
            { month: "2026-01", value: 12000 },
            { month: "2026-02", value: 13000 },
          ],
          updatedAt: "2026-03-19T00:00:00Z",
        },
      },
    }

    const result = aggregateBundleKpi(locationKpis)

    expect(result.revenue?.trend).toHaveLength(2)
    expect(result.revenue?.trend[0]).toEqual({ month: "2026-01", value: 20000 })
    expect(result.revenue?.trend[1]).toEqual({ month: "2026-02", value: 22000 })
  })
})
