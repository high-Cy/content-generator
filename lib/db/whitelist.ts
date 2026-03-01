/**
 * CLI script to whitelist or remove a user by email.
 *
 * Usage:
 *   npm run db:whitelist add friend@example.com
 *   npm run db:whitelist remove friend@example.com
 *   npm run db:whitelist list
 */
import { db } from "./index";
import { allowedUsers } from "./schema";
import { eq } from "drizzle-orm";

const [, , action, email] = process.argv;

const run = async () => {
  if (action === "list") {
    const rows = await db.select().from(allowedUsers).orderBy(allowedUsers.createdAt);
    if (rows.length === 0) {
      console.log("No whitelisted users.");
    } else {
      console.log("\nWhitelisted users:");
      rows.forEach((r) => console.log(`  ${r.role.padEnd(6)}  ${r.email}`));
    }
    process.exit(0);
  }

  if (!email) {
    console.error("Usage: npm run db:whitelist <add|remove|list> [email]");
    process.exit(1);
  }

  if (action === "add") {
    await db
      .insert(allowedUsers)
      .values({ email: email.toLowerCase(), role: "user" })
      .onConflictDoUpdate({ target: allowedUsers.email, set: { role: "user" } });
    console.log(`Whitelisted: ${email}`);
  } else if (action === "remove") {
    await db.delete(allowedUsers).where(eq(allowedUsers.email, email.toLowerCase()));
    console.log(`Removed: ${email}`);
  } else {
    console.error("Unknown action. Use: add | remove | list");
    process.exit(1);
  }

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
