import "server-only";
import crypto from "node:crypto";

const CHECKOUT_TTL_SECONDS = 30 * 60;
const PORTAL_TTL_SECONDS = 90 * 24 * 60 * 60;

type TokenKind = "checkout" | "portal";

function getSecret(): string {
  const s = process.env.SUBSCRIPTION_TOKEN_SECRET;
  if (!s) throw new Error("SUBSCRIPTION_TOKEN_SECRET is not set");
  return s;
}

function hmac(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function signWithKind(
  kind: TokenKind,
  subscriptionId: string,
  now: number,
): string {
  const ts = Math.floor(now / 1000);
  const sig = hmac(`${kind}.${subscriptionId}.${ts}`, getSecret());
  return `${ts}.${sig}`;
}

export type TokenValidation =
  | { ok: true }
  | { ok: false; reason: "missing" | "malformed" | "expired" | "invalid" };

function validateWithKind(
  kind: TokenKind,
  ttlSeconds: number,
  subscriptionId: string,
  token: string | undefined | null,
  now: number,
): TokenValidation {
  if (!token) return { ok: false, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [tsStr, sig] = parts;
  const ts = Number(tsStr);
  if (!Number.isFinite(ts) || ts <= 0) return { ok: false, reason: "malformed" };

  const ageSeconds = Math.floor(now / 1000) - ts;
  if (ageSeconds < 0 || ageSeconds > ttlSeconds) {
    return { ok: false, reason: "expired" };
  }

  const expected = hmac(`${kind}.${subscriptionId}.${tsStr}`, getSecret());
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

export function signSubscriptionToken(
  subscriptionId: string,
  now = Date.now(),
): string {
  return signWithKind("checkout", subscriptionId, now);
}

export function validateSubscriptionToken(
  subscriptionId: string,
  token: string | undefined | null,
  now = Date.now(),
): TokenValidation {
  return validateWithKind(
    "checkout",
    CHECKOUT_TTL_SECONDS,
    subscriptionId,
    token,
    now,
  );
}

export function signPortalToken(
  subscriptionId: string,
  now = Date.now(),
): string {
  return signWithKind("portal", subscriptionId, now);
}

export function validatePortalToken(
  subscriptionId: string,
  token: string | undefined | null,
  now = Date.now(),
): TokenValidation {
  return validateWithKind(
    "portal",
    PORTAL_TTL_SECONDS,
    subscriptionId,
    token,
    now,
  );
}
