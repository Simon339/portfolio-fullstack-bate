ALTER TABLE "tokens" DROP CONSTRAINT "tokens_token_unique";--> statement-breakpoint
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_email_token_pk";--> statement-breakpoint
CREATE UNIQUE INDEX "tokens_unique_email_token" ON "tokens" USING btree ("email","token");