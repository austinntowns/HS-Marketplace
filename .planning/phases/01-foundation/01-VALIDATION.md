---
phase: 01
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` (Wave 0 installs) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/__tests__/auth.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | — | smoke | `curl localhost:3000` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | AUTH-01 | unit | `vitest run src/__tests__/auth.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | AUTH-02 | integration | `vitest run src/__tests__/auth.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | AUTH-03 | unit | `vitest run src/__tests__/auth.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-04 | 02 | 1 | AUTH-04 | unit | `vitest run src/__tests__/session.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-05 | 02 | 1 | AUTH-05 | integration | `vitest run src/__tests__/admin.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | — | migration | `npm run db:migrate` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 2 | — | smoke | Resend API test send | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/auth.test.ts` — signIn callback logic, domain check, allowlist check (AUTH-01, AUTH-02, AUTH-03)
- [ ] `src/__tests__/session.test.ts` — session callback role exposure (AUTH-04)
- [ ] `src/__tests__/admin.test.ts` — role assignment, last-admin guard (AUTH-05)
- [ ] `vitest.config.ts` — base configuration with path aliases
- [ ] `npm install -D vitest @vitejs/plugin-react` — framework install

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google OAuth consent screen shows correct branding | AUTH-01 | Google OAuth UI not automatable | Sign in, verify screen shows "Hello Sugar Marketplace" |
| Access denied page links to franchise site | AUTH-03 | Visual verification | Click franchise link, verify redirect |
| Resend DNS verification | — | External system | Check Resend dashboard for verified domain |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
