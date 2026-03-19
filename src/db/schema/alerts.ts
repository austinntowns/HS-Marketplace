import { pgTable, text, timestamp, json, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./auth"

export const alerts = pgTable("alerts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Filter criteria stored as arrays
  states: json("states").$type<string[]>(),
  listingTypes: json("listing_types").$type<string[]>(),
  // Price range (in cents)
  minPrice: integer("min_price"),
  maxPrice: integer("max_price"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
})

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
}))

export type Alert = typeof alerts.$inferSelect
export type NewAlert = typeof alerts.$inferInsert
