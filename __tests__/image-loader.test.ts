import { describe, it, expect } from "vitest";
import loader from "@/lib/image-loader";

const OBJECT_URL =
  "https://oiaehuxbflhiwolrobxo.supabase.co/storage/v1/object/public/product-images/1775151679009-9la4ha9blpu.png";

describe("supabaseImageLoader", () => {
  it("rewrites a public Supabase object URL to the render endpoint", () => {
    const url = new URL(loader({ src: OBJECT_URL, width: 640, quality: 75 }));
    expect(url.pathname).toBe(
      "/storage/v1/render/image/public/product-images/1775151679009-9la4ha9blpu.png"
    );
    expect(url.searchParams.get("width")).toBe("640");
    expect(url.searchParams.get("quality")).toBe("75");
  });

  it("keeps the original host so the CSP img-src rule still matches", () => {
    expect(new URL(loader({ src: OBJECT_URL, width: 640 })).host).toBe(
      "oiaehuxbflhiwolrobxo.supabase.co"
    );
  });

  it("defaults quality to 75 when Next does not pass one", () => {
    expect(new URL(loader({ src: OBJECT_URL, width: 320 })).searchParams.get("quality")).toBe("75");
  });

  it("clamps width and quality into the range Supabase accepts", () => {
    const wide = new URL(loader({ src: OBJECT_URL, width: 3840, quality: 100 }));
    expect(wide.searchParams.get("width")).toBe("2500");

    const low = new URL(loader({ src: OBJECT_URL, width: 0, quality: 1 }));
    expect(low.searchParams.get("width")).toBe("1");
    expect(low.searchParams.get("quality")).toBe("20");
  });

  it("does not stack params when handed an already-transformed URL", () => {
    const once = loader({ src: OBJECT_URL, width: 640 });
    const twice = loader({ src: once, width: 320 });
    expect(twice.match(/width=/g)).toHaveLength(1);
    expect(twice).toContain("width=320");
  });

  it("passes through local, API and data sources untouched", () => {
    for (const src of [
      "/images/hero-banner.webp",
      "/images/logo.webp",
      "/api/coa/some-batch.pdf",
      "data:image/png;base64,iVBORw0KGgo=",
    ]) {
      expect(loader({ src, width: 640, quality: 75 })).toBe(src);
    }
  });
});
