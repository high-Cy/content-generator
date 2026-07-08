CREATE TYPE "public"."user_status" AS ENUM('pending', 'approved', 'denied', 'revoked');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "approved_by" uuid;--> statement-breakpoint
INSERT INTO "users" ("email", "status", "role", "approved_at")
SELECT "email", 'approved', "role", now() FROM "allowed_users"
ON CONFLICT ("email") DO UPDATE SET
  "status" = 'approved',
  "role" = excluded."role",
  "approved_at" = now();--> statement-breakpoint
DROP TABLE "allowed_users" CASCADE;
