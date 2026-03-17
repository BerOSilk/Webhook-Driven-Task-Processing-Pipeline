import {
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";

export const pipelines = pgTable("pipelines", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: varchar("name", { length: 255 }).notNull().unique(),
  source: varchar("source", { length: 255 }).notNull(),
  actionType: varchar("action_type", { length: 50 }).notNull(),
  subscribers: jsonb("subscribers").notNull().default([]),
  actionConfig: jsonb("action_config").notNull().default({}),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  pipelineID: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, {
      onDelete: "cascade",
    }),
  payload: jsonb("payload").notNull(),
  processedPayload: jsonb("processed_payload"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  processedAt: timestamp("processed_at"),
});

export const jobAttempts = pgTable("job_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobID: uuid("job_id")
    .notNull()
    .references(() => jobs.id, {
      onDelete: "cascade",
    }),
  status: varchar("status", { length: 50 }),
  errorMessage: text("error_message"),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

export const deliveryAttempts = pgTable("delivery_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobID: uuid("job_id")
    .notNull()
    .references(() => jobs.id, {
      onDelete: "cascade",
    }),
  subscriberURL: varchar("subscriber_url", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }),
  responseCode: integer("response_code"),
  errorMessage: text("error_message"),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

export type Pipeline = typeof pipelines.$inferInsert;
export type Job = typeof jobs.$inferInsert;
export type DeliveryAttempts = typeof deliveryAttempts.$inferInsert;
export type JobAttempts = typeof jobAttempts.$inferInsert;
