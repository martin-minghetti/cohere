import "server-only";
import crypto from "node:crypto";

const TOKEN_TTL_SECONDS = 30 * 60;

function getSecret(): string {
  const s = process.env.SUBSCRIPTION_TOKEN_SECRET;
  if (!s) throw new Error("SUBSCRIPTION_TOKEN_SECRET is not set");
  return s;
}

function hmac(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function signSubscriptionToken(subscriptionId: string, now = Date.now()): string {
  const ts = Math.floor(now / 1000);
  const sig = hmac(`${subscriptionId}.${ts}`, getSecret());
  return `${ts}.${sig}`;
}

export type SubscriptionTokenValidation =
  | { ok: true }
  | { ok: false; reason: "missing" | "malformed" | "expired" | "invalid" };

export function validateSubscriptionToken(
  subscriptionId: string,
  token: string | undefined | null,
  now = Date.now(),
): SubscriptionTokenValidation {
  if (!token) return { ok: false, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [tsStr, sig] = parts;
  const ts = Number(tsStr);
  if (!Number.isFinite(ts) || ts <= 0) return { ok: false, reason: "malformed" };

  const ageSeconds = Math.floor(now / 1000) - ts;
  if (ageSeconds < 0 || ageSeconds > TOKEN_TTL_SECONDS) {
    return { ok: false, reason: "expired" };
  }

  const expected = hmac(`${subscriptionId}.${tsStr}`, getSecret());
  const sigBuf = Buffer.from(sig, "base64url");
  const expectedBuf = Buffer.from(expected, "base64url");
  if (sigBuf.length !== expectedBuf.length) {
    return { ok: false, reason: "invalid" };
  }
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true };
}
