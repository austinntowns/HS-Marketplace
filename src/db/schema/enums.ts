import { pgEnum } from "drizzle-orm/pg-core"

// Listing status state machine
// Transitions: draft -> pending -> active/rejected
//              active -> sold/delisted
//              rejected -> draft (after edit)
export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "pending",
  "active",
  "rejected",
  "sold",
  "delisted",
])

// Listing types
export const listingTypeEnum = pgEnum("listing_type", [
  "suite",
  "flagship",
  "territory",
  "bundle",
])
