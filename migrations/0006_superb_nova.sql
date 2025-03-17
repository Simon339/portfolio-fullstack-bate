CREATE TYPE "public"."backup_frequency" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_name" varchar(255) NOT NULL,
	"site_description" text,
	"logo" varchar(255),
	"contact_email" varchar(255) NOT NULL,
	"timezone" varchar(50) NOT NULL,
	"maintenance_mode" boolean DEFAULT false,
	"backup_frequency" "backup_frequency" DEFAULT 'daily',
	"font_family" varchar(50) DEFAULT 'Inter',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
