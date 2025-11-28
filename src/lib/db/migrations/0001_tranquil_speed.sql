CREATE TABLE `author_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author_id` integer NOT NULL,
	`image_url` text NOT NULL,
	`image_type` text NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`alt_text` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now')) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quote_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`text_ja` text,
	`author_name` text NOT NULL,
	`category_name` text,
	`subcategory_name` text,
	`background` text,
	`submitter_email` text,
	`submitter_name` text,
	`submitter_ip` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`edited_text` text,
	`edited_text_ja` text,
	`edited_author_name` text,
	`edited_category_name` text,
	`edited_subcategory_name` text,
	`edited_background` text,
	`admin_feedback` text,
	`reviewed_by` text,
	`reviewed_at` integer,
	`approved_quote_id` integer,
	`created_at` integer DEFAULT (unixepoch('now')) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now')) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`approved_quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `user_quote_interactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`quote_id` integer NOT NULL,
	`interaction_type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`email` text,
	`preferences` text,
	`created_at` integer DEFAULT (unixepoch('now')) NOT NULL,
	`last_active_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_user_id_unique` ON `users` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);