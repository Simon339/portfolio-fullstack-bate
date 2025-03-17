ALTER TYPE "public"."status" RENAME TO "approval_status";--> statement-breakpoint
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_id_unique";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_id_unique";--> statement-breakpoint
ALTER TABLE "contact_forms" DROP CONSTRAINT "contact_forms_id_unique";--> statement-breakpoint
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_id_unique";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_id_unique";--> statement-breakpoint
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_id_unique";--> statement-breakpoint
ALTER TABLE "service_inquiries" DROP CONSTRAINT "service_inquiries_id_unique";--> statement-breakpoint
ALTER TABLE "techstacks" DROP CONSTRAINT "techstacks_id_unique";--> statement-breakpoint
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_id_unique";--> statement-breakpoint
ALTER TABLE "verification_tokens" DROP CONSTRAINT "verification_tokens_id_unique";--> statement-breakpoint
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "project_techstacks" DROP CONSTRAINT "project_techstacks_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "project_techstacks" DROP CONSTRAINT "project_techstacks_techstack_id_techstacks_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_forms" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_forms" ALTER COLUMN "read" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "service_inquiries" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "service_inquiries" ALTER COLUMN "read" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "image" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_techstacks" ADD CONSTRAINT "project_techstacks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_techstacks" ADD CONSTRAINT "project_techstacks_techstack_id_techstacks_id_fk" FOREIGN KEY ("techstack_id") REFERENCES "public"."techstacks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;