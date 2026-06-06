import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRedis } from "@/lib/redis";

/** Returns the last N date strings (YYYY-MM-DD), oldest first, including today. */
function lastNDates(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const VITAL_NAMES = ["LCP", "INP", "CLS", "FCP", "TTFB"] as const;

// ─── SEO audit thresholds ──────────────────────────────────────────────────
// Google typically truncates titles ~60 chars and descriptions ~160 chars.
// Thin content is a primary reason regulated-product pages get deindexed.
const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;
const CONTENT_THIN = 50; // words - below this is "thin content" (critical)
const CONTENT_SHALLOW = 150; // words - below this is "could be deeper" (warning)

const PENALTY: Record<Severity, number> = {
  critical: 22,
  warning: 9,
  info: 3,
};

type Severity = "critical" | "warning" | "info";

interface IssueMeta {
  severity: Severity;
  label: string;
  description: string;
  fix: string;
}

// Single source of truth for every check. Per-product issues reference these
// keys, and the "Issues" view groups affected products under the same entry.
const ISSUE_META: Record<string, IssueMeta> = {
  title_missing: {
    severity: "critical",
    label: "Missing page title",
    description: "The page has no title at all - neither a custom meta title nor a product name.",
    fix: "Add a product name (and ideally a custom Meta Title) on the product editor.",
  },
  title_short: {
    severity: "warning",
    label: "Title too short",
    description: `The title is under ${TITLE_MIN} characters, so it isn't using the space Google gives you.`,
    fix: `Expand the Meta Title to ${TITLE_MIN}-${TITLE_MAX} characters with the peptide name + a key benefit or descriptor.`,
  },
  title_long: {
    severity: "warning",
    label: "Title too long",
    description: `The title is over ${TITLE_MAX} characters and will be truncated in search results.`,
    fix: `Trim the Meta Title to under ${TITLE_MAX} characters so it shows in full.`,
  },
  no_meta_title: {
    severity: "info",
    label: "No custom meta title",
    description: "Falling back to the product name. A purpose-written title usually ranks and converts better.",
    fix: "Set a Meta Title that leads with the search term people actually type (e.g. the peptide name).",
  },
  desc_missing: {
    severity: "critical",
    label: "No description",
    description: "There's no meta description and no body description to fall back on - Google will invent a snippet.",
    fix: "Write a product description; the first ~160 characters become the search snippet.",
  },
  meta_desc_auto: {
    severity: "info",
    label: "Auto-generated meta description",
    description: "No custom meta description set - the first 160 chars of the body are used instead.",
    fix: "Write a dedicated Meta Description with a clear value proposition and the main keyword.",
  },
  desc_short: {
    severity: "warning",
    label: "Meta description too short",
    description: `The description is under ${DESC_MIN} characters, wasting snippet real estate.`,
    fix: `Aim for ${DESC_MIN}-${DESC_MAX} characters that summarise the product and invite a click.`,
  },
  desc_long: {
    severity: "warning",
    label: "Meta description too long",
    description: `The description is over ${DESC_MAX} characters and will be cut off.`,
    fix: `Keep the Meta Description under ${DESC_MAX} characters.`,
  },
  thin_content: {
    severity: "critical",
    label: "Thin content",
    description: `Under ${CONTENT_THIN} words of body content. This is the #1 reason peptide product pages get "Crawled - not indexed".`,
    fix: "Write a substantive description: what it is, research context, mechanism, the COA, and references.",
  },
  content_shallow: {
    severity: "warning",
    label: "Shallow content",
    description: `Between ${CONTENT_THIN} and ${CONTENT_SHALLOW} words. Indexable, but thin for a competitive YMYL niche.`,
    fix: `Build the description past ${CONTENT_SHALLOW} words with unique, genuinely useful detail.`,
  },
  no_image: {
    severity: "critical",
    label: "No product image",
    description: "The product has no images, hurting image search, click-through, and Product structured data.",
    fix: "Upload at least one product image (and ideally the COA image as a second shot).",
  },
  no_coa: {
    severity: "warning",
    label: "No COA document",
    description: "No Certificate of Analysis attached. COAs are a core trust/E-E-A-T signal for this category.",
    fix: "Attach a third-party COA from the COA Documents manager.",
  },
  no_reviews: {
    severity: "info",
    label: "No reviews",
    description: "No reviews means no star rich-results in search, which lowers click-through.",
    fix: "Request reviews from past buyers to unlock AggregateRating stars in search.",
  },
  no_sku: {
    severity: "info",
    label: "No SKU",
    description: "No SKU set - the structured data falls back to the slug.",
    fix: "Add a SKU on the product editor for cleaner Product structured data.",
  },
  no_purity: {
    severity: "info",
    label: "No purity value",
    description: "No purity specified - a useful structured-data property and trust signal for peptides.",
    fix: "Set the purity (e.g. \"99%+\") on the product editor.",
  },
  no_research_desc: {
    severity: "info",
    label: "No research description",
    description: "The extra research-description field is empty - a missed chance for unique, indexable content.",
    fix: "Add a research summary to deepen the page and target informational searches.",
  },
  dup_title: {
    severity: "warning",
    label: "Duplicate title",
    description: "Another product uses the same effective title, causing keyword cannibalisation.",
    fix: "Make each Meta Title unique so pages don't compete with each other.",
  },
  dup_desc: {
    severity: "warning",
    label: "Duplicate meta description",
    description: "Another product uses the same meta description verbatim.",
    fix: "Write a unique Meta Description for each product.",
  },
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function gradeFor(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  research_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  purity: string | null;
  images: string[] | null;
  active: boolean;
  stock_quantity: number | null;
  review_count: number | null;
  category_id: string | null;
  variants?: { stock_quantity: number | null }[];
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const [productsRes, coaRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, slug, sku, description, research_description, meta_title, meta_description, purity, images, active, stock_quantity, review_count, category_id, variants:product_variants(stock_quantity)"
      )
      .eq("active", true),
    supabase.from("coa_documents").select("product_id"),
  ]);

  const products = (productsRes.data ?? []) as ProductRow[];

  // COA counts per product
  const coaCounts = new Map<string, number>();
  for (const row of coaRes.data ?? []) {
    const pid = (row as { product_id: string }).product_id;
    coaCounts.set(pid, (coaCounts.get(pid) ?? 0) + 1);
  }

  // Detect duplicates: effective title + meta description across the catalog
  const titleSeen = new Map<string, number>();
  const descSeen = new Map<string, number>();
  for (const p of products) {
    const t = (p.meta_title || p.name || "").trim().toLowerCase();
    if (t) titleSeen.set(t, (titleSeen.get(t) ?? 0) + 1);
    if (p.meta_description) {
      const d = p.meta_description.trim().toLowerCase();
      descSeen.set(d, (descSeen.get(d) ?? 0) + 1);
    }
  }

  // ─── Real field data from Redis (graceful when not configured) ────────────
  const redis = getRedis();
  const redisConfigured = !!redis;
  const pageViews = new Map<string, number>();
  let trafficSources: { channel: string; count: number }[] = [];
  let trafficSeries: { date: string; organic: number; social: number; direct: number; referral: number }[] = [];
  let webVitals: { name: string; avg: number; goodPct: number; rating: "good" | "ni" | "poor"; samples: number }[] = [];
  let scoreTrend: { date: string; score: number }[] = [];

  if (redis) {
    const dates14 = lastNDates(14);
    const dates30 = lastNDates(30);
    try {
      const [pvHashes, srcHashes, wvHashes, snaps] = await Promise.all([
        Promise.all(dates14.map((d) => redis.hgetall<Record<string, string>>(`pageviews:${d}`))),
        Promise.all(dates14.map((d) => redis.hgetall<Record<string, string>>(`sources:${d}`))),
        Promise.all(dates14.map((d) => redis.hgetall<Record<string, string>>(`webvitals:${d}`))),
        Promise.all(dates30.map((d) => redis.get<{ score: number }>(`seo:snapshot:${d}`))),
      ]);

      // Pageviews per path (14-day total)
      for (const h of pvHashes) {
        if (!h) continue;
        for (const [page, v] of Object.entries(h)) {
          pageViews.set(page, (pageViews.get(page) ?? 0) + Number(v));
        }
      }

      // Traffic sources - totals + daily series
      const srcMap = new Map<string, number>();
      trafficSeries = dates14.map((d, i) => {
        const h = srcHashes[i] || {};
        const get = (k: string) => Number(h[k] ?? 0);
        for (const [ch, v] of Object.entries(h)) srcMap.set(ch, (srcMap.get(ch) ?? 0) + Number(v));
        return {
          date: d,
          organic: get("Organic Search"),
          social: get("Social"),
          direct: get("Direct"),
          referral: get("Referral") + get("Other"),
        };
      });
      trafficSources = Array.from(srcMap.entries())
        .map(([channel, count]) => ({ channel, count }))
        .sort((a, b) => b.count - a.count);

      // Core Web Vitals aggregates
      const agg: Record<string, { count: number; sum: number; good: number }> = {};
      for (const h of wvHashes) {
        if (!h) continue;
        for (const m of VITAL_NAMES) {
          const c = Number(h[`${m}_count`] ?? 0);
          if (!c) continue;
          if (!agg[m]) agg[m] = { count: 0, sum: 0, good: 0 };
          agg[m].count += c;
          agg[m].sum += Number(h[`${m}_sum`] ?? 0);
          agg[m].good += Number(h[`${m}_good`] ?? 0);
        }
      }
      webVitals = VITAL_NAMES.filter((m) => agg[m]).map((m) => {
        const a = agg[m];
        const avgRaw = a.count ? a.sum / a.count : 0;
        const avg = m === "CLS" ? Math.round(avgRaw * 1000) / 1000 : Math.round(avgRaw);
        const goodPct = a.count ? Math.round((a.good / a.count) * 100) : 0;
        const rating: "good" | "ni" | "poor" = goodPct >= 75 ? "good" : goodPct >= 50 ? "ni" : "poor";
        return { name: m, avg, goodPct, rating, samples: a.count };
      });

      // SEO score trend (last 30 days of snapshots)
      scoreTrend = dates30
        .map((d, i) => ({ date: d, score: snaps[i]?.score ?? null }))
        .filter((x): x is { date: string; score: number } => x.score != null);
    } catch {
      // Redis hiccup - fall back to on-site-only audit
    }
  }

  // ─── Audit each product ──────────────────────────────────────────────────
  const audited = products.map((p) => {
    const issues: { id: string; severity: Severity }[] = [];
    const add = (id: string) => issues.push({ id, severity: ISSUE_META[id].severity });

    const plainDesc = stripHtml(p.description || "");
    const words = wordCount(plainDesc);
    const effectiveTitle = (p.meta_title || p.name || "").trim();
    const titleLength = effectiveTitle.length;
    const effectiveDescription = (p.meta_description || plainDesc.slice(0, 160) || "").trim();
    const descriptionLength = effectiveDescription.length;
    const imageCount = (p.images ?? []).filter(Boolean).length;
    const coaCount = coaCounts.get(p.id) ?? 0;
    const reviewCount = p.review_count ?? 0;

    const hasVariants = (p.variants?.length ?? 0) > 0;
    const inStock = hasVariants
      ? p.variants!.some((v) => (v.stock_quantity ?? 0) > 0)
      : (p.stock_quantity ?? 0) > 0;

    // Title
    if (!effectiveTitle) add("title_missing");
    else if (titleLength < TITLE_MIN) add("title_short");
    else if (titleLength > TITLE_MAX) add("title_long");
    if (!p.meta_title) add("no_meta_title");

    // Description (meta snippet)
    if (!effectiveDescription) {
      add("desc_missing");
    } else {
      if (!p.meta_description) add("meta_desc_auto");
      if (descriptionLength < DESC_MIN) add("desc_short");
      else if (descriptionLength > DESC_MAX) add("desc_long");
    }

    // Body content depth
    if (words < CONTENT_THIN) add("thin_content");
    else if (words < CONTENT_SHALLOW) add("content_shallow");

    // Media & trust
    if (imageCount === 0) add("no_image");
    if (coaCount === 0) add("no_coa");
    if (reviewCount === 0) add("no_reviews");

    // Structured-data completeness
    if (!p.sku) add("no_sku");
    if (!p.purity) add("no_purity");
    if (!p.research_description) add("no_research_desc");

    // Duplicates
    const tKey = effectiveTitle.toLowerCase();
    if (tKey && (titleSeen.get(tKey) ?? 0) > 1) add("dup_title");
    if (p.meta_description) {
      const dKey = p.meta_description.trim().toLowerCase();
      if ((descSeen.get(dKey) ?? 0) > 1) add("dup_desc");
    }

    let score = 100;
    for (const i of issues) score -= PENALTY[i.severity];
    score = Math.max(0, Math.min(100, score));

    const views = pageViews.get(`/shop/${p.slug}`) ?? 0;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      url: `/shop/${p.slug}`,
      adminUrl: `/admin/products/${p.id}`,
      score,
      grade: gradeFor(score),
      views,
      // Impact = how much a fix matters: low score on a high-traffic page first.
      impact: Math.round((100 - score) * Math.log10(views + 10)),
      effectiveTitle,
      titleLength,
      effectiveDescription,
      descriptionLength,
      wordCount: words,
      imageCount,
      coaCount,
      reviewCount,
      hasMetaTitle: !!p.meta_title,
      hasMetaDescription: !!p.meta_description,
      hasPurity: !!p.purity,
      hasSku: !!p.sku,
      hasCategory: !!p.category_id,
      inStock,
      issues: issues.map((i) => ({
        id: i.id,
        severity: i.severity,
        label: ISSUE_META[i.id].label,
        detail: ISSUE_META[i.id].description,
        fix: ISSUE_META[i.id].fix,
      })),
    };
  });

  audited.sort((a, b) => a.score - b.score); // worst first

  // ─── Aggregate issue groups ───────────────────────────────────────────────
  const groupMap = new Map<
    string,
    { id: string; severity: Severity; label: string; description: string; fix: string; products: { id: string; name: string; slug: string }[] }
  >();
  for (const p of audited) {
    for (const issue of p.issues) {
      let g = groupMap.get(issue.id);
      if (!g) {
        const meta = ISSUE_META[issue.id];
        g = { id: issue.id, severity: meta.severity, label: meta.label, description: meta.description, fix: meta.fix, products: [] };
        groupMap.set(issue.id, g);
      }
      g.products.push({ id: p.id, name: p.name, slug: p.slug });
    }
  }
  const severityRank: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  const issueGroups = Array.from(groupMap.values()).sort((a, b) => {
    if (severityRank[a.severity] !== severityRank[b.severity]) return severityRank[a.severity] - severityRank[b.severity];
    return b.products.length - a.products.length;
  });

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  let criticalCount = 0, warningCount = 0, infoCount = 0;
  for (const p of audited) {
    for (const i of p.issues) {
      if (i.severity === "critical") criticalCount++;
      else if (i.severity === "warning") warningCount++;
      else infoCount++;
    }
  }
  const count = (id: string) => groupMap.get(id)?.products.length ?? 0;
  const avgProductScore = audited.length
    ? Math.round(audited.reduce((s, p) => s + p.score, 0) / audited.length)
    : 0;
  const avgWordCount = audited.length
    ? Math.round(audited.reduce((s, p) => s + p.wordCount, 0) / audited.length)
    : 0;

  // ─── Content depth distribution ───────────────────────────────────────────
  const buckets = [
    { bucket: "0-49", min: 0, max: 49, count: 0 },
    { bucket: "50-149", min: 50, max: 149, count: 0 },
    { bucket: "150-299", min: 150, max: 299, count: 0 },
    { bucket: "300+", min: 300, max: Infinity, count: 0 },
  ];
  for (const p of audited) {
    const b = buckets.find((b) => p.wordCount >= b.min && p.wordCount <= b.max);
    if (b) b.count++;
  }
  const contentDistribution = buckets.map(({ bucket, count }) => ({ bucket, count }));

  // ─── Site-wide checks (config & infrastructure) ──────────────────────────
  const siteChecks: { id: string; label: string; status: "pass" | "warn" | "fail"; detail: string }[] = [
    {
      id: "site_url",
      label: "Canonical site URL configured",
      status: process.env.NEXT_PUBLIC_SITE_URL ? "pass" : "warn",
      detail: process.env.NEXT_PUBLIC_SITE_URL
        ? `Using ${process.env.NEXT_PUBLIC_SITE_URL}`
        : "NEXT_PUBLIC_SITE_URL not set - falling back to https://jartides.ca. Set it to guarantee correct canonical URLs.",
    },
    {
      id: "ga",
      label: "Google Analytics connected",
      status: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? "pass" : "fail",
      detail: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
        ? "GA measurement ID is set."
        : "NEXT_PUBLIC_GA_MEASUREMENT_ID is missing - you have no traffic analytics.",
    },
    {
      id: "service_role",
      label: "Sitemap can read products",
      status: process.env.SUPABASE_SERVICE_ROLE_KEY ? "pass" : "fail",
      detail: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? "Service role key present - sitemap.xml includes all active products."
        : "SUPABASE_SERVICE_ROLE_KEY missing - sitemap.xml will NOT list product pages, so Google may not discover them.",
    },
    {
      id: "sitemap",
      label: "Sitemap & robots.txt present",
      status: "pass",
      detail: "/sitemap.xml and /robots.txt are generated and robots references the sitemap.",
    },
    {
      id: "structured_data",
      label: "Structured data implemented",
      status: "pass",
      detail: "Organization, WebSite, Product, Offer, and BreadcrumbList JSON-LD are present.",
    },
    {
      id: "no_image_products",
      label: "All products have images",
      status: count("no_image") === 0 ? "pass" : "fail",
      detail: count("no_image") === 0
        ? "Every active product has at least one image."
        : `${count("no_image")} active product(s) have no image.`,
    },
    {
      id: "no_thin_content",
      label: "No thin-content product pages",
      status: count("thin_content") === 0 ? "pass" : count("thin_content") <= 2 ? "warn" : "fail",
      detail: count("thin_content") === 0
        ? "No active product is under the thin-content threshold."
        : `${count("thin_content")} active product(s) have under ${CONTENT_THIN} words - high deindex risk.`,
    },
  ];

  // ─── Overall score: 80% avg product quality + 20% site config health ──────
  const siteScorePerCheck: number[] = siteChecks.map((c) => (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0));
  const siteHealth = siteChecks.length
    ? Math.round((siteScorePerCheck.reduce((a, b) => a + b, 0) / siteChecks.length) * 100)
    : 100;
  const overallScore = Math.round(avgProductScore * 0.8 + siteHealth * 0.2);

  // Persist today's snapshot so the score can be tracked over time, and make
  // sure today's point is reflected in the trend returned right now.
  if (redis) {
    const today = lastNDates(1)[0];
    try {
      await redis.set(
        `seo:snapshot:${today}`,
        { score: overallScore, critical: criticalCount, warning: warningCount, info: infoCount, avgWord: avgWordCount },
        { ex: 60 * 60 * 24 * 180 }
      );
    } catch {
      // best-effort
    }
    scoreTrend = scoreTrend.filter((s) => s.date !== today);
    scoreTrend.push({ date: today, score: overallScore });
  }

  return NextResponse.json({
    overallScore,
    grade: gradeFor(overallScore),
    siteHealth,
    redisConfigured,
    trafficSources,
    trafficSeries,
    webVitals,
    scoreTrend,
    productCount: products.length,
    kpis: {
      criticalCount,
      warningCount,
      infoCount,
      avgProductScore,
      avgWordCount,
      productsWithoutMetaTitle: count("no_meta_title"),
      productsWithoutMetaDescription: count("meta_desc_auto") + count("desc_missing"),
      thinContentCount: count("thin_content"),
      productsWithoutImages: count("no_image"),
      productsWithoutCoa: count("no_coa"),
      productsWithoutReviews: count("no_reviews"),
      duplicateTitleCount: count("dup_title"),
      duplicateDescriptionCount: count("dup_desc"),
    },
    siteChecks,
    issueGroups,
    products: audited,
    contentDistribution,
  });
}
