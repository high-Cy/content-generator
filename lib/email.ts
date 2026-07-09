import { Resend } from "resend";
import type { User } from "./db/schema";

// ─── notifyOwnerOfAccessRequest ───────────────────────────────────────────────
// Fire-and-forget email to the owner when a new user requests access. Fail-soft:
// no-ops silently when unconfigured so it can never block sign-in. The Resend
// client is built lazily — its constructor throws on a missing key, which would
// otherwise break module evaluation (and the build) when the var is unset.

export const notifyOwnerOfAccessRequest = async (user: User): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.OWNER_EMAIL;

  if (!apiKey || !from || !to) return;
  // Don't notify the owner about their own first sign-in.
  if (user.email.toLowerCase() === to.toLowerCase()) return;

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;
  const adminLink = baseUrl ? `${baseUrl.replace(/\/$/, "")}/admin` : "the /admin page";
  const who = user.name ? `${user.name} (${user.email})` : user.email;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to,
    subject: `New Fawn access request: ${user.email}`,
    text: `${who} just requested access to Fawn.\n\nReview and approve at ${adminLink}`,
  });
};
