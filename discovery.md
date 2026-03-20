# HS-Marketplace Discovery Log

## 2026-03-20

### Q: What UX improvements are needed before launch?
**A:** 38 recommendations identified across 4 domains:
- Accessibility: Focus traps, ARIA attributes, keyboard navigation
- Conversion: Contact form placement, social proof, urgency signals
- Visual: Brand color consistency, micro-interactions
- Navigation: Back button, breadcrumbs, mobile step indicator

See `research.md` for detailed findings, `plan.md` for prioritized action items.

### Q: What is the brand color system?
**A:**
- Primary brand color: `hs-red-*` (custom Tailwind color, base #dc2626)
- Several components incorrectly use `pink-*` instead
- Files affected: KpiCard, PhotoCollage, wizard steps, AlertForm, RejectionModal

### Q: Is the app accessible (WCAG 2.1 AA)?
**A:** Partially. Good foundations (focus-visible, semantic HTML, touch targets) but gaps:
- Modals lack focus traps
- Toggle buttons missing `aria-pressed`
- Error messages need `role="alert"`
- Photo delete buttons hover-only (keyboard inaccessible)
- Multi-select in FilterBar is unusable

### Q: What libraries are already installed for common patterns?
**A:**
- Lightbox: `yet-another-react-lightbox` (installed, use for photo gallery)
- Forms: `react-hook-form` + `zod`
- Drag/drop: `@dnd-kit/core` + `@dnd-kit/sortable`
- Charts: `recharts`
- Maps: `@maptiler/sdk`, `react-leaflet`

### Q: How are view/inquiry counts tracked?
**A:** Already tracked in database (sellers see them), but not exposed to buyers. Easy lift to add to listing detail query.

### Q: Why does photo upload hang forever in local dev?
**A:** `@vercel/blob/client` uploads require `vercel dev`, not `next dev`. The client-side upload flow talks to Vercel's infrastructure for token generation. Use `npm run dev:blob` or `vercel dev` directly.
