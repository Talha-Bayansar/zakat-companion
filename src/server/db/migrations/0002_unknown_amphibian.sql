ALTER TABLE "user" ADD COLUMN "active_profile_id" text;--> statement-breakpoint
CREATE INDEX "user_activeProfileId_idx" ON "user" USING btree ("active_profile_id");
