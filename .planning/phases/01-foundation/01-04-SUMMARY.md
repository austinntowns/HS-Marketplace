---
phase: 01-foundation
plan: "04"
subsystem: email
tags: [resend, email, transactional, notifications]
dependency_graph:
  requires: ["01-01"]
  provides: ["sendEmail", "sendStatusChangeEmail", "sendContactNotification", "sendAlertMatchEmail", "sendReminderEmail"]
  affects: ["02-listings (status change emails)", "03-discovery (contact and alert emails)"]
tech_stack:
  added: ["resend@6.9.4 (already installed)"]
  patterns: ["Resend client singleton", "typed email data interfaces", "inline HTML email templates"]
key_files:
  created:
    - src/lib/email.ts
    - src/lib/email-templates.tsx
    - src/__tests__/email.test.ts
  modified: []
decisions:
  - "Inline HTML templates chosen over React Email for v1 — simpler setup, sufficient for current needs; email-templates.tsx documents migration path"
  - "All email functions return { success: boolean, data/error } — consistent error handling without throwing"
  - "askingPrice stored and passed in cents — formatted to display currency in sendAlertMatchEmail"
metrics:
  duration: "3 min"
  completed_date: "2026-03-19"
  tasks_completed: 3
  files_created: 3
  files_modified: 0
---

# Phase 01 Plan 04: Email Infrastructure Summary

**One-liner:** Resend transactional email client with five typed notification functions (status change, contact, alert match, reminder) and inline HTML templates using Hello Sugar pink branding.

## What Was Built

Configured the Resend email client and created all notification functions Phase 2 and Phase 3 will need for listing status changes, buyer interest notifications, alert matching, and 30-day reminders.

### Files Created

**`src/lib/email.ts`**
- `Resend` client initialized with `RESEND_API_KEY`
- `FROM_ADDRESS`: `Hello Sugar Marketplace <noreply@hellosugar.salon>`
- `sendEmail` — base low-level send function with error wrapping
- `sendStatusChangeEmail` — handles pending/active/rejected with appropriate subject and body per status; includes `rejectionReason` in rejected template
- `sendContactNotification` — alerts seller when buyer expresses interest; optional buyer message block
- `sendAlertMatchEmail` — notifies buyer of new listing match; formats `askingPrice` (cents) to USD currency string
- `sendReminderEmail` — 30-day listing update reminder to seller with edit link

**`src/lib/email-templates.tsx`**
- Placeholder file documenting React Email migration path
- Exports `TEMPLATES_VERSION = "1.0.0"`
- Commented example showing how to use `@react-email/components` if/when upgrade is needed

**`src/__tests__/email.test.ts`**
- 12 tests covering all five exported functions
- Mocks `resend` module using a self-contained class inside `vi.mock` factory (avoids hoisting issue with `vi.fn()` declared outside)
- Tests: export existence, all three status variants, contact with/without message, price-formatted alert, days-since-update reminder

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed vi.mock hoisting issue in test**
- **Found during:** Task 3
- **Issue:** Initial mock used `vi.fn()` declared as a `const` above the `vi.mock` call. Vitest hoists `vi.mock` to the top of the file, causing a `ReferenceError: Cannot access before initialization` at runtime.
- **Fix:** Moved `sendFn` declaration inside the `vi.mock` factory closure so it's self-contained and not subject to hoisting order.
- **Files modified:** `src/__tests__/email.test.ts`
- **Commit:** f9291aa

**2. [Rule 1 - Bug] Fixed Resend mock constructor error**
- **Found during:** Task 3 (first test run)
- **Issue:** `vi.fn().mockImplementation(() => ({...}))` does not satisfy `new Resend()` — Vitest warned "mock did not use function or class" and threw "is not a constructor".
- **Fix:** Replaced with `class MockResend` inside the factory, which satisfies `new` instantiation.
- **Files modified:** `src/__tests__/email.test.ts`
- **Commit:** f9291aa

**3. [Rule 3 - Blocking] Node version mismatch discovered**
- **Found during:** Task 3 initial test run
- **Issue:** System `node` at `/usr/local/bin/node` is v18.14.0, which lacks `node:util#styleText` required by rolldown (vitest's bundler). Tests crashed before running.
- **Fix:** Used `nvm use 22` to activate Node v22.22.0 for test execution. This is a pre-existing environment issue — not caused by this plan's changes.
- **Note:** Added to deferred items — project should add `.nvmrc` or update shell PATH to point to nvm Node 22 by default.

## Commits

| Hash | Message |
|------|---------|
| 0eeb6a0 | feat(01-04): create Resend email client with typed notification functions |
| ba31f38 | feat(01-04): add email templates placeholder with React Email migration path |
| f9291aa | test(01-04): add email notification function tests with mocked Resend |

## Verification Results

1. Email module exists: PASS
2. At least 5 exported async functions: PASS (5 found)
3. All 12 tests pass (Node 22): PASS
4. Templates placeholder exists: PASS

## Self-Check: PASSED

- `src/lib/email.ts` — FOUND
- `src/lib/email-templates.tsx` — FOUND
- `src/__tests__/email.test.ts` — FOUND
- Commits 0eeb6a0, ba31f38, f9291aa — FOUND

## User Setup Required

Before email delivery works in production, the user must:

1. **Create Resend API key:** Resend Dashboard → API Keys → Create API Key → set as `RESEND_API_KEY`
2. **Verify sending domain:** Resend Dashboard → Domains → Add Domain → add `hellosugar.salon`
3. **Add DNS records:** SPF TXT record and DKIM CNAME record at DNS provider for `hellosugar.salon`
