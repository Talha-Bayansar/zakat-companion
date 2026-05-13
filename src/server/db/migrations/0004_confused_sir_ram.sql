ALTER TABLE "wealth_snapshot" ADD COLUMN "captured_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "wealth_snapshot" ADD COLUMN "madhab" text;--> statement-breakpoint
ALTER TABLE "wealth_snapshot" ADD COLUMN "nisab_benchmark" text;--> statement-breakpoint
ALTER TABLE "wealth_snapshot" ADD COLUMN "calculation_version" text;--> statement-breakpoint
ALTER TABLE "wealth_snapshot" ADD COLUMN "net_zakatable_base" text;--> statement-breakpoint
ALTER TABLE "wealth_snapshot" ADD COLUMN "is_above_nisab" boolean;--> statement-breakpoint
ALTER TABLE "wealth_snapshot" ADD COLUMN "is_zakat_due" boolean;--> statement-breakpoint
CREATE INDEX "wealth_snapshot_profileId_capturedAt_idx" ON "wealth_snapshot" USING btree ("profile_id","captured_at");