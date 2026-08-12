import { describe, it, expect } from "vitest";
import {
  DEFAULT_FEATURED_LIMIT,
  MAX_PICKED_PRODUCTS,
  defaultLayout,
  makeSection,
  normalizeLayout,
  sanitizeSections,
} from "@/lib/sections/schema";

const ID_A = "11111111-1111-4111-8111-111111111111";
const ID_B = "22222222-2222-4222-8222-222222222222";
const ID_C = "33333333-3333-4333-8333-333333333333";

function featuredProps(raw: unknown): Record<string, unknown> {
  const [section] = sanitizeSections([
    { id: "builtin-featured_products", type: "featured_products", props: raw },
  ]);
  return section.props;
}

describe("featured products section props", () => {
  it("keeps hand-picked ids in the admin's exact order", () => {
    expect(featuredProps({ productIds: [ID_C, ID_A, ID_B] }).productIds).toEqual([
      ID_C,
      ID_A,
      ID_B,
    ]);
  });

  it("drops non-uuid ids so the product lookup can't blow up", () => {
    expect(
      featuredProps({ productIds: [ID_A, "not-a-uuid", 42, null, ID_B] })
        .productIds
    ).toEqual([ID_A, ID_B]);
  });

  it("drops duplicates and caps the list", () => {
    expect(featuredProps({ productIds: [ID_A, ID_A, ID_B] }).productIds).toEqual([
      ID_A,
      ID_B,
    ]);

    const many = Array.from(
      { length: MAX_PICKED_PRODUCTS + 10 },
      (_, i) => `${i.toString(16).padStart(8, "0")}-1111-4111-8111-111111111111`
    );
    expect(
      (featuredProps({ productIds: many }).productIds as string[]).length
    ).toBe(MAX_PICKED_PRODUCTS);
  });

  it("falls back to an empty pick list for legacy layouts saved without props", () => {
    expect(featuredProps(undefined)).toEqual({
      productIds: [],
      limit: DEFAULT_FEATURED_LIMIT,
    });
  });

  it("clamps the automatic limit to a sane range", () => {
    expect(featuredProps({ limit: 0 }).limit).toBe(1);
    expect(featuredProps({ limit: 999 }).limit).toBe(MAX_PICKED_PRODUCTS);
    expect(featuredProps({ limit: "8" }).limit).toBe(8);
    expect(featuredProps({ limit: "abc" }).limit).toBe(DEFAULT_FEATURED_LIMIT);
  });
});

describe("layout defaults", () => {
  it("gives the featured section its default props out of the box", () => {
    const section = defaultLayout("home").find(
      (s) => s.type === "featured_products"
    );
    expect(section?.props).toEqual({
      productIds: [],
      limit: DEFAULT_FEATURED_LIMIT,
    });
  });

  it("hands back an independent copy each call", () => {
    const first = defaultLayout("home");
    (first[0].props as Record<string, unknown>).productIds = [ID_A];
    const second = defaultLayout("home");
    expect(second[0].props).not.toHaveProperty("productIds", [ID_A]);
  });

  it("preserves picked products when a new built-in section is inserted", () => {
    const saved = [
      makeSection("hero"),
      { ...makeSection("featured_products"), props: { productIds: [ID_A], limit: 6 } },
    ];
    const normalized = normalizeLayout("home", saved);
    const featured = normalized.find((s) => s.type === "featured_products");

    expect(featured?.props.productIds).toEqual([ID_A]);
    expect(normalized.length).toBeGreaterThan(saved.length);
  });
});
