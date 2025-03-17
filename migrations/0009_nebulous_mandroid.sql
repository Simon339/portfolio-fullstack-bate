CREATE TYPE "public"."backup_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."backup_type" AS ENUM('manual', 'scheduled');--> statement-breakpoint
CREATE TABLE "backups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"path" varchar(512) NOT NULL,
	"size" varchar(20) NOT NULL,
	"type" "backup_type" DEFAULT 'manual' NOT NULL,
	"status" "backup_status" DEFAULT 'completed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN "backup_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN "backup_retention_days" integer DEFAULT 30;