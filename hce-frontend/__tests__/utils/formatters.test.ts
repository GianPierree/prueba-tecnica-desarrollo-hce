import { formatCurrency, formatDate } from "@/lib/utils/formatters";

describe("formatCurrency", () => {
  it("formatea un número como moneda peruana (PEN)", () => {
    const result = formatCurrency(59.0);
    expect(result).toContain("59");
    expect(result).toContain("S/");
  });

  it("muestra siempre 2 decimales", () => {
    const result = formatCurrency(1);
    expect(result).toMatch(/1[.,]00/);
  });

  it("formatea correctamente valores con decimales", () => {
    const result = formatCurrency(0.68);
    expect(result).toContain("0");
    expect(result).toContain("68");
  });

  it("formatea correctamente valores grandes", () => {
    const result = formatCurrency(1000.5);
    expect(result).toContain("1");
    expect(result).toContain("000");
  });

  it("formatea el valor cero correctamente", () => {
    const result = formatCurrency(0);
    expect(result).toMatch(/0[.,]00/);
  });
});

describe("formatDate", () => {
  it("formatea una fecha ISO al formato dd/mm/yyyy", () => {
    const result = formatDate("2024-01-15T10:00:00Z");
    expect(result).toMatch(/15\/01\/2024/);
  });

  it("formatea correctamente el primer día del año", () => {
    const result = formatDate("2024-01-01T00:00:00Z");
    expect(result).toContain("2023");
    expect(result).toContain("31");
  });

  it("retorna un string no vacío para cualquier fecha válida", () => {
    const result = formatDate("2024-06-30T00:00:00Z");
    expect(result.length).toBeGreaterThan(0);
  });
});
