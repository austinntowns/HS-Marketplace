---
phase: 2
slug: listings-moderation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | vitest.config.ts (Wave 0 creates) |
| **Quick run command** | `npm run test -- --run --changed` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run --changed`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | LIST-01 | integration | `npm run test -- src/app/api/listings/__tests__/create.test.ts -t "suite"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | LIST-04 | unit | `npm run test -- src/lib/listings/__tests__/bundle.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | LIST-13 | unit | `npm run test -- src/lib/listings/__tests__/schemas.test.ts -t "photos"` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | LIST-14 | unit | `npm run test -- src/components/listings/__tests__/StatusBadge.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | LIST-16 | integration | `npm run test -- src/app/api/actions/__tests__/mark-sold.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 1 | ADMN-02 | integration | `npm run test -- src/app/api/listings/__tests__/status.test.ts -t "approve"` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 1 | ADMN-03 | integration | `npm run test -- src/app/api/listings/__tests__/status.test.ts -t "reject"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Test framework configuration
- [ ] `src/lib/listings/__tests__/schemas.test.ts` — Zod schema validation tests
- [ ] `src/lib/listings/__tests__/status-machine.test.ts` — Status transition tests
- [ ] `src/app/api/listings/__tests__/create.test.ts` — Listing creation API tests
- [ ] `src/app/api/listings/__tests__/status.test.ts` — Status change API tests
- [ ] `src/app/api/actions/__tests__/mark-sold.test.ts` — One-click action tests
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/user-event jsdom`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Photo drag-to-reorder | LIST-13 | Touch interaction | 1. Upload 3 photos. 2. Drag second to first position. 3. Verify cover badge moves. |
| Territory map radius drag | LIST-03 | Map interaction | 1. Create territory listing. 2. Drag circle edge to resize. 3. Verify radius value updates. |
| Email delivery | ADMN-04 | External service | 1. Approve listing. 2. Check Resend dashboard for delivery. 3. Verify seller received email. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
