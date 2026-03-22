CREATE TYPE "public"."deployment_mode" AS ENUM('dedicated', 'shared', 'external');--> statement-breakpoint
CREATE TYPE "public"."deployment_status" AS ENUM('pending', 'running', 'stopped', 'failed');--> statement-breakpoint
CREATE TABLE "deployments" (
	"id" text PRIMARY KEY NOT NULL,
	"mode" "deployment_mode" NOT NULL,
	"model_id" text NOT NULL,
	"model_label" text NOT NULL,
	"model_size" text NOT NULL,
	"model_image" text NOT NULL,
	"model_min_vram" integer NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"memory" jsonb DEFAULT '{"enablePrivateMemory":false,"persistentMemory":false,"encryption":false}'::jsonb NOT NULL,
	"agent_behavior" jsonb DEFAULT '{"autonomousMode":false,"taskTimeout":30,"maxConcurrentTasks":3}'::jsonb NOT NULL,
	"notifications" jsonb DEFAULT '{"webhookNotifications":false,"emailAlerts":false,"taskReports":false}'::jsonb NOT NULL,
	"auto_sleep" jsonb DEFAULT '{"enableAutoSleep":false,"idleTimeout":15}'::jsonb NOT NULL,
	"status" "deployment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"size" text NOT NULL,
	"desc" text NOT NULL,
	"recommended" boolean DEFAULT false NOT NULL,
	"image" text NOT NULL,
	"min_vram" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;