# HS-Marketplace UX Improvement Plan

**Created:** 2026-03-20
**Team:** Senior UX Manager, UX QA Agent, Front End Designer, CRO Specialist
**Status:** Ready for implementation

---

## Executive Summary

Four-agent UX audit identified **38 total recommendations** across accessibility, conversion, visual design, and user flow. After deduplication and cross-team prioritization:

- **P0 (Critical):** 8 items — must fix before production
- **P1 (High Priority):** 12 items — launch quality improvements
- **P2 (Polish):** 10 items — post-launch enhancements

---

## P0 — Critical (Do First)

### Accessibility & Functionality

| # | Issue | Owner | Files | Effort |
|---|-------|-------|-------|--------|
| 1 | **Replace native multi-select in FilterBar** — unusable on desktop, inaccessible | UX QA | `FilterBar.tsx:174-190` | Medium |
| 2 | **Add focus traps to modals** — Tab escapes to background | UX QA | `RejectionModal.tsx`, `KpiTrendModal.tsx` | Medium |
| 3 | **Fix brand color inconsistency** — `pink-*` used instead of `hs-red-*` | Designer | `KpiCard.tsx`, `PhotoCollage.tsx`, `TypeLocationStep.tsx`, `FinancialsStep.tsx`, `PhotosDetailsStep.tsx`, `AlertForm.tsx` | Low |
| 4 | **Add confirmation dialogs for destructive admin actions** | UX Manager | `src/app/admin/users/` | Low |

### Navigation & Core UX

| # | Issue | Owner | Files | Effort |
|---|-------|-------|-------|--------|
| 5 | **Add "Back to results" on listing detail** — users lose context | UX Manager | `src/app/listings/[id]/page.tsx` | Low |
| 6 | **Surface contact form in sticky sidebar** — currently buried below fold | CRO | `src/app/listings/[id]/page.tsx` | Medium |
| 7 | **Add view/inquiry counts to listing detail (buyer-facing)** — no social proof | CRO | `src/app/listings/[id]/page.tsx`, schema | Medium |
| 8 | **Add "New" badge to listings < 7 days old** — no urgency signals | CRO | `ListingCard.tsx`, query logic | Low |

---

## P1 — High Priority (Launch Quality)

### Accessibility

| # | Issue | Owner | Effort |
|---|-------|-------|--------|
| 9 | Add `aria-pressed` to toggle buttons in FilterBar | UX QA | Low |
| 10 | Add `role="dialog"`, `aria-modal`, `aria-labelledby` to modals | UX QA | Low |
| 11 | Always show photo delete buttons (remove hover-only visibility) | UX QA | Low |
| 12 | Add `role="alert"` to ContactForm error messages | UX QA | Low |
| 13 | Add ARIA semantics to StepIndicator (`aria-current="step"`) | UX QA | Low |

### User Flow

| # | Issue | Owner | Effort |
|---|-------|-------|--------|
| 14 | Implement photo lightbox on listing detail (swipe on mobile) | UX Manager | Medium |
| 15 | Add breadcrumb navigation on deep pages | UX Manager | Low |
| 16 | Use compact step indicator on mobile wizard | UX Manager | Low |
| 17 | Add search to admin tables (listings, users) | UX Manager | Medium |

### Conversion

| # | Issue | Owner | Effort |
|---|-------|-------|--------|
| 18 | Improve CTA copy: "Send Message" → "Request Information" | CRO | Low |
| 19 | Add "Verified by Hello Sugar" badge post-approval | CRO | Low |
| 20 | Improve photo step with prominent "Save Draft" messaging | CRO | Low |

---

## P2 — Polish (Post-Launch)

### Visual & Interaction

| # | Issue | Owner | Effort |
|---|-------|-------|--------|
| 21 | Add micro-interactions to KPI cards (hover lift, click scale) | Designer | Low |
| 22 | Count-up animation for financial figures | Designer | Medium |
| 23 | Fix KpiCardRow responsive grid (`grid-cols-4` breaks on mobile) | Designer | Low |
| 24 | Consolidate duplicate ListingCard implementations | Designer | Medium |
| 25 | Add skeleton loading states for KPI data fetch | Designer | Medium |

### Features

| # | Issue | Owner | Effort |
|---|-------|-------|--------|
| 26 | Listing save/favorite functionality | UX Manager | High |
| 27 | Admin dashboard with analytics overview | UX Manager | High |
| 28 | Map mini-cards on mobile (peek sheet pattern) | UX Manager | High |
| 29 | Pre-filled message templates in contact form | CRO | Medium |
| 30 | Seller response time indicator | CRO | Medium |

---

## Implementation Order

### Sprint 1: Accessibility & Critical Fixes (Items 1-8)
- Focus trap implementation for modals
- FilterBar multi-select → accessible combobox pattern
- Brand color find-replace (`pink-*` → `hs-red-*`)
- Back navigation + sticky contact sidebar
- Social proof badges (view counts, "New" badge)

### Sprint 2: Launch Quality (Items 9-20)
- ARIA improvements across forms and toggles
- Photo lightbox integration
- Breadcrumbs and mobile step indicator
- CTA copy improvements

### Sprint 3: Polish (Items 21-30)
- Micro-interactions and animations
- Consolidation and cleanup
- New features (favorites, admin dashboard)

---

## Key Metrics to Track

| Metric | Current | Target | Owner |
|--------|---------|--------|-------|
| Contact form submission rate | Unknown | +20% | CRO |
| Listing detail bounce rate | Unknown | -15% | UX Manager |
| Accessibility score (Lighthouse) | Unknown | 95+ | UX QA |
| Wizard completion rate | Unknown | +15% | CRO |

---

## Architecture Decisions

1. **Modal focus trap**: Use `focus-trap-react` library or implement with `@headlessui/react` Dialog
2. **Accessible multi-select**: Use Headless UI Combobox or Radix Popover with checkboxes
3. **Photo lightbox**: Project already has `yet-another-react-lightbox` installed — use it
4. **View counts**: Add `viewCount`, `inquiryCount` fields to listing query response (already tracked in DB)
5. **Sticky sidebar**: CSS `position: sticky` with `top` offset; mobile falls back to floating CTA

---

## Files Affected (Reference)

### High-touch files (multiple changes)
- `src/app/listings/[id]/page.tsx` — sidebar, back nav, badges
- `src/components/browse/FilterBar.tsx` — multi-select, aria
- `src/components/listings/ListingWizard.tsx` — step indicator, ARIA
- `src/components/kpi/KpiCard.tsx` — colors, interactions

### Color standardization (find-replace `pink-` → `hs-red-`)
- `src/components/kpi/KpiCard.tsx`
- `src/components/listing-detail/PhotoCollage.tsx`
- `src/components/listings/steps/TypeLocationStep.tsx`
- `src/components/listings/steps/FinancialsStep.tsx`
- `src/components/listings/steps/PhotosDetailsStep.tsx`
- `src/components/alerts/AlertForm.tsx`
- `src/components/admin/RejectionModal.tsx`

---

*Plan generated from parallel UX team audit. See `research.md` for detailed findings from each specialist.*
