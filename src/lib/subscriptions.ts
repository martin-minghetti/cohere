import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { mpPreapproval, mpPreapprovalPlan } from "@/lib/mp";
import { signSubscriptionToken } from "@/lib/subscription-token";
import {
  subscriptionInputSchema,
  type SubscriptionInput,
} from "@/lib/subscription-schema";

export { subscriptionInputSchema, type SubscriptionInput };

export type CreateSubscriptionResult =
  | { ok: true; subscriptionId: string; redirectUrl: string }
  | { ok: false; error: string; field?: string };

export async function createSubscription(
  input: SubscriptionInput,
): Promise<CreateSubscriptionResult> {
  const pro = await db.query.pros.findFirst({
    where: eq(schema.pros.slug, input.proSlug),
  });
  if (!pro) return { ok: false, error: "Profesional no encontrado" };

  const plan = await db.query.plans.findFirst({
    where: (p, { and, eq }) =>
      and(eq(p.proId, pro.id), eq(p.slug, input.planSlug)),
  });
  if (!plan) return { ok: false, error: "Plan no encontrado" };

  const [sub] = await db
    .insert(schema.subscriptions)
    .values({
      planId: plan.id,
      proId: pro.id,
      subscriberName: input.subscriberName,
      subscriberEmail: input.subscriberEmail,
      status: "pending",
    })
    .returning({ id: schema.subscriptions.id });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paymentMode = process.env.PAYMENT_MODE || "simulated";

  if (paymentMode !== "production") {
    const token = signSubscriptionToken(sub.id);
    return {
      ok: true,
      subscriptionId: sub.id,
      redirectUrl: `${siteUrl}/sub/${sub.id}/simulated-checkout?t=${token}`,
    };
  }

  try {
    let preapprovalPlanId = plan.mpPreapprovalPlanId;
    if (!preapprovalPlanId) {
      const planClient = mpPreapprovalPlan.client();
      const created = await planClient.create({
        body: {
          reason: `${pro.name} · ${plan.name}`,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: plan.pricePerMonth,
            currency_id: "ARS",
          },
          back_url: `${siteUrl}/sub/${sub.id}`,
        },
      });
      if (!created.id) throw new Error("MP no devolvió plan id");
      preapprovalPlanId = created.id;
      await db
        .update(schema.plans)
        .set({ mpPreapprovalPlanId: preapprovalPlanId })
        .where(eq(schema.plans.id, plan.id));
    }

    const preapprovalClient = mpPreapproval.client();
    const preapproval = await preapprovalClient.create({
      body: {
        preapproval_plan_id: preapprovalPlanId,
        reason: `${pro.name} · ${plan.name}`,
        external_reference: sub.id,
        payer_email: input.subscriberEmail,
        back_url: `${siteUrl}/sub/${sub.id}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: plan.pricePerMonth,
          currency_id: "ARS",
        },
        status: "pending",
      },
    });

    if (!preapproval.id || !preapproval.init_point) {
      throw new Error("MP no devolvió init_point");
    }

    await db
      .update(schema.subscriptions)
      .set({
        mpPreapprovalId: preapproval.id,
        mpPreapprovalPlanId: preapprovalPlanId,
      })
      .where(eq(schema.subscriptions.id, sub.id));

    return {
      ok: true,
      subscriptionId: sub.id,
      redirectUrl: preapproval.init_point,
    };
  } catch (err) {
    console.error("MP preapproval error:", err);
    await db
      .update(schema.subscriptions)
      .set({ status: "failed" })
      .where(eq(schema.subscriptions.id, sub.id));
    return {
      ok: false,
      error: "No pudimos generar la suscripción. Intentá de nuevo.",
    };
  }
}

export async function pauseSubscription(subscriptionId: string) {
  await db
    .update(schema.subscriptions)
    .set({ status: "paused" })
    .where(eq(schema.subscriptions.id, subscriptionId));
}

export async function resumeSubscription(subscriptionId: string) {
  await db
    .update(schema.subscriptions)
    .set({ status: "active" })
    .where(eq(schema.subscriptions.id, subscriptionId));
}

export async function cancelSubscription(subscriptionId: string) {
  await db
    .update(schema.subscriptions)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(eq(schema.subscriptions.id, subscriptionId));
}
