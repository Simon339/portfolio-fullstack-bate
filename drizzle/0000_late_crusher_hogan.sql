CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'owner');--> statement-breakpoint
CREATE TABLE "account" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" varchar(500),
	"id_token" text,
	"password" varchar(255),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" varchar(50) NOT NULL,
	"table_name" varchar(255) NOT NULL,
	"record_id" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"timestamp" timestamp NOT NULL,
	"details" json,
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "contact_forms" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"topic" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_techstacks" (
	"project_id" varchar(255) NOT NULL,
	"techstack_id" varchar(255) NOT NULL,
	CONSTRAINT "project_techstacks_project_id_techstack_id_pk" PRIMARY KEY("project_id","techstack_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"demo" varchar(255) NOT NULL,
	"image" text,
	"features" json,
	"category_id" varchar(255),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation_items" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"quotation_id" varchar(36) NOT NULL,
	"description" text NOT NULL,
	"quantity" serial NOT NULL,
	"unit" varchar(50) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"rating" serial NOT NULL,
	"feedback" text,
	"name" varchar(255),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_inquiries" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"service" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"address" json,
	"phone_number" varchar(20) NOT NULL,
	"quotation_number" varchar(50) NOT NULL,
	"subtotal" numeric(10, 2),
	"tax_rate" numeric(5, 2),
	"total" numeric(10, 2),
	"notes" text,
	"terms" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "service_inquiries_quotation_number_unique" UNIQUE("quotation_number")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"impersonated_by" varchar(255),
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "techstacks" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" text,
	CONSTRAINT "techstacks_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"secret" varchar(255),
	"backup_codes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "two_factor_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" varchar(500),
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" varchar(500),
	"ban_expires" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "accounts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_techstacks" ADD CONSTRAINT "project_techstacks_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_techstacks" ADD CONSTRAINT "project_techstacks_techstack_id_fk" FOREIGN KEY ("techstack_id") REFERENCES "public"."techstacks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."service_inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "sessions_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "sessions_impersonated_by_fk" FOREIGN KEY ("impersonated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "provider_idx" ON "account" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "account_provider_idx" ON "account" USING btree ("account_id","provider_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_table_name_idx" ON "audit_logs" USING btree ("table_name");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "categories_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "contact_forms_email_idx" ON "contact_forms" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_forms_read_idx" ON "contact_forms" USING btree ("read");--> statement-breakpoint
CREATE INDEX "contact_forms_created_at_idx" ON "contact_forms" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "project_techstacks_project_idx" ON "project_techstacks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_techstacks_techstack_idx" ON "project_techstacks" USING btree ("techstack_id");--> statement-breakpoint
CREATE INDEX "projects_name_idx" ON "projects" USING btree ("name");--> statement-breakpoint
CREATE INDEX "projects_category_idx" ON "projects" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "quotation_items_quotation_idx" ON "quotation_items" USING btree ("quotation_id");--> statement-breakpoint
CREATE INDEX "ratings_rating_idx" ON "ratings" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "ratings_created_at_idx" ON "ratings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "service_inquiries_email_idx" ON "service_inquiries" USING btree ("email");--> statement-breakpoint
CREATE INDEX "service_inquiries_service_idx" ON "service_inquiries" USING btree ("service");--> statement-breakpoint
CREATE INDEX "service_inquiries_read_idx" ON "service_inquiries" USING btree ("read");--> statement-breakpoint
CREATE INDEX "user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "expires_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "techstacks_name_idx" ON "techstacks" USING btree ("name");--> statement-breakpoint
CREATE INDEX "two_factor_user_idx" ON "two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_banned_idx" ON "user" USING btree ("banned");--> statement-breakpoint
CREATE INDEX "identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_expires_idx" ON "verification" USING btree ("expires_at");