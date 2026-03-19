---
phase: 03
slug: discovery-and-contact
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` (project root) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | DISC-01 | unit | `npm test -- listings-query` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | DISC-03,04,05,06 | unit | `npm test -- listings-query` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 2 | DISC-02 | manual | — | N/A | ⬜ pending |
| 03-02-01 | 02 | 1 | DISC-07 | manual | — | N/A | ⬜ pending |
| 03-03-01 | 03 | 1 | DISC-08 | unit | `npm test -- contact-actions` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 1 | DISC-11 | unit | `npm test -- contact-actions` | ✅ partial | ⬜ pending |
| 03-04-01 | 04 | 1 | DISC-12 | unit | `npm test -- alert-actions` | ❌ W0 | ⬜ pending |
| 03-04-02 | 04 | 1 | DISC-13 | unit | `npm test -- alert-actions` | ❌ W0 | ⬜ pending |
| 03-04-03 | 04 | 1 | DISC-15,16 | unit | `npm test -- alert-actions` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/listings-query.test.ts` — stubs for DISC-01, DISC-03, DISC-04, DISC-05, DISC-06 (mock Drizzle db)
- [ ] `src/__tests__/contact-actions.test.ts` — stubs for DISC-08, DISC-11 (mock db + email)
- [ ] `src/__tests__/alert-actions.test.ts` — stubs for DISC-12, DISC-13, DISC-15, DISC-16

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Map renders with markers | DISC-02 | MapTiler requires browser/WebGL | Load /browse, verify map shows, pins appear for listings |
| Location autocomplete works | DISC-14 | Requires MapTiler API | Type city name, verify suggestions appear |
| Detail page displays all fields | DISC-07 | Visual verification | Navigate to listing detail, verify all seller fields present |
| Split screen layout works | DISC-01,02 | Visual verification | Resize browser, verify responsive behavior |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
