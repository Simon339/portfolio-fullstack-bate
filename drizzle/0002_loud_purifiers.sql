CREATE TYPE "public"."status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" "status" DEFAULT 'draft' NOT NULL;