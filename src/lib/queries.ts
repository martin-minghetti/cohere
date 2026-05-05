import "server-only";
import { eq, asc, sql, count, and } from "drizzle-orm";
import { db, schema } from "./db";

export { formatPriceARS } from "./format";

export async function getPros() {
  return db.select().from(schema.pros).orderBy(asc(schema.pros.name));
}

export async function getProBySlug(slug: string) {
  const [pro] = await db
    .select()
    .from(schema.pros)
    .where(eq(schema.pros.slug, slug))
    .limit(1);
  return pro ?? null;
}

export async function getPlansForPro(proId: string) {
  return db
    .select()
    .from(schema.plans)
    .where(eq(schema.plans.proId, proId))
    .orderBy(asc(schema.plans.pricePerMonth));
}

export async function getPlanByProAndSlug(proSlug: string, planSlug: string) {
  const pro = await getProBySlug(proSlug);
  if (!pro) return null;
  const [plan] = await db
    .select()
    .from(schema.plans)
    .where(
      and(eq(schema.plans.proId, pro.id), eq(schema.plans.slug, planSlug)),
    )
    .limit(1);
  if (!plan) return null;
  return { plan, pro };
}

export async function getActiveSubscribersCount(proId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.proId, proId),
        eq(schema.subscriptions.status, "active"),
      ),
    );
  return row?.value ?? 0;
}

export async function getMonthlyRevenue(proId: string) {
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${schema.plans.pricePerMonth}), 0)`,
    })
    .from(schema.subscriptions)
    .innerJoin(schema.plans, eq(schema.subscriptions.planId, schema.plans.id))
    .where(
      and(
        eq(schema.subscriptions.proId, proId),
        eq(schema.subscriptions.status, "active"),
      ),
    );
  return Number(row?.total ?? 0);
}

export async function getSubscriptionsForPro(proId: string) {
  return db
    .select({
      id: schema.subscriptions.id,
      subscriberName: schema.subscriptions.subscriberName,
      subscriberEmail: schema.subscriptions.subscriberEmail,
      status: schema.subscriptions.status,
      createdAt: schema.subscriptions.createdAt,
      planName: schema.plans.name,
      pricePerMonth: schema.plans.pricePerMonth,
    })
    .from(schema.subscriptions)
    .innerJoin(schema.plans, eq(schema.subscriptions.planId, schema.plans.id))
    .where(eq(schema.subscriptions.proId, proId))
    .orderBy(asc(schema.subscriptions.createdAt));
}

export async function getSubscriptionWithPlanAndPro(subscriptionId: string) {
  const [row] = await db
    .select({
      sub: schema.subscriptions,
      plan: schema.plans,
      pro: schema.pros,
    })
    .from(schema.subscriptions)
    .innerJoin(schema.plans, eq(schema.subscriptions.planId, schema.plans.id))
    .innerJoin(schema.pros, eq(schema.subscriptions.proId, schema.pros.id))
    .where(eq(schema.subscriptions.id, subscriptionId))
    .limit(1);
  return row ?? null;
}
