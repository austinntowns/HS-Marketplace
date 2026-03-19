import { pgTable, text, timestamp, integer, decimal, date, json } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { listingStatusEnum, listingTypeEnum } from "./enums"
import { users } from "./auth"

export const listings = pgTable("listings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sellerId: text("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Type and status
  type: listingTypeEnum("type").notNull(),
  status: listingStatusEnum("status").default("draft").notNull(),

  // Location info
  locationName: text("location_name"),
  city: text("city"),
  state: text("state"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  squareFootage: integer("square_footage"),
  openingDate: date("opening_date"),

  // Financials (stored in cents for precision)
  askingPrice: integer("asking_price"),
  ttmProfit: integer("ttm_profit"),
  monthlyExpenses: json("monthly_expenses").$type<{
    rent?: number
    labor?: number
    supplies?: number
    utilities?: number
    marketing?: number
    other?: number
  }>(),

  // Seller content
  reasonForSelling: text("reason_for_selling"),
  assets: text("assets"),
  notes: text("notes"),

  // Admin fields
  rejectionReason: text("rejection_reason"),

  // Bundle support (array of listing IDs for bundle type)
  bundledListingIds: json("bundled_listing_ids").$type<string[]>(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  soldAt: timestamp("sold_at"),
})

export const listingsRelations = relations(listings, ({ one }) => ({
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id],
  }),
}))

// Type exports for use in app code
export type Listing = typeof listings.$inferSelect
export type NewListing = typeof listings.$inferInsert
