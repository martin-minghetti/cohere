import { describe, it, expect } from "vitest";
import { formatPriceARS, formatDiscipline } from "./format";

describe("formatPriceARS", () => {
  it("formatea ARS sin decimales", () => {
    const r = formatPriceARS(32000);
    expect(r).toMatch(/32\.000/);
    expect(r).toMatch(/\$/);
  });

  it("redondea sin decimales", () => {
    expect(formatPriceARS(99999.99)).not.toMatch(/,99/);
  });

  it("maneja cero", () => {
    expect(formatPriceARS(0)).toMatch(/0/);
  });

  it("formatea millones", () => {
    expect(formatPriceARS(2_500_000)).toMatch(/2\.500\.000/);
  });
});

describe("formatDiscipline", () => {
  it("traduce yoga", () => {
    expect(formatDiscipline("yoga")).toBe("Yoga");
  });
  it("traduce pilates", () => {
    expect(formatDiscipline("pilates")).toBe("Pilates");
  });
  it("traduce coaching", () => {
    expect(formatDiscipline("coaching")).toBe("Coaching");
  });
  it("devuelve la disciplina cruda si es desconocida", () => {
    expect(formatDiscipline("unknown")).toBe("unknown");
  });
});
