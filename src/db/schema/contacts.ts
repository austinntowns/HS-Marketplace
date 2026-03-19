import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { listings } from "./listings"
import { users } from "./auth"

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  listingId: text("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  buyerId: text("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message"),
  // Buyer info snapshot (in case user updates profile later)
  buyerName: text("buyer_name"),
  buyerEmail: text("buyer_email"),
  buyerPhone: text("buyer_phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const contactsRelations = relations(contacts, ({ one }) => ({
  listing: one(listings, {
    fields: [contacts.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    fields: [contacts.buyerId],
    references: [users.id],
  }),
}))

export type Contact = typeof contacts.$inferSelect
export type NewContact = typeof contacts.$inferInsert
