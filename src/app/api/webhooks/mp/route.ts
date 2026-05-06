import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { mpPayment, mpPreapproval, validateMpSignature } from "@/lib/mp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PREAPPROVAL_STATUS_TO_SUBSCRIPTION: Record<
  string,
  "active" | "paused" | "cancelled" | "failed" | "pending"
> = {
  authorized: "active",
  paused: "paused",
  cancelled: "cancelled",
  finished: "cancelled",
  pending: "pending",
};

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.MP_WEBHOOK_SECRET;

  let body: {
    type?: string;
    action?: string;
    data?: { id?: string | number };
  } = {};
  try {
    body = await req.json();
  } catch {
    // MP sometimes sends empty pings
  }

  const dataIdRaw =
    url.searchParams.get("data.id") ??
    (body?.data?.id != null ? String(body.data.id) : null);
  const type = url.searchParams.get("type") ?? body?.type ?? null;
  const action = body?.action ?? null;

  if (!secret) {
    console.warn(
      "MP_WEBHOOK_SECRET not set; webhook is no-op (expected when PAYMENT_MODE=simulated)",
    );
    return NextResponse.json({ ignored: true, reason: "not configured" });
  }

  const validation = validateMpSignature({
    headers: {
      signature: req.headers.get("x-signature"),
      requestId: req.headers.get("x-request-id"),
    },
    dataId: dataIdRaw,
    secret,
  });

  if (!validation.ok) {
    console.warn("MP webhook signature invalid:", validation.reason);
    return NextResponse.json({ error: validation.reason }, { status: 401 });
  }

  const dataId = validation.dataId;

  if (type === "subscription_preapproval" || action?.includes("preapproval")) {
    return handlePreapproval(dataId);
  }

  if (
    type === "subscription_authorized_payment" ||
    type === "payment" ||
    action?.includes("payment")
  ) {
    return handlePayment(dataId);
  }

  return NextResponse.json({ ignored: true, reason: `type=${type}` });
}

async function handlePreapproval(preapprovalId: string) {
  let preapproval;
  try {
    const client = mpPreapproval.client();
    preapproval = await client.get({ id: preapprovalId });
  } catch (err) {
    console.error("MP preapproval fetch failed:", err);
    return NextResponse.json(
      { error: "preapproval fetch failed" },
      { status: 502 },
    );
  }

  const externalRef = preapproval.external_reference;
  if (!externalRef) {
    return NextResponse.json({
      ignored: true,
      reason: "no external_reference",
    });
  }

  const sub = await db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.id, externalRef),
  });
  if (!sub) {
    return NextResponse.json(
      { error: "subscription not found" },
      { status: 404 },
    );
  }

  const newStatus =
    PREAPPROVAL_STATUS_TO_SUBSCRIPTION[preapproval.status ?? "pending"] ??
    "pending";

  if (sub.status === newStatus && sub.mpPreapprovalId === preapprovalId) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const updates: Partial<typeof schema.subscriptions.$inferInsert> = {
    status: newStatus,
    mpPreapprovalId: preapprovalId,
  };

  if (newStatus === "active" && !sub.activatedAt) {
    updates.activatedAt = new Date();
    if (preapproval.next_payment_date) {
      updates.nextBillingDate = preapproval.next_payment_date.slice(0, 10);
    }
  }
  if (newStatus === "cancelled" && !sub.cancelledAt) {
    updates.cancelledAt = new Date();
  }

  await db
    .update(schema.subscriptions)
    .set(updates)
    .where(eq(schema.subscriptions.id, sub.id));

  await db.insert(schema.paymentEvents).values({
    subscriptionId: sub.id,
    eventType: "subscription_preapproval",
    mpStatus: preapproval.status,
    rawPayload: preapproval as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ ok: true, status: newStatus });
}

async function handlePayment(paymentId: string) {
  let payment;
  try {
    const client = mpPayment.client();
    payment = await client.get({ id: paymentId });
  } catch (err) {
    console.error("MP payment fetch failed:", err);
    return NextResponse.json(
      { error: "payment fetch failed" },
      { status: 502 },
    );
  }

  const externalRef = payment.external_reference;
  if (!externalRef) {
    return NextResponse.json({
      ignored: true,
      reason: "no external_reference",
    });
  }

  const sub = await db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.id, externalRef),
  });
  if (!sub) {
    return NextResponse.json(
      { error: "subscription not found" },
      { status: 404 },
    );
  }

  await db.insert(schema.paymentEvents).values({
    subscriptionId: sub.id,
    eventType: "payment",
    mpPaymentId: String(paymentId),
    mpStatus: payment.status,
    amount: payment.transaction_amount
      ? Math.round(payment.transaction_amount)
      : null,
    rawPayload: payment as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ ok: true, payment_status: payment.status });
}

export async function GET() {
  return NextResponse.json({ ok: true, ping: "cohere-mp-webhook" });
}
