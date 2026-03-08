ALTER TABLE "scrape_cache" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "scrape_cache" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_google_id_unique";--> statement-breakpoint
ALTER TABLE "generations" DROP COLUMN "source_urls";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "google_id";