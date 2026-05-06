import { describe, it, expect, beforeAll } from "vitest";
import {
  signSubscriptionToken,
  validateSubscriptionToken,
  signPortalToken,
  validatePortalToken,
} from "./subscription-token";

beforeAll(() => {
  process.env.SUBSCRIPTION_TOKEN_SECRET = "test-secret";
});

const subId = "00000000-0000-0000-0000-000000000abc";

describe("subscription-token (checkout kind)", () => {
  it("token recién firmado es válido", () => {
    const token = signSubscriptionToken(subId);
    expect(validateSubscriptionToken(subId, token)).toEqual({ ok: true });
  });

  it("rechaza token vacío", () => {
    expect(validateSubscriptionToken(subId, "")).toEqual({
      ok: false,
      reason: "missing",
    });
  });

  it("rechaza token malformed", () => {
    expect(validateSubscriptionToken(subId, "garbage")).toEqual({
      ok: false,
      reason: "malformed",
    });
  });

  it("rechaza token de otra subscription (cross-id)", () => {
    const token = signSubscriptionToken(subId);
    const otherId = "11111111-1111-1111-1111-111111111111";
    expect(validateSubscriptionToken(otherId, token)).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("rechaza token expirado (>30min)", () => {
    const oldNow = Date.now() - 31 * 60 * 1000;
    const token = signSubscriptionToken(subId, oldNow);
    expect(validateSubscriptionToken(subId, token)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("acepta token a 29 min", () => {
    const justBefore = Date.now() - 29 * 60 * 1000;
    const token = signSubscriptionToken(subId, justBefore);
    expect(validateSubscriptionToken(subId, token)).toEqual({ ok: true });
  });
});

describe("subscription-token (portal kind)", () => {
  it("portal token recién firmado es válido", () => {
    const token = signPortalToken(subId);
    expect(validatePortalToken(subId, token)).toEqual({ ok: true });
  });

  it("portal token TTL extendido (acepta 89 días)", () => {
    const old = Date.now() - 89 * 24 * 60 * 60 * 1000;
    const token = signPortalToken(subId, old);
    expect(validatePortalToken(subId, token)).toEqual({ ok: true });
  });

  it("portal token rechaza después de 91 días", () => {
    const old = Date.now() - 91 * 24 * 60 * 60 * 1000;
    const token = signPortalToken(subId, old);
    expect(validatePortalToken(subId, token)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("checkout token NO sirve para portal (kind separado)", () => {
    const checkout = signSubscriptionToken(subId);
    const result = validatePortalToken(subId, checkout);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid");
  });

  it("portal token NO sirve para checkout (kind separado)", () => {
    const portal = signPortalToken(subId);
    const result = validateSubscriptionToken(subId, portal);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid");
  });
});
