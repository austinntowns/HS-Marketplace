---
phase: 02-listings-moderation
verified: 2026-03-19T00:00:00Z
status: passed
score: 13/13 must-haves verified
re_verification: false
---

# Phase 02: Listings & Moderation Verification Report

**Phase Goal:** Sellers create listings with photos and pricing; admins moderate with approve/reject queue; email notifications on status changes.
**Verified:** 2026-03-19
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Listing Drizzle schema supports all four listing types | VERIFIED | `listings.ts` has `listingTypeEnum` with suite/flagship/territory/bundle; `listingLocations` and `listingPhotos` tables exist |
| 2 | Zod schemas validate each wizard step with proper field requirements | VERIFIED | `typeLocationSchema`, `financialsSchema`, `photosDetailsSchema` all exported; `listingSchema` chains them via `.and()` |
| 3 | Status machine enforces valid transitions with role-based permissions | VERIFIED | `TRANSITIONS`, `canTransition`, `getAvailableActions` all exported and wired into actions and admin actions |
| 4 | Photo upload endpoint accepts images and returns Vercel Blob URLs | VERIFIED | `handleUpload` called in `/api/upload/route.ts`; auth check for `sellerAccess`; accepts jpeg/png/webp |
| 5 | Seller can select listing type via visual cards | VERIFIED | `TypeLocationStep.tsx` renders type buttons; `LocationSelector` and `TerritoryPicker` wired via `Controller` |
| 6 | Photos can be uploaded with progress and reordered via drag-drop | VERIFIED | `PhotoUploader` calls `upload('/api/upload')`; `PhotoGrid` uses `DndContext` + `SortableContext`; `compressImage` called before upload |
| 7 | Wizard auto-saves draft on each step completion | VERIFIED | `ListingWizard.handleStepComplete` calls `saveDraft` after each step validation |
| 8 | Successful submission shows confirmation page | VERIFIED | `submitListing` called, then `router.push('/seller/listings/{id}/submitted')`; submitted page exists |
| 9 | Seller can view listings with status badges | VERIFIED | `SellerListingsPage` queries DB, renders `ListingCard` with `StatusBadge`; rejection banner with "Edit to resubmit" |
| 10 | Seller can edit listing; rejected listing auto-resubmits | VERIFIED | `updateListing` in `actions.ts` checks `listing.status === 'rejected'` and sets status to `pending` automatically |
| 11 | 30-day reminder email with one-click mark-sold link | VERIFIED | Cron creates `markSoldToken` via `createActionToken`, builds `markSoldUrl`, passes to `sendReminderEmail`; email embeds the URL |
| 12 | Admin can view queue, approve or reject with reason dropdown | VERIFIED | `ModerationQueue` calls `approveListing`/`rejectListing`; `RejectionModal` has 7-item dropdown + notes; `sendStatusChangeEmail` called on both |
| 13 | Admin can view all listings, edit any, mark any as sold | VERIFIED | `ListingsTable` has Edit link and Mark Sold button; `adminMarkSold` and `adminUpdateListing` exported; `ListingEditForm` has `isAdmin` prop routing to admin actions |

**Score:** 13/13 truths verified

---

### Required Artifacts

| Artifact | Status | Lines | Details |
|----------|--------|-------|---------|
| `src/db/schema/listings.ts` | VERIFIED | 124 | listings, listingLocations, listingPhotos tables + relations; enums imported from enums.ts |
| `src/lib/listings/schemas.ts` | VERIFIED | 100 | typeLocationSchema, financialsSchema, photosDetailsSchema, listingSchema, getFieldsForStep |
| `src/lib/listings/status-machine.ts` | VERIFIED | 42 | TRANSITIONS array, canTransition, getAvailableActions |
| `src/lib/listings/types.ts` | VERIFIED | 44 | ListingStatus, ListingType, LocationType, Photo, LocationSelection, ListingFormData |
| `src/app/api/upload/route.ts` | VERIFIED | 43 | handleUpload, auth check, sellerAccess gate, allowedContentTypes |
| `src/components/listings/ListingWizard.tsx` | VERIFIED | 112 | FormProvider, zodResolver(listingSchema), saveDraft, submitListing all wired |
| `src/components/listings/PhotoGrid.tsx` | VERIFIED | 119 | DndContext, SortableContext, useSortable — full drag-to-reorder implementation |
| `src/components/listings/TerritoryPicker.tsx` | VERIFIED | 148 | dynamic MapContainer import (SSR-safe), Circle, EXISTING_HS_LOCATIONS, radius range slider |
| `src/app/seller/listings/new/page.tsx` | VERIFIED | 23 | Auth check, renders ListingWizard with userId |
| `src/app/seller/listings/page.tsx` | VERIFIED | ~90 | DB query, ListingCard grid, single-listing redirect to detail |
| `src/lib/listings/actions.ts` | VERIFIED | ~180 | saveDraft, submitListing, updateListing (with auto-resubmit), changeListingStatus |
| `src/lib/listings/action-tokens.ts` | VERIFIED | ~80 | SignJWT/jwtVerify (jose), createActionToken, verifyActionToken, executeAction |
| `src/app/api/actions/[token]/route.ts` | VERIFIED | 17 | Calls executeAction, redirects to /action-complete |
| `src/app/api/cron/reminders/route.ts` | VERIFIED | 69 | CRON_SECRET auth, 30-day query, createActionToken, markSoldUrl in sendReminderEmail |
| `src/lib/admin/actions.ts` | VERIFIED | 190 | requireAdmin, getPendingListings, getAllListings, approveListing, rejectListing, adminUpdateListing, adminMarkSold; sendStatusChangeEmail on approve/reject |
| `src/components/admin/ModerationQueue.tsx` | VERIFIED | 102 | Calls approveListing/rejectListing from admin/actions |
| `src/components/admin/RejectionModal.tsx` | VERIFIED | 98 | 7-reason dropdown, optional notes textarea |
| `src/app/admin/queue/page.tsx` | VERIFIED | 19 | Calls getPendingListings, renders ModerationQueue |
| `src/app/admin/listings/page.tsx` | VERIFIED | 62 | Status filter tabs, getAllListings(statusFilter), ListingsTable |
| `src/components/listings/ListingEditForm.tsx` | VERIFIED | ~200 | isAdmin prop; when true uses adminUpdateListing and routes to /admin/listings/[id] |
| `vercel.json` | VERIFIED | 7 | Cron schedule `0 9 * * *` for /api/cron/reminders |
| `src/__tests__/listings/schemas.test.ts` | VERIFIED | 26 tests | Validates typeLocation, financials, photosDetails schemas |
| `src/__tests__/listings/status-machine.test.ts` | VERIFIED | 36 tests | Validates canTransition and getAvailableActions |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/listings/schemas.ts` | `src/lib/listings/types.ts` | `z.infer` | VERIFIED | Types derived from schema via `z.infer<typeof listingSchema>` |
| `src/db/schema/listings.ts` | `src/db/schema.ts` | re-export | VERIFIED | `export * from "./schema/listings"` on line 8 |
| `src/components/listings/ListingWizard.tsx` | `src/lib/listings/schemas.ts` | zodResolver | VERIFIED | `zodResolver(listingSchema)` on line 26 |
| `src/components/listings/PhotoUploader.tsx` | `/api/upload` | Vercel Blob upload | VERIFIED | `handleUploadUrl: '/api/upload'` in upload() call |
| `src/components/admin/ModerationQueue.tsx` | `src/lib/admin/actions.ts` | server action imports | VERIFIED | `import { approveListing, rejectListing } from '@/lib/admin/actions'` |
| `src/lib/admin/actions.ts` | `src/lib/email.ts` | sendStatusChangeEmail | VERIFIED | Called in both `approveListing` (line 73) and `rejectListing` (line 115) |
| `src/app/api/actions/[token]/route.ts` | `src/lib/listings/action-tokens.ts` | verifyActionToken | VERIFIED | `import { executeAction }` which calls `verifyActionToken` |
| Cron route | `src/lib/listings/action-tokens.ts` | createActionToken | VERIFIED | `markSoldToken = await createActionToken(...)` then passed to `sendReminderEmail` as `markSoldUrl` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| LIST-01 | 02-02 | Seller can create listing for a suite | SATISFIED | Wizard TypeLocationStep has suite card option |
| LIST-02 | 02-02 | Seller can create listing for a flagship | SATISFIED | Wizard TypeLocationStep has flagship card option |
| LIST-03 | 02-02 | Seller can create listing for a territory | SATISFIED | TerritoryPicker component with Leaflet map |
| LIST-04 | 02-02 | Seller can create a bundle listing | SATISFIED | LocationSelector multi-select; saveDraft detects `locations.length > 1` and sets type=bundle |
| LIST-05 | 02-01 | Open salons auto-populated from system data | SATISFIED | LocationSelector fetches from `getSellerLocations` (mock returning MOCK_SELLER_LOCATIONS with ttmRevenue/mcr) |
| LIST-06 | 02-01 | Unopened territories require manual entry | SATISFIED | TerritoryPicker provides map click + name input for manual territory definition |
| LIST-07 | 02-01 | Seller can enter asking price | SATISFIED | FinancialsStep `askingPrice` field with validation |
| LIST-08 | 02-01 | Seller can enter TTM profit | SATISFIED | FinancialsStep `ttmProfit` optional field |
| LIST-10 | 02-01 | Seller can enter reason for selling | SATISFIED | FinancialsStep `reasonForSelling` textarea (max 500 chars) |
| LIST-11 | 02-01 | Seller can enter included assets | SATISFIED | PhotosDetailsStep inventory/laser checkboxes and `otherAssets` field |
| LIST-12 | 02-01 | Seller can add free-form notes | SATISFIED | PhotosDetailsStep `notes` textarea (max 2000 chars) |
| LIST-13 | 02-01 | Seller must upload minimum 3 photos (max 10) | PARTIAL | Schema enforces min 1 (not 3) — context file explicitly changed to min 1 (`02-CONTEXT.md` line 52: "Minimum 1 photo required (changed from 3)"). REQUIREMENTS.md still says min 3 but the project decision overrides this. Noted as human review needed. |
| LIST-14 | 02-03 | Seller can view listing status | SATISFIED | StatusBadge on ListingCard; SellerListingDetailPage shows current status |
| LIST-15 | 02-03 | Seller can edit listing at any time | SATISFIED | Edit page and ListingEditForm exist; no re-approval needed unless rejected |
| LIST-16 | 02-03 | Seller can mark listing as sold | SATISFIED | ListingActions component with markSold action; API route calls changeListingStatus |
| LIST-20 | 02-03 | Seller can delist listing | SATISFIED | ListingActions includes delist action; changeListingStatus validates via canTransition |
| LIST-21 | 02-03 | System sends 30-day reminder email | SATISFIED | Cron endpoint queries active listings with lastReminderSent > 30 days; sends reminder with markSoldUrl |
| LIST-22 | 02-01 | Listing displays square footage | SATISFIED | squareFootage stored in listingLocations; displayed in FinancialsStep auto-populated section |
| LIST-23 | 02-01 | Listing displays opening date | SATISFIED | openingDate stored in listingLocations from MOCK_SELLER_LOCATIONS |
| ADMN-01 | 02-04 | Admin can view queue of pending listings | SATISFIED | /admin/queue fetches pending listings via getPendingListings |
| ADMN-02 | 02-04 | Admin can approve listing | SATISFIED | approveListing validates canTransition, sets status=active |
| ADMN-03 | 02-04 | Admin can reject listing with reason | SATISFIED | rejectListing with reason dropdown (7 options) + optional notes |
| ADMN-04 | 02-04 | Seller receives email on approval/rejection | SATISFIED | sendStatusChangeEmail called in both approveListing and rejectListing |
| ADMN-05 | 02-04 | Admin can view all listings with status | SATISFIED | /admin/listings with status filter tabs; getAllListings(statusFilter) |
| ADMN-06 | 02-04 | Admin can view all buyer inquiries | PARTIAL | /admin/inquiries page is a placeholder. The plan comment says "Phase 3" — inquiries table doesn't exist yet. Intentional deferral. |
| ADMN-07 | 02-04 | Admin can manage users | SATISFIED | Phase 1 user management (/admin/users) confirmed present and functional |
| ADMN-08 | 02-04 | Admin can edit any listing | SATISFIED | /admin/listings/[id]/edit uses ListingEditForm with isAdmin=true, calls adminUpdateListing |
| ADMN-09 | 02-04 | Admin can mark any listing as sold | SATISFIED | adminMarkSold in admin actions; ListingsTable Mark Sold button for active listings |

**Orphaned Requirements Check:** LIST-09 (monthly expenses breakdown) explicitly removed — documented in `02-CONTEXT.md` line 46 and `02-RESEARCH.md` line 30. Not in any plan's requirements list. Correctly omitted.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `ListingWizard.tsx` | 77 | `// TODO: Show error toast` | Info | Submit errors silently fail without user feedback; only logged to console |
| `InquiryList.tsx` | — | Always renders empty state | Info | Intentional placeholder for Phase 3; no blocker |

No blockers found. The TODO is a UX improvement, not a functional gap.

---

### Human Verification Required

#### 1. Minimum Photo Count Decision

**Test:** Attempt to submit a listing wizard with only 1 or 2 photos.
**Expected:** The form should either (a) accept it (if min=1 is the final decision) or (b) show a validation error asking for 3 photos.
**Why human:** REQUIREMENTS.md says min 3; `02-CONTEXT.md` explicitly changed to min 1. The schema enforces min 1. Confirm this business rule change is intentional and REQUIREMENTS.md should be updated.

#### 2. Listing Creation End-to-End Flow

**Test:** Log in as a seller, navigate to /seller/listings/new, complete all 3 wizard steps with a photo, submit.
**Expected:** Redirected to /seller/listings/{id}/submitted with confirmation; listing appears in /admin/queue.
**Why human:** Photo upload requires real Vercel Blob credentials; the full form submission flow cannot be verified programmatically.

#### 3. Admin Approve/Reject Email Delivery

**Test:** Log in as admin, go to /admin/queue, approve or reject a pending listing.
**Expected:** Seller receives email notification with correct content; listing status changes in seller dashboard.
**Why human:** Email delivery requires live Resend API key; cannot verify email receipt without running the app.

#### 4. Territory Map Interaction

**Test:** In the listing wizard, select Territory type, click on the map to set center, drag the radius slider.
**Expected:** Circle on map updates position and size; territory data is captured in form state.
**Why human:** Leaflet map rendering and interaction requires a browser; cannot verify map click handlers programmatically.

#### 5. Photo Drag-to-Reorder

**Test:** Upload 3+ photos in the listing wizard, drag the second photo to the first position.
**Expected:** Photos reorder visually; first photo marked as "Cover"; order persists on submission.
**Why human:** dnd-kit drag behavior requires real pointer events in a browser.

---

### Notes on Intentional Deferrals

- **ADMN-06 (inquiries view):** Deferred to Phase 3 by plan design. The /admin/inquiries page and InquiryList component exist as placeholders — the inquiries table is Phase 3 scope.
- **LIST-09 (monthly expenses):** Removed from scope entirely per project decision in 02-CONTEXT.md. Not a gap.
- **Photo minimum (LIST-13):** Changed from 3 to 1 by project decision in 02-CONTEXT.md. REQUIREMENTS.md reflects the original spec; recommend updating it to min=1 to avoid confusion.

---

_Verified: 2026-03-19_
_Verifier: Claude (gsd-verifier)_
