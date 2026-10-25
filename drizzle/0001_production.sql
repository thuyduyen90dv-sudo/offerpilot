CREATE TABLE credentials (owner TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE rate_limits (key TEXT NOT NULL, bucket TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (key,bucket));
--> statement-breakpoint
CREATE TABLE scheduler_runs (id TEXT PRIMARY KEY NOT NULL, started_at TEXT NOT NULL, finished_at TEXT, status TEXT NOT NULL, result TEXT);
--> statement-breakpoint
CREATE TABLE application_attempts (owner TEXT NOT NULL, application_id TEXT NOT NULL, status TEXT NOT NULL, receipt TEXT, updated_at TEXT NOT NULL, PRIMARY KEY(owner,application_id));
