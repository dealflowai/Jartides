import { describe, it, expect } from "vitest";
import {
  generateOrderNumber,
  formatPrice,
  calculateSavings,
  subscriptionPrice,
} from "@/lib/utils";

describe("generateOrderNumber", () => {
  it("starts with JRT- prefix", () => {
    const num = generateOrderNumber();
    expect(num).toMatch(/^JRT-/);
  });

  it("is exactly 10 characters (JRT- + 6 chars)", () => {
    expect(generateOrderNumber()).toHaveLength(10);
  });

  it("uses only allowed characters after prefix", () => {
    const allowed = /^JRT-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
    for (let i = 0; i < 50; i++) {
      expect(generateOrderNumber()).toMatch(allowed);
    }
  });

  it("generates unique values", () => {
    const set = new Set(Array.from({ length: 100 }, () => generateOrderNumber()));
    // With 34^6 possible values, 100 should all be unique
    expect(set.size).toBe(100);
  });
});

describe("formatPrice", () => {
  it("formats a whole number price in CAD", () => {
    const result = formatPrice(50);
    expect(result).toContain("50");
    expect(result).toContain("CAD");
  });

  it("formats a decimal price", () => {
    const result = formatPrice(29.99);
    expect(result).toContain("29.99");
  });

  it("uses CAD by default", () => {
    expect(formatPrice(10)).toContain("CAD");
  });

  it("supports custom currency", () => {
    const result = formatPrice(10, "USD");
    expect(result).toContain("USD");
  });
});

describe("calculateSavings", () => {
  it("returns percentage saved", () => {
    expect(calculateSavings(80, 100)).toBe(20);
  });

  it("returns null when no original price", () => {
    expect(calculateSavings(80, null)).toBeNull();
  });

  it("returns null when original is not higher", () => {
    expect(calculateSavings(100, 80)).toBeNull();
    expect(calculateSavings(100, 100)).toBeNull();
  });

  it("rounds to whole percentage", () => {
    expect(calculateSavings(33, 100)).toBe(67);
  });
});

describe("subscriptionPrice", () => {
  it("applies 15% discount", () => {
    expect(subscriptionPrice(100)).toBe(85);
  });

  it("rounds to 2 decimal places", () => {
    expect(subscriptionPrice(33.33)).toBe(28.33);
  });
});
