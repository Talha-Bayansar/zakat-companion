CREATE TYPE "public"."zakat_cycle_end_reason" AS ENUM('fell_below_nisab', 'paid', 'manual', 'rule_change');--> statement-breakpoint
CREATE TYPE "public"."zakat_cycle_status" AS ENUM('running', 'ended');--> statement-breakpoint
CREATE TYPE "public"."nisab_state" AS ENUM('ABOVE', 'BELOW');--> statement-breakpoint
CREATE TYPE "public"."zakat_event_type" AS ENUM('state_above', 'state_below', 'cycle_start', 'cycle_end', 'due_reminder_sent', 'due_notified');--> statement-breakpoint
CREATE TABLE "financial_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"method" text DEFAULT 'standard' NOT NULL,
	"cash" numeric(14, 2) DEFAULT '0' NOT NULL,
	"gold" numeric(14, 2) DEFAULT '0' NOT NULL,
	"silver" numeric(14, 2) DEFAULT '0' NOT NULL,
	"investments" numeric(14, 2) DEFAULT '0' NOT NULL,
	"business_assets" numeric(14, 2) DEFAULT '0' NOT NULL,
	"receivables" numeric(14, 2) DEFAULT '0' NOT NULL,
	"debts_due" numeric(14, 2) DEFAULT '0' NOT NULL,
	"other_liabilities" numeric(14, 2) DEFAULT '0' NOT NULL,
	"nisab_value" numeric(14, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "financial_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "zakat_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"status" "zakat_cycle_status" DEFAULT 'running' NOT NULL,
	"end_reason" "zakat_cycle_end_reason",
	"rule_profile" text DEFAULT 'standard-reset' NOT NULL,
	"next_due_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zakat_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"cycle_id" uuid,
	"event_type" "zakat_event_type" NOT NULL,
	"event_at" timestamp with time zone DEFAULT now() NOT NULL,
	"meta_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "zakat_assessments" ALTER COLUMN "amount_due" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "zakat_assessments" ALTER COLUMN "above_nisab" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "assessment_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "cash" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "gold" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "silver" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "investments" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "business_assets" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "receivables" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "debts_due" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "other_liabilities" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "total_assets" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "total_liabilities" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "net_zakatable_wealth" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "nisab_value" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "zakat_due_now" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "nisab_state" "nisab_state" NOT NULL;--> statement-breakpoint
ALTER TABLE "zakat_assessments" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "financial_profiles" ADD CONSTRAINT "financial_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zakat_cycles" ADD CONSTRAINT "zakat_cycles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zakat_events" ADD CONSTRAINT "zakat_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zakat_events" ADD CONSTRAINT "zakat_events_cycle_id_zakat_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."zakat_cycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "financial_profiles_user_updated_idx" ON "financial_profiles" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "zakat_cycles_user_status_idx" ON "zakat_cycles" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "zakat_cycles_user_started_idx" ON "zakat_cycles" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "zakat_events_user_event_at_idx" ON "zakat_events" USING btree ("user_id","event_at");--> statement-breakpoint
CREATE INDEX "zakat_events_cycle_event_at_idx" ON "zakat_events" USING btree ("cycle_id","event_at");--> statement-breakpoint
CREATE INDEX "zakat_assessments_user_assessment_idx" ON "zakat_assessments" USING btree ("user_id","assessment_at");