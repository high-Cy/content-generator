import { pgTable, uuid, text, timestamp, boolean, varchar, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Enums ─────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const userStatusEnum = pgEnum("user_status", ["pending", "approved", "denied", "revoked"]);
export const generationStatusEnum = pgEnum("generation_status", ["completed", "failed"]);

// ─── Users ─────────────────────────────────────────────────────────────────────
// Single source of truth for identity AND access. Anyone who signs in gets a row
// (status 'pending'); the admin flips status via /admin. The owner (OWNER_EMAIL)
// bypasses this table entirely — see lib/access.ts.
export const users = pgTable("users", {
  id:               uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email:            text("email").notNull().unique(),
  emailVerified:    boolean("email_verified").default(false),
  name:             text("name"),
  givenName:        text("given_name"),
  familyName:       text("family_name"),
  locale:           varchar("locale", { length: 10 }),
  status:           userStatusEnum("status").notNull().default("pending"),
  role:             userRoleEnum("role").notNull().default("user"),
  approvedAt:       timestamp("approved_at", { withTimezone: true }),
  approvedBy:       uuid("approved_by"),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSignInAt:     timestamp("last_sign_in_at", { withTimezone: true }).notNull().defaultNow(),
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
  status:            generationStatusEnum("status").default("completed"),
});

// ─── Inferred types ───────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserStatus = User["status"];
export type UserRole = User["role"];
export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;
