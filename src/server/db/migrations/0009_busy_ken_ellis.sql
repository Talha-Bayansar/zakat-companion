CREATE TYPE "public"."notification_channel" AS ENUM('web_push');--> statement-breakpoint
CREATE TYPE "public"."notification_delivery_attempt_status" AS ENUM('succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_subscription_status" AS ENUM('active', 'disabled', 'expired', 'failed');--> statement-breakpoint
CREATE TABLE "notification_delivery_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"reminder_job_id" text NOT NULL,
	"subscription_id" text NOT NULL,
	"channel" "notification_channel" DEFAULT 'web_push' NOT NULL,
	"kind" "reminder_job_kind" NOT NULL,
	"status" "notification_delivery_attempt_status" NOT NULL,
	"payload" text NOT NULL,
	"attempted_at" timestamp DEFAULT now() NOT NULL,
	"delivered_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"channel" "notification_channel" DEFAULT 'web_push' NOT NULL,
	"endpoint" text NOT NULL,
	"auth" text NOT NULL,
	"p256dh" text NOT NULL,
	"status" "notification_subscription_status" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"disabled_at" timestamp,
	"expired_at" timestamp,
	"failed_at" timestamp,
	"last_failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_delivery_attempt" ADD CONSTRAINT "notification_delivery_attempt_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_delivery_attempt" ADD CONSTRAINT "notification_delivery_attempt_reminder_job_id_reminder_job_id_fk" FOREIGN KEY ("reminder_job_id") REFERENCES "public"."reminder_job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_delivery_attempt" ADD CONSTRAINT "notification_delivery_attempt_subscription_id_notification_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."notification_subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_subscription" ADD CONSTRAINT "notification_subscription_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_delivery_attempt_profileId_idx" ON "notification_delivery_attempt" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "notification_delivery_attempt_reminderJobId_idx" ON "notification_delivery_attempt" USING btree ("reminder_job_id");--> statement-breakpoint
CREATE INDEX "notification_delivery_attempt_subscriptionId_idx" ON "notification_delivery_attempt" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "notification_delivery_attempt_status_attemptedAt_idx" ON "notification_delivery_attempt" USING btree ("status","attempted_at");--> statement-breakpoint
CREATE INDEX "notification_subscription_profileId_idx" ON "notification_subscription" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "notification_subscription_profileId_status_idx" ON "notification_subscription" USING btree ("profile_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_subscription_endpoint_unique" ON "notification_subscription" USING btree ("endpoint");