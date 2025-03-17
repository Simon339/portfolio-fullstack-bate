ALTER TYPE "public"."role" ADD VALUE 'SUPER_ADMIN';--> statement-breakpoint
CREATE TABLE "deleted_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_user_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"deleted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_data" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "details" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deletion_requested_at" timestamp with time zone;