import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { getUserByEmail } from "@/lib/db/users";
import type { UserRole, UserStatus } from "@/lib/db/schema";

// ─── The single access-decision layer ─────────────────────────────────────────
// Every identity entry point (Google OAuth, One Tap, any future magic-link
// provider) and every guard resolves access HERE, keyed on email. Providers
// only prove "this is a verified email" — they never decide who gets in.

export interface Access {
  status: UserStatus;
  role: UserRole;
  isOwner: boolean;
}

export interface AccessContext {
  session: Session;
  access: Access;
}

// Owner fail-safe: decided against OWNER_EMAIL before any DB call, so the
// owner can never be locked out by DB state or an admin misclick.
export const isOwnerEmail = (email: string): boolean =>
  !!process.env.OWNER_EMAIL &&
  email.toLowerCase() === process.env.OWNER_EMAIL.toLowerCase();

export const resolveAccess = async (email: string): Promise<Access> => {
  if (isOwnerEmail(email)) {
    return { status: "approved", role: "admin", isOwner: true };
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) return { status: "pending", role: "user", isOwner: false };
    return { status: user.status, role: user.role, isOwner: false };
  } catch {
    // DB unreachable — fail closed for everyone except the owner (handled above)
    return { status: "pending", role: "user", isOwner: false };
  }
};

/**
 * API-route guard. Status and role are checked against the DB per request —
 * never trusted from the JWT — so approval/revocation apply immediately.
 * Returns null when the caller should respond 401/403.
 */
export const requireAccess = async (role?: UserRole): Promise<AccessContext | null> => {
  const session = await auth();
  if (!session?.user?.email) return null;

  const access = await resolveAccess(session.user.email);
  if (access.status !== "approved") return null;
  if (role === "admin" && access.role !== "admin") return null;

  return { session, access };
};

/** Page/layout guard — same checks as requireAccess, but redirects. */
export const requirePageAccess = async (role?: UserRole): Promise<AccessContext> => {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const access = await resolveAccess(session.user.email);
  if (access.status !== "approved") redirect("/pending");
  if (role === "admin" && access.role !== "admin") redirect("/generate");

  return { session, access };
};
