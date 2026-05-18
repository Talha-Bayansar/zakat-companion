CREATE TABLE "nisab_benchmark_price" (
	"currency" text PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'metals.dev' NOT NULL,
	"gold_price" text NOT NULL,
	"silver_price" text NOT NULL,
	"source_timestamp" timestamp NOT NULL,
	"last_successful_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "nisab_benchmark_price_currency_idx" ON "nisab_benchmark_price" USING btree ("currency");