import { describe, it, expect, beforeAll } from "vitest";
import {
  signSubscriptionToken,
  validateSubscriptionToken,
} from "./subscription-token";

beforeAll(() => {
  process.env.SUBSCRIPTION_TOKEN_SECRET = "test-secret";
});

const subId = "00000000-0000-0000-0000-000000000abc";

describe("subscription-token", () => {
  it("token recién firmado es válido", () => {
    const token = signSubscriptionToken(subId);
    expect(validateSubscriptionToken(subId, token)).toEqual({ ok: true });
  });

  it("rechaza token vacío", () => {
    expect(validateSubscriptionToken(subId, "")).toEqual({
      ok: false,
      reason: "missing",
    });
    expect(validateSubscriptionToken(subId, undefined)).toEqual({
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

  it("rechaza signature inválida (tampering)", () => {
    const token = signSubscriptionToken(subId);
    const [ts] = token.split(".");
    const tampered = `${ts}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
    const result = validateSubscriptionToken(subId, tampered);
    expect(result.ok).toBe(false);
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
