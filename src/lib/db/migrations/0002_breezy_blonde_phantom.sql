CREATE INDEX `author_images_author_idx` ON `author_images` (`author_id`);--> statement-breakpoint
CREATE INDEX `author_images_primary_idx` ON `author_images` (`author_id`,`is_primary`);--> statement-breakpoint
CREATE INDEX `daily_quotes_date_idx` ON `daily_quotes` (`date`);--> statement-breakpoint
CREATE INDEX `quote_submissions_status_idx` ON `quote_submissions` (`status`);--> statement-breakpoint
CREATE INDEX `quote_submissions_ip_idx` ON `quote_submissions` (`submitter_ip`);--> statement-breakpoint
CREATE INDEX `quote_submissions_created_idx` ON `quote_submissions` (`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_quote_interactions_unique_idx` ON `user_quote_interactions` (`user_id`,`quote_id`,`interaction_type`);--> statement-breakpoint
CREATE INDEX `user_interactions_user_idx` ON `user_quote_interactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_interactions_quote_idx` ON `user_quote_interactions` (`quote_id`);--> statement-breakpoint
CREATE INDEX `user_interactions_type_idx` ON `user_quote_interactions` (`interaction_type`);--> statement-breakpoint
CREATE INDEX `user_interactions_user_type_idx` ON `user_quote_interactions` (`user_id`,`interaction_type`);