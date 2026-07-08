import { db } from "./index";
import { users } from "./schema";
import type { User, UserStatus, UserRole } from "./schema";
import { desc, eq, sql } from "drizzle-orm";

/**
 * Upsert user on sign-in — creates the row (status defaults to 'pending') or
 * refreshes profile fields. Never touches status/role: access decisions belong
 * to lib/access.ts and the admin actions, not the sign-in path.
 */
export const upsertUser = async (data: {
  email: string;
  emailVerified?: boolean;
  name?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  image?: string | null;
  locale?: string | null;
}): Promise<User> => {
  const [result] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      emailVerified: data.emailVerified ?? false,
      name: data.name,
      givenName: data.givenName,
      familyName: data.familyName,
      locale: data.locale,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        ...(data.emailVerified !== undefined ? { emailVerified: data.emailVerified } : {}),
        name: data.name,
        givenName: data.givenName,
        familyName: data.familyName,
        locale: data.locale,
        lastSignInAt: sql`now()`,
      },
    })
    .returning();

  return result;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  return user ?? null;
};

/** All users, newest first — for the /admin page. */
export const listUsers = async (): Promise<User[]> =>
  db.select().from(users).orderBy(desc(users.createdAt));

/**
 * Set a user's access status (approve / deny / revoke / re-approve).
 * Creates the row if the email has never signed in. Callers are responsible
 * for admin + owner-immunity checks (see app/admin/actions.ts).
 */
export const setUserStatus = async (data: {
  email: string;
  status: UserStatus;
  role?: UserRole;
  byUserId?: string | null;
}): Promise<User> => {
  const approval =
    data.status === "approved"
      ? { approvedAt: sql`now()`, approvedBy: data.byUserId ?? null }
      : {};

  const [result] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      status: data.status,
      role: data.role ?? "user",
      ...(data.status === "approved"
        ? { approvedAt: sql`now()`, approvedBy: data.byUserId ?? null }
        : {}),
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        status: data.status,
        ...(data.role ? { role: data.role } : {}),
        ...approval,
      },
    })
    .returning();

  return result;
};
