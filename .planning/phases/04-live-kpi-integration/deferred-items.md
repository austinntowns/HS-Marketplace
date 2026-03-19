# Deferred Items

## Pre-existing Build Failures (out of scope for 04-05)

### /account/alerts prerender error
- **Discovered during:** 04-05 plan execution (npm run build verification)
- **Error:** Route "/account/alerts": Uncached data was accessed outside of <Suspense>
- **Message:** Next.js 16 blocking-route prerender error
- **Status:** Pre-existing, not caused by 04-05 changes (schema.ts/mock-data.ts/docs only)
- **Fix:** Wrap data fetching in /account/alerts with Suspense or add 'use cache' to the data call
- **Reference:** https://nextjs.org/docs/messages/blocking-route
