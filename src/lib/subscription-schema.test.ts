import { describe, it, expect } from "vitest";
import { subscriptionInputSchema } from "./subscription-schema";

const valid = {
  proSlug: "ana-pilar",
  planSlug: "ilimitado",
  subscriberName: "Lucía Test",
  subscriberEmail: "lucia@example.com",
};

describe("subscriptionInputSchema", () => {
  it("acepta input válido", () => {
    const r = subscriptionInputSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const r = subscriptionInputSchema.safeParse({
      ...valid,
      subscriberEmail: "no-es-email",
    });
    expect(r.success).toBe(false);
  });

  it("rechaza nombre demasiado corto", () => {
    const r = subscriptionInputSchema.safeParse({
      ...valid,
      subscriberName: "A",
    });
    expect(r.success).toBe(false);
  });

  it("rechaza proSlug vacío", () => {
    const r = subscriptionInputSchema.safeParse({ ...valid, proSlug: "" });
    expect(r.success).toBe(false);
  });

  it("rechaza planSlug vacío", () => {
    const r = subscriptionInputSchema.safeParse({ ...valid, planSlug: "" });
    expect(r.success).toBe(false);
  });
});
