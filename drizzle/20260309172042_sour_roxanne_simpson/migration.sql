CREATE TABLE `account` (
	`id` varchar(255) PRIMARY KEY,
	`user_id` varchar(255) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` datetime,
	`refresh_token_expires_at` datetime,
	`scope` varchar(500),
	`id_token` text,
	`password` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`action` varchar(50) NOT NULL,
	`table_name` varchar(255) NOT NULL,
	`record_id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`timestamp` datetime NOT NULL,
	`details` json,
	`ip_address` varchar(45),
	`user_agent` text
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(255) PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `name_unique` UNIQUE INDEX(`name`)
);
--> statement-breakpoint
CREATE TABLE `contact_forms` (
	`id` varchar(255) PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`topic` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_techstacks` (
	`project_id` varchar(255) NOT NULL,
	`techstack_id` varchar(255) NOT NULL,
	CONSTRAINT PRIMARY KEY(`project_id`,`techstack_id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(255) PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`demo` varchar(255) NOT NULL,
	`image` text,
	`features` json,
	`category_id` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quotation_items` (
	`id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
	`quotation_id` varchar(36) NOT NULL,
	`description` text NOT NULL,
	`quantity` int NOT NULL,
	`unit` varchar(50) NOT NULL,
	`unit_price` decimal(10,2) NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` varchar(255) PRIMARY KEY,
	`rating` int NOT NULL,
	`feedback` text,
	`name` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `service_inquiries` (
	`id` varchar(255) PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`company_name` varchar(255) NOT NULL,
	`service` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`address` json,
	`phone_number` varchar(20) NOT NULL,
	`quotation_number` varchar(50) NOT NULL,
	`subtotal` decimal(10,2),
	`tax_rate` decimal(5,2),
	`total` decimal(10,2),
	`notes` text,
	`terms` text,
	`read` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL,
	CONSTRAINT `quotation_number_unique` UNIQUE INDEX(`quotation_number`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) PRIMARY KEY,
	`user_id` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	`active_organization_id` varchar(255),
	`active_team_id` varchar(255),
	`impersonated_by` varchar(255)
);
--> statement-breakpoint
CREATE TABLE `techstacks` (
	`id` varchar(255) PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`image` text,
	CONSTRAINT `name_unique` UNIQUE INDEX(`name`)
);
--> statement-breakpoint
CREATE TABLE `two_factor` (
	`id` varchar(255) PRIMARY KEY,
	`user_id` varchar(255) NOT NULL,
	`secret` varchar(255),
	`backup_codes` text,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `user_id_unique` UNIQUE INDEX(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) PRIMARY KEY,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` varchar(500),
	`two_factor_enabled` boolean NOT NULL DEFAULT false,
	`role` enum('user','admin','owner') NOT NULL DEFAULT 'user',
	`banned` boolean NOT NULL DEFAULT false,
	`ban_reason` varchar(500),
	`ban_expires` datetime,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `email_unique` UNIQUE INDEX(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(255) PRIMARY KEY,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `provider_idx` ON `account` (`provider_id`);--> statement-breakpoint
CREATE INDEX `account_provider_idx` ON `account` (`account_id`,`provider_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `audit_logs_table_name_idx` ON `audit_logs` (`table_name`);--> statement-breakpoint
CREATE INDEX `audit_logs_user_id_idx` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_timestamp_idx` ON `audit_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `categories_name_idx` ON `categories` (`name`);--> statement-breakpoint
CREATE INDEX `contact_forms_email_idx` ON `contact_forms` (`email`);--> statement-breakpoint
CREATE INDEX `contact_forms_read_idx` ON `contact_forms` (`read`);--> statement-breakpoint
CREATE INDEX `contact_forms_created_at_idx` ON `contact_forms` (`created_at`);--> statement-breakpoint
CREATE INDEX `project_techstacks_project_idx` ON `project_techstacks` (`project_id`);--> statement-breakpoint
CREATE INDEX `project_techstacks_techstack_idx` ON `project_techstacks` (`techstack_id`);--> statement-breakpoint
CREATE INDEX `projects_name_idx` ON `projects` (`name`);--> statement-breakpoint
CREATE INDEX `projects_category_idx` ON `projects` (`category_id`);--> statement-breakpoint
CREATE INDEX `projects_created_at_idx` ON `projects` (`created_at`);--> statement-breakpoint
CREATE INDEX `quotation_items_quotation_idx` ON `quotation_items` (`quotation_id`);--> statement-breakpoint
CREATE INDEX `ratings_rating_idx` ON `ratings` (`rating`);--> statement-breakpoint
CREATE INDEX `ratings_created_at_idx` ON `ratings` (`created_at`);--> statement-breakpoint
CREATE INDEX `service_inquiries_email_idx` ON `service_inquiries` (`email`);--> statement-breakpoint
CREATE INDEX `service_inquiries_service_idx` ON `service_inquiries` (`service`);--> statement-breakpoint
CREATE INDEX `service_inquiries_read_idx` ON `service_inquiries` (`read`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `expires_idx` ON `session` (`expires_at`);--> statement-breakpoint
CREATE INDEX `session_active_org_idx` ON `session` (`active_organization_id`);--> statement-breakpoint
CREATE INDEX `session_active_team_idx` ON `session` (`active_team_id`);--> statement-breakpoint
CREATE INDEX `techstacks_name_idx` ON `techstacks` (`name`);--> statement-breakpoint
CREATE INDEX `two_factor_user_idx` ON `two_factor` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `user_role_idx` ON `user` (`role`);--> statement-breakpoint
CREATE INDEX `user_banned_idx` ON `user` (`banned`);--> statement-breakpoint
CREATE INDEX `identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `verification_expires_idx` ON `verification` (`expires_at`);--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `accounts_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `project_techstacks` ADD CONSTRAINT `project_techstacks_project_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `project_techstacks` ADD CONSTRAINT `project_techstacks_techstack_id_fk` FOREIGN KEY (`techstack_id`) REFERENCES `techstacks`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `quotation_items` ADD CONSTRAINT `quotation_items_quotation_id_fk` FOREIGN KEY (`quotation_id`) REFERENCES `service_inquiries`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `sessions_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `sessions_impersonated_by_fk` FOREIGN KEY (`impersonated_by`) REFERENCES `user`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `two_factor` ADD CONSTRAINT `two_factor_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE;