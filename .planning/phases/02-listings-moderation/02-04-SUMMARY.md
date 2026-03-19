---
phase: 02-listings-moderation
plan: 04
subsystem: admin-moderation
tags: [admin, moderation, queue, listings, email]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [admin-moderation-ui, admin-listing-management]
  affects: [seller-listings, email-notifications]
tech_stack:
  added: []
  patterns:
    - requireAdmin() guard on all admin server actions
    - Next.js 16 async params/searchParams pattern in dynamic routes
    - Client component moderation queue with optimistic state
key_files:
  created:
    - src/app/admin/layout.tsx
    - src/app/admin/page.tsx
    - src/app/admin/queue/page.tsx
    - src/app/admin/listings/page.tsx
    - src/app/admin/listings/[id]/page.tsx
    - src/app/admin/listings/[id]/edit/page.tsx
    - src/app/admin/inquiries/page.tsx
    - src/lib/admin/actions.ts
    - src/components/admin/ModerationQueue.tsx
    - src/components/admin/AdminListingCard.tsx
    - src/components/admin/RejectionModal.tsx
    - src/components/admin/ListingsTable.tsx
    - src/components/admin/InquiryList.tsx
  modified:
    - src/components/listings/ListingEditForm.tsx
decisions:
  - "ListingEditForm extended with isAdmin prop - uses adminUpdateListing and routes to /admin/listings/[id] when true"
  - "ModerationQueue Listing.status typed as ListingStatus (full union) not 'pending' literal - DB query return type requires this"
  - "All dynamic route pages use Promise<{ id }> params pattern per Next.js 16"
  - "Admin listings page uses Promise<searchParams> per Next.js 16"
metrics:
  duration: 5 min
  completed_date: "2026-03-19"
  tasks_completed: 4
  files_created: 13
  files_modified: 1
---

# Phase 02 Plan 04: Admin Moderation Interface Summary

Admin moderation dashboard with approval queue, approve/reject with email notifications, all listings view with status filters, admin listing edit, and inquiry list placeholder.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Admin layout and server actions | 23d7c52 |
| 2 | Moderation queue page and components | fbb4221 |
| 3 | All listings admin view with filters | 5426976 |
| 4 | Admin edit page and inquiry list placeholder | 770707d |

## What Was Built

**Admin Layout (`src/app/admin/layout.tsx`):** Wraps all admin routes with a role check (`session.user.role !== 'admin'`) and a top nav with links to Queue, All Listings, and Users.

**Admin Server Actions (`src/lib/admin/actions.ts`):** `requireAdmin()` guard on every function. Exports `getPendingListings`, `getAllListings` (with optional status filter), `approveListing` (sends approval email via `sendStatusChangeEmail`), `rejectListing` (sends rejection email with reason), `adminUpdateListing`, and `adminMarkSold`. All use `canTransition` from the status machine.

**Moderation Queue (`/admin/queue`):** Server page fetches pending listings; `ModerationQueue` client component renders `AdminListingCard` items with Approve/Reject buttons. Approve calls `approveListing` directly; Reject opens `RejectionModal` with a 7-option dropdown and optional notes textarea before calling `rejectListing`.

**All Listings View (`/admin/listings`):** Status filter tabs (All, Draft, Pending, Active, Rejected, Sold, Delisted) as Link components. `ListingsTable` renders all listings with Edit links and a Mark Sold button for active listings.

**Admin Listing Detail (`/admin/listings/[id]`):** Shows photos, locations, price, analytics (views/inquiries), and rejection reason (if any).

**Admin Listing Edit (`/admin/listings/[id]/edit`):** Uses `ListingEditForm` with `isAdmin={true}`. When `isAdmin`, the form calls `adminUpdateListing` and routes to `/admin/listings/[id]`.

**InquiryList (`src/components/admin/InquiryList.tsx`):** Placeholder component for Phase 3. Handles empty state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Missing Dependency] Next.js 16 requires async params/searchParams**
- **Found during:** Task 3 (admin listings page) and Task 4 (admin edit page)
- **Issue:** The plan provided synchronous `params: { id: string }` and `searchParams: { status?: string }`, but Next.js 16 requires both to be typed as Promises and awaited
- **Fix:** All dynamic route pages type params as `Promise<{ id: string }>` and use `const { id } = await params`. Admin listings page types searchParams as `Promise<{ status?: string }>` and awaits before use
- **Files modified:** `src/app/admin/listings/page.tsx`, `src/app/admin/listings/[id]/page.tsx`, `src/app/admin/listings/[id]/edit/page.tsx`
- **Commit:** 5426976, 770707d

**2. [Rule 1 - Bug] ModerationQueue Listing.status type mismatch**
- **Found during:** TypeScript check after Task 4
- **Issue:** `ModerationQueue` interface typed `status: 'pending'` as a literal, but `getPendingListings()` returns `status: ListingStatus` (full union type) — TypeScript error on assignment
- **Fix:** Changed the interface `status` field from `'pending'` literal to `ListingStatus` union type; imported `ListingStatus` and `ListingType` from types module
- **Files modified:** `src/components/admin/ModerationQueue.tsx`
- **Commit:** 770707d

**3. [Rule 3 - Missing Dependency] ListingEditForm.tsx existed but lacked isAdmin prop**
- **Found during:** Task 4
- **Issue:** The plan's Task 4 action instructed creating `ListingEditForm` from scratch; the file already existed with `updateListing` wired up but no `isAdmin` prop
- **Fix:** Added `isAdmin?: boolean` prop; when true, calls `adminUpdateListing` (imported from admin/actions) and routes to admin listing detail page
- **Files modified:** `src/components/listings/ListingEditForm.tsx`
- **Commit:** 770707d

## Self-Check: PASSED

All 13 created files confirmed to exist on disk. All 4 task commits confirmed in git history (23d7c52, fbb4221, 5426976, 770707d).
