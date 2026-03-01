import { db } from "./index";
import { users, allowedUsers } from "./schema";
import { eq, sql } from "drizzle-orm";

/**
 * Upsert user on sign-in - creates new user or updates their info
 * Captures all available Google OAuth data
 * Uses email as the unique identifier for upsert
 */
export async function upsertUser(data: {
  email: string;
  emailVerified?: boolean;
  name?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  image?: string | null;
  locale?: string | null;
}) {
  const [result] = await db
    .insert(users)
    .values({
      email: data.email,
      emailVerified: data.emailVerified ?? false,
      name: data.name,
      givenName: data.givenName,
      familyName: data.familyName,
      locale: data.locale,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        emailVerified: data.emailVerified ?? false,
        name: data.name,
        givenName: data.givenName,
        familyName: data.familyName,
        locale: data.locale,
        lastSignInAt: sql`now()`,
      },
    })
    .returning();
  
  return result;
}

/**
 * Check if user is allowed to access the app
 * Returns the user's role if allowed, null otherwise
 */
export async function getUserAccess(email: string): Promise<{
  isAllowed: boolean;
  role?: "admin" | "user";
} | null> {
  const allowed = await db
    .select()
    .from(allowedUsers)
    .where(eq(allowedUsers.email, email.toLowerCase()))
    .limit(1);

  if (allowed.length === 0) {
    return { isAllowed: false };
  }

  return {
    isAllowed: true,
    role: allowed[0].role as "admin" | "user",
  };
}

/**
 * Grant access to a user
 * Should only be called by admins
 */
export async function grantUserAccess(data: {
  email: string;
  role?: "admin" | "user";
  createdBy?: string;
  notes?: string;
}) {
  const [created] = await db
    .insert(allowedUsers)
    .values({
      email: data.email.toLowerCase(),
      role: data.role ?? "user",
      createdBy: data.createdBy,
    })
    .onConflictDoUpdate({
      target: allowedUsers.email,
      set: {
        role: data.role ?? "user",
        createdBy: data.createdBy,
      },
    })
    .returning();
  return created;
}

/**
 * Revoke user access
 */
export async function revokeUserAccess(email: string) {
  await db
    .delete(allowedUsers)
    .where(eq(allowedUsers.email, email.toLowerCase()));
}
