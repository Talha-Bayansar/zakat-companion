CREATE TYPE "public"."wealth_category" AS ENUM('cash', 'gold', 'silver', 'trade_inventory', 'receivables', 'debts_liabilities');--> statement-breakpoint
CREATE TABLE "wealth_snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wealth_snapshot_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"snapshot_id" text NOT NULL,
	"category" "wealth_category" NOT NULL,
	"amount" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wealth_snapshot" ADD CONSTRAINT "wealth_snapshot_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wealth_snapshot_entry" ADD CONSTRAINT "wealth_snapshot_entry_snapshot_id_wealth_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."wealth_snapshot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "wealth_snapshot_profileId_unique" ON "wealth_snapshot" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "wealth_snapshot_entry_snapshotId_idx" ON "wealth_snapshot_entry" USING btree ("snapshot_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wealth_snapshot_entry_snapshotId_category_unique" ON "wealth_snapshot_entry" USING btree ("snapshot_id","category");