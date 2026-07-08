/**
 * Break-glass CLI to manage access when the /admin UI is unavailable.
 *
 * Usage:
 *   npm run db:whitelist add friend@example.com      # approve
 *   npm run db:whitelist remove friend@example.com   # revoke
 *   npm run db:whitelist list
 */
import { db } from "./index";
import { users } from "./schema";
import { setUserStatus } from "./users";

const [, , action, email] = process.argv;

const run = async () => {
  if (action === "list") {
    const rows = await db.select().from(users).orderBy(users.createdAt);
    if (rows.length === 0) {
      console.log("No users.");
    } else {
      console.log("\nUsers:");
      rows.forEach((r) => console.log(`  ${r.status.padEnd(8)}  ${r.role.padEnd(6)}  ${r.email}`));
    }
    process.exit(0);
  }

  if (!email) {
    console.error("Usage: npm run db:whitelist <add|remove|list> [email]");
    process.exit(1);
  }

  if (action === "add") {
    await setUserStatus({ email, status: "approved" });
    console.log(`Approved: ${email}`);
  } else if (action === "remove") {
    await setUserStatus({ email, status: "revoked" });
    console.log(`Revoked: ${email}`);
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
