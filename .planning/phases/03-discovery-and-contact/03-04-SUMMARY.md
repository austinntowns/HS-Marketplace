---
phase: 03-discovery-and-contact
plan: "04"
subsystem: contact-form
tags: [next.js, server-actions, tdd, buyer-contact, admin, email]
dependency_graph:
  requires:
    - 03-03 (listing detail page with #contact anchor)
    - src/lib/email.ts (sendContactNotification already implemented)
    - src/db/schema/contacts.ts (contacts table)
  provides:
    - submitContactForm Server Action
    - hasContactedListing helper
    - ContactForm component (useActionState, auto-fill, duplicate state)
    - /admin/inquiries page (full inquiry log)
    - getInquiries Server Action
  affects:
    - /listings/[id] page (contact section now functional)
    - /admin/inquiries (Inquiries nav link added for admins)
tech_stack:
  added: []
  patterns:
    - "TDD with vi.hoisted() for mocking auth, db, email in vitest"
    - "'use client' ContactForm with useActionState for pending/error/success states"
    - "Server-side duplicate check before render via hasContactedListing"
    - "leftJoin listingLocations in admin query to get city/state for display"
key_files:
  created:
    - src/lib/contact-actions.ts
    - src/__tests__/contact-actions.test.ts
    - src/app/listings/[id]/ContactForm.tsx
    - src/app/admin/inquiries/actions.ts
  modified:
    - src/app/listings/[id]/page.tsx (replaced placeholder contact section)
    - src/app/(dashboard)/layout.tsx (added Inquiries nav link for admins)
    - src/app/admin/inquiries/page.tsx (replaced placeholder with real data table)
decisions:
  - "listingTitle fallback chain: listings.title → listingLocations.name → city/state → short ID — listings table has no city/state directly"
  - "leftJoin listingLocations in getInquiries rather than subquery — simpler, acceptable for admin page with LIMIT 100"
  - "hasContactedListing called in Server Component and passed as prop — avoids client-side data fetching for duplicate state"
  - "contactFormSchema uses z.string().uuid() for listingId — validates UUID format server-side"
metrics:
  duration: "3 min"
  completed_date: "2026-03-19"
  tasks_completed: 3
  files_changed: 7
---

# Phase 03 Plan 04: Contact Form Summary

**One-liner:** Buyer contact form on listing detail with auto-fill, duplicate prevention, seller email notification, and admin inquiry log — all 9 tests passing.

## What Was Built

The buyer contact flow from listing detail to seller notification. Buyers can now express interest in a listing through a form pre-populated with their profile data. Sellers receive an immediate email. Admins can view all inquiries in a dedicated log page.

### Key Components

- **`submitContactForm`** — Server Action (`'use server'`) that: validates listingId (UUID), checks auth, verifies listing is active, prevents duplicate contacts, inserts into contacts table, and calls `sendContactNotification`. Returns typed `{ error }` or `{ success: true }`.
- **`hasContactedListing`** — Server helper called in the listing detail page to pre-populate duplicate state before render.
- **`ContactForm`** — `'use client'` component using `useActionState`. Shows three states: (1) already-contacted banner (from `hasContacted` prop), (2) success banner after submission, (3) the form itself with read-only name/email auto-filled from session, optional phone and message fields.
- **`getInquiries`** — Admin-only Server Action that joins contacts + listings + listingLocations + users to build the full inquiry log. Returns the most recent 100 inquiries ordered by newest first.
- **`/admin/inquiries`** — Auth-gated admin page showing all inquiries in a table with date, listing link, buyer (name/email/phone), seller, and truncated message. Empty state handled gracefully.

### Test Coverage

9 tests in `src/__tests__/contact-actions.test.ts` covering:
1. Not authenticated → `{ error: 'Not authenticated' }`
2. Listing not found → `{ error: 'Listing not found' }`
3. Duplicate contact → `{ error: 'Already contacted' }`
4. Success: db.insert called with correct values
5. Success: sendContactNotification called with correct seller/buyer data
6. Success: returns `{ success: true }`
7. hasContactedListing: returns false when not authenticated
8. hasContactedListing: returns false when no contact found
9. hasContactedListing: returns true when contact found

All 88 tests pass (10 test files). Build compiles cleanly.

## Deviations from Plan

### Schema Adaptation (Expected)

The plan specified `listingName: listings.locationName, listingCity: listings.city, listingState: listings.state` in `getInquiries` — these columns don't exist on the `listings` table (location data lives in `listingLocations`). Adapted by adding a `leftJoin` on `listingLocations` to get `name`, `city`, `state` from the primary location. Display logic uses a fallback chain: `listingTitle → listingLocationName → city/state → short ID`.

### Existing Placeholder Page (Pre-existing)

`src/app/admin/inquiries/page.tsx` existed as a placeholder referencing `@/components/admin/InquiryList` (a placeholder component). Rather than using the placeholder component, rewrote the page with a full data table inline (more columns: date, listing link, buyer with phone, seller, message). The existing `InquiryList.tsx` component remains available but isn't used by this page.

## Self-Check

```
[ -f src/lib/contact-actions.ts ] → FOUND
[ -f src/__tests__/contact-actions.test.ts ] → FOUND
[ -f src/app/listings/[id]/ContactForm.tsx ] → FOUND
[ -f src/app/admin/inquiries/actions.ts ] → FOUND
[ -f src/app/admin/inquiries/page.tsx ] → FOUND
npm test → 88 passed (10 test files)
npm run build → compiled successfully, /admin/inquiries route present
```

## Self-Check: PASSED
