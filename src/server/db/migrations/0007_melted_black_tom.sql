CREATE TYPE "public"."reminder_cadence" AS ENUM('daily', 'weekly', 'monthly', 'quarterly');--> statement-breakpoint
CREATE TYPE "public"."reminder_job_kind" AS ENUM('balance_update', 'zakat_due');--> statement-breakpoint
CREATE TYPE "public"."reminder_job_phase" AS ENUM('before_due', 'due', 'follow_up');--> statement-breakpoint
CREATE TYPE "public"."reminder_job_status" AS ENUM('pending', 'claimed', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "reminder_job" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"kind" "reminder_job_kind" NOT NULL,
	"phase" "reminder_job_phase",
	"status" "reminder_job_status" DEFAULT 'pending' NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"claimed_at" timestamp,
	"completed_at" timestamp,
	"last_attempt_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminder_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"balance_update_cadence" "reminder_cadence" DEFAULT 'monthly' NOT NULL,
	"timezone" text NOT NULL,
	"quiet_hours_start_time" text,
	"quiet_hours_end_time" text,
	"zakat_due_follow_up_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reminder_job" ADD CONSTRAINT "reminder_job_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder_preference" ADD CONSTRAINT "reminder_preference_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reminder_job_profileId_idx" ON "reminder_job" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "reminder_job_status_scheduledFor_idx" ON "reminder_job" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "reminder_preference_profileId_idx" ON "reminder_preference" USING btree ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reminder_preference_profileId_unique" ON "reminder_preference" USING btree ("profile_id");