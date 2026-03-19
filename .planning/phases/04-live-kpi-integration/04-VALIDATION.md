---
phase: 04
slug: live-kpi-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 |
| **Config file** | `vitest.config.ts` (exists from Phase 1) |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | LIST-17 | spike | Manual API call | N/A | ⬜ pending |
| 04-02-01 | 02 | 0 | LIST-17 | unit | `npm run test -- src/__tests__/kpi/fetch.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | LIST-17 | unit | `npm run test -- src/__tests__/kpi/schema.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 1 | LIST-17 | unit | `npm run test -- src/__tests__/kpi/fetch.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 1 | LIST-18 | unit | `npm run test -- src/__tests__/kpi/fetch.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 1 | LIST-19 | unit | `npm run test -- src/__tests__/kpi/aggregate.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/kpi/fetch.test.ts` — stubs for LIST-17 fetch layer
- [ ] `src/__tests__/kpi/schema.test.ts` — Zod validation tests
- [ ] `src/__tests__/kpi/aggregate.test.ts` — bundle aggregation tests for LIST-19
- [ ] Mock fixture for internal API response (development without live API)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| KPI card visual layout (4-column row) | LIST-17 | Visual rendering | Inspect listing detail page, verify 4 cards in horizontal row |
| Trend chart modal opens on card click | LIST-18 | User interaction | Click any KPI card, verify modal opens with line chart |
| Bundle overlay chart shows all locations | LIST-19 | Visual rendering | View bundle listing, click KPI card, verify multi-line chart |
| Freshness timestamp displays correctly | LIST-17 | Visual rendering | Check "Updated X hours ago" on each card |
| Section hidden when API unavailable | LIST-17 | Integration | Disconnect API mock, verify KPI section does not render |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
