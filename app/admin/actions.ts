"use server";

import { revalidatePath } from "next/cache";
import { requireAccess, isOwnerEmail } from "@/lib/access";
import { setUserStatus } from "@/lib/db/users";
import type { UserStatus } from "@/lib/db/schema";

// Server actions are public endpoints — each one re-verifies admin access and
// refuses to touch the owner, regardless of what the UI renders.
const setStatus = async (formData: FormData, status: UserStatus) => {
  const ctx = await requireAccess("admin");
  if (!ctx) throw new Error("Not authorised");

  const email = String(formData.get("email") ?? "").trim();
  if (!email) throw new Error("Missing email");
  if (isOwnerEmail(email)) throw new Error("The owner's access cannot be changed");

  await setUserStatus({ email, status, byUserId: ctx.session.user?.id ?? null });
  revalidatePath("/admin");
};

export const approveUser = async (formData: FormData) => setStatus(formData, "approved");
export const denyUser = async (formData: FormData) => setStatus(formData, "denied");
export const revokeUser = async (formData: FormData) => setStatus(formData, "revoked");
