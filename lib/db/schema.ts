import { pgTable, uuid, text, timestamp, boolean, varchar, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Enums ─────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const generationStatusEnum = pgEnum("generation_status", ["completed", "failed"]);

// ─── Users ─────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id:               uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email:            text("email").notNull().unique(),
  emailVerified:    boolean("email_verified").default(false),
  name:             text("name"),
  givenName:        text("given_name"),
  familyName:       text("family_name"),
  locale:           varchar("locale", { length: 10 }),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSignInAt:     timestamp("last_sign_in_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Allowed Users ─────────────────────────────────────────────────────────────
export const allowedUsers = pgTable("allowed_users", {
  id:        uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email:     text("email").notNull().unique(),
  role:      userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
});

// ─── Generations ───────────────────────────────────────────────────────────────
export const generations = pgTable("generations", {
  id:                uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:            uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  restaurantName:    text("restaurant_name").notNull(),
  restaurantAddress: text("restaurant_address"),
  foodOrdered:       text("food_ordered").notNull(),
  promptUsed:        text("prompt_used").notNull(),
  output:            text("output").notNull(),
  sourceUrls:        text("source_urls"),  // Newline-separated URLs, null if none
  status:            generationStatusEnum("status").default("completed"),
});

// ─── Scrape Cache ─────────────────────────────────────────────────────────────
// 24h TTL — avoids re-scraping unchanged content
export const scrapeCache = pgTable("scrape_cache", {
  id:        uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:    uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  url:       text("url").notNull().unique(),
  title:     text("title"),
  content:   text("content").notNull(),
  scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ─── Inferred types ───────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AllowedUser = typeof allowedUsers.$inferSelect;
export type NewAllowedUser = typeof allowedUsers.$inferInsert;
export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;
export type ScrapeCache = typeof scrapeCache.$inferSelect;
