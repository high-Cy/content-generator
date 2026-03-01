/**
 * Seed script to add initial admin user
 * Run this once after running migrations
 */
import { grantUserAccess } from "./users";

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "loh.chengyin@gmail.com";
  
  console.log(`Granting admin access to: ${adminEmail}`);
  
  await grantUserAccess({
    email: adminEmail,
    role: "admin",
  });
  
  console.log("✅ Admin user seeded successfully");
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
