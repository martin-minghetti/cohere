import { sql } from "drizzle-orm";
import {
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const pros = pgTable("pros", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  discipline: text("discipline", {
    enum: ["yoga", "pilates", "coaching"],
  }).notNull(),
  city: text("city").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  coverUrl: text("cover_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    proId: uuid("pro_id")
      .notNull()
      .references(() => pros.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    pricePerMonth: integer("price_per_month").notNull(),
    featured: integer("featured").notNull().default(0),
    mpPreapprovalPlanId: text("mp_preapproval_plan_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    proSlugUnique: uniqueIndex("plans_pro_slug_unique").on(t.proId, t.slug),
  }),
);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "restrict" }),
  proId: uuid("pro_id")
    .notNull()
    .references(() => pros.id, { onDelete: "restrict" }),
  subscriberName: text("subscriber_name").notNull(),
  subscriberEmail: text("subscriber_email").notNull(),
  status: text("status", {
    enum: ["pending", "active", "paused", "cancelled", "failed"],
  })
    .notNull()
    .default("pending"),
  mpPreapprovalId: text("mp_preapproval_id"),
  mpPreapprovalPlanId: text("mp_preapproval_plan_id"),
  nextBillingDate: date("next_billing_date"),
  pausedUntil: date("paused_until"),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const paymentEvents = pgTable("payment_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
    onDelete: "set null",
  }),
  eventType: text("event_type").notNull(),
  mpPaymentId: text("mp_payment_id"),
  mpStatus: text("mp_status"),
  amount: integer("amount"),
  rawPayload: jsonb("raw_payload").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Pro = typeof pros.$inferSelect;
export type NewPro = typeof pros.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type PaymentEvent = typeof paymentEvents.$inferSelect;
