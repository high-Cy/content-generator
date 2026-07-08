/**
 * Seed script to approve the owner as admin in the users table.
 * The owner is also fail-safed in code (lib/access.ts) — this row is for
 * completeness and so the owner appears normally in /admin.
 */
import { setUserStatus } from "./users";

const seedAdmin = async () => {
  const ownerEmail = process.env.OWNER_EMAIL || "loh.chengyin@gmail.com";

  console.log(`Granting admin access to: ${ownerEmail}`);

  await setUserStatus({
    email: ownerEmail,
    status: "approved",
    role: "admin",
  });

  console.log("✅ Owner seeded successfully");
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
