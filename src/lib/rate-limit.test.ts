import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, _resetForTests } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    _resetForTests();
  });

  it("permite hasta el límite", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("ip-1", 5, 60).ok).toBe(true);
    }
  });

  it("bloquea al exceder el límite", () => {
    for (let i = 0; i < 5; i++) rateLimit("ip-2", 5, 60);
    const r = rateLimit("ip-2", 5, 60);
    expect(r.ok).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("buckets son por key (IPs distintas no se afectan)", () => {
    for (let i = 0; i < 5; i++) rateLimit("ip-A", 5, 60);
    expect(rateLimit("ip-B", 5, 60).ok).toBe(true);
  });

  it("resetea cuando pasa la ventana", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) rateLimit("ip-3", 5, 60, t0);
    expect(rateLimit("ip-3", 5, 60, t0).ok).toBe(false);
    expect(rateLimit("ip-3", 5, 60, t0 + 61_000).ok).toBe(true);
  });

  it("remaining count correcto", () => {
    expect(rateLimit("ip-4", 3, 60).remaining).toBe(2);
    expect(rateLimit("ip-4", 3, 60).remaining).toBe(1);
    expect(rateLimit("ip-4", 3, 60).remaining).toBe(0);
  });
});
