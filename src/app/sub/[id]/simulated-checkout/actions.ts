"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import {
  validateSubscriptionToken,
  signPortalToken,
} from "@/lib/subscription-token";

export async function simulatePreapprovalAction(
  subscriptionId: string,
  outcome: "authorized" | "rejected",
  token: string,
) {
  const tokenCheck = validateSubscriptionToken(subscriptionId, token);
  if (!tokenCheck.ok) redirect("/");

  const sub = await db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.id, subscriptionId),
  });
  if (!sub) redirect("/");

  const portalToken = signPortalToken(subscriptionId);

  if (sub.status === "active" || sub.status === "cancelled") {
    redirect(`/sub/${sub.id}?t=${portalToken}`);
  }

  const fakePreapprovalId = `SIM-PRE-${Date.now()}`;

  if (outcome === "authorized") {
    const fakePaymentId = `SIM-PAY-${Date.now()}`;
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    await db
      .update(schema.subscriptions)
      .set({
        status: "active",
        mpPreapprovalId: fakePreapprovalId,
        activatedAt: new Date(),
        nextBillingDate: nextBilling.toISOString().slice(0, 10),
      })
      .where(eq(schema.subscriptions.id, sub.id));

    await db.insert(schema.paymentEvents).values({
      subscriptionId: sub.id,
      eventType: "subscription_authorized_payment",
      mpPaymentId: fakePaymentId,
      mpStatus: "approved",
      amount: 0,
      rawPayload: {
        simulated: true,
        outcome: "authorized",
        preapprovalId: fakePreapprovalId,
        paymentId: fakePaymentId,
      },
    });
  } else {
    await db
      .update(schema.subscriptions)
      .set({ status: "failed", mpPreapprovalId: fakePreapprovalId })
      .where(eq(schema.subscriptions.id, sub.id));

    await db.insert(schema.paymentEvents).values({
      subscriptionId: sub.id,
      eventType: "subscription_preapproval",
      mpStatus: "rejected",
      rawPayload: {
        simulated: true,
        outcome: "rejected",
        preapprovalId: fakePreapprovalId,
      },
    });
  }

  redirect(`/sub/${sub.id}?t=${portalToken}`);
}
