CREATE TYPE "public"."zakat_cycle_state" AS ENUM('open', 'due', 'paid', 'followed_up');--> statement-breakpoint
CREATE TABLE "zakat_cycle" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"source_snapshot_id" text,
	"state" "zakat_cycle_state" DEFAULT 'open' NOT NULL,
	"due_at" timestamp NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reminder_job" ADD COLUMN "zakat_cycle_id" text;--> statement-breakpoint
ALTER TABLE "reminder_job" ADD COLUMN "dedupe_key" text;--> statement-breakpoint
UPDATE "reminder_job"
SET "dedupe_key" = CASE
	WHEN "kind" = 'balance_update' THEN 'balance_update:' || "profile_id" || ':' || to_char("scheduled_for", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
	WHEN "kind" = 'zakat_due' THEN 'zakat_due:' || "profile_id" || ':' || coalesce("zakat_cycle_id", "id") || ':' || coalesce("phase"::text, 'due')
	ELSE "id"
END
WHERE "dedupe_key" IS NULL;--> statement-breakpoint
ALTER TABLE "reminder_job" ALTER COLUMN "dedupe_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_cycle" ADD CONSTRAINT "zakat_cycle_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zakat_cycle" ADD CONSTRAINT "zakat_cycle_source_snapshot_id_wealth_snapshot_id_fk" FOREIGN KEY ("source_snapshot_id") REFERENCES "public"."wealth_snapshot"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "zakat_cycle_profileId_idx" ON "zakat_cycle" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "zakat_cycle_state_dueAt_idx" ON "zakat_cycle" USING btree ("state","due_at");--> statement-breakpoint
CREATE INDEX "zakat_cycle_sourceSnapshotId_idx" ON "zakat_cycle" USING btree ("source_snapshot_id");--> statement-breakpoint
ALTER TABLE "reminder_job" ADD CONSTRAINT "reminder_job_zakat_cycle_id_zakat_cycle_id_fk" FOREIGN KEY ("zakat_cycle_id") REFERENCES "public"."zakat_cycle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reminder_job_zakatCycleId_idx" ON "reminder_job" USING btree ("zakat_cycle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reminder_job_dedupeKey_unique" ON "reminder_job" USING btree ("dedupe_key");
