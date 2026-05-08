CREATE TABLE "profile" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_permission" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"user_id" text NOT NULL,
	"granted_by_user_id" text NOT NULL,
	"permission" text DEFAULT 'manager' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_permission" ADD CONSTRAINT "profile_permission_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_permission" ADD CONSTRAINT "profile_permission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_permission" ADD CONSTRAINT "profile_permission_granted_by_user_id_user_id_fk" FOREIGN KEY ("granted_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "profile_ownerId_idx" ON "profile" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "profile_permission_profileId_idx" ON "profile_permission" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "profile_permission_userId_idx" ON "profile_permission" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "profile_permission_grantedByUserId_idx" ON "profile_permission" USING btree ("granted_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profile_permission_profileId_userId_unique" ON "profile_permission" USING btree ("profile_id","user_id");