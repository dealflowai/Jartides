/**
 * Page Sections — shared schema.
 *
 * This is the single source of truth for the homepage / key-page "section
 * builder". It is intentionally PURE TypeScript (no React, no server imports)
 * so it can be used by:
 *   - the public renderer (server component)
 *   - the admin manager (client component)
 *   - the API route (validation / sanitisation)
 *
 * Layouts are stored in the existing `site_settings` table, one jsonb row per
 * page, under the key `page_sections_<page>` (e.g. `page_sections_home`).
 */

/* ------------------------------------------------------------------ */
/*  Pages                                                              */
/* ------------------------------------------------------------------ */
export const PAGE_KEYS = ["home", "shop", "contact"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_META: Record<
  PageKey,
  { label: string; path: string; note: string }
> = {
  home: {
    label: "Homepage",
    path: "/",
    note: "Full control — reorder the built-in sections and add your own.",
  },
  shop: {
    label: "Shop",
    path: "/shop",
    note: "Custom sections appear at the top of the shop page, above the products.",
  },
  contact: {
    label: "Contact",
    path: "/contact",
    note: "Custom sections appear at the top of the contact page.",
  },
};

export function isPageKey(value: unknown): value is PageKey {
  return typeof value === "string" && (PAGE_KEYS as readonly string[]).includes(value);
}

export function settingsKeyForPage(page: PageKey): string {
  return `page_sections_${page}`;
}

/* ------------------------------------------------------------------ */
/*  Section types                                                      */
/* ------------------------------------------------------------------ */
export type SectionType =
  // Built-in homepage sections (rendered by existing components)
  | "hero"
  | "trust_strip"
  | "featured_products"
  | "how_it_works"
  | "blog_strip"
  | "cta_banner"
  // Custom, admin-authored blocks (usable on any page)
  | "rich_text"
  | "image_banner"
  | "callout"
  | "image_text"
  | "faq"
  | "spacer";

export type SectionGroup = "builtin" | "custom";

export interface PageSection {
  /** Stable unique id. Built-ins use `builtin-<type>`; custom use a uuid. */
  id: string;
  type: SectionType;
  enabled: boolean;
  /** Type-specific content. Empty for built-ins. */
  props: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  Editable fields (drive the admin form generically)                 */
/* ------------------------------------------------------------------ */
export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "select"
  | "boolean"
  | "number"
  | "products"
  | "faqItems";

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  placeholder?: string;
  /** Only for `select`. The first option is the default. */
  options?: SelectOption[];
  /** Max characters for text/textarea/url (server-enforced). */
  maxLength?: number;
  /** Only for `number` (all server-enforced). */
  min?: number;
  max?: number;
  defaultValue?: number;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * A product as shown in the admin's product picker. Deliberately tiny — the
 * picker only needs enough to recognise a product, and this list is sent to
 * the browser with every load of the Page Sections screen.
 */
export interface PickerProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  featured: boolean;
  active: boolean;
}

/* ------------------------------------------------------------------ */
/*  Per-type metadata                                                  */
/* ------------------------------------------------------------------ */
interface SectionMeta {
  label: string;
  description: string;
  group: SectionGroup;
  /** Built-ins can be hidden/reordered but not removed. */
  deletable: boolean;
  /** Default props applied when a section of this type is first added. */
  defaultProps: Record<string, unknown>;
  fields: FieldDef[];
}

const BG_OPTIONS: SelectOption[] = [
  { label: "White", value: "white" },
  { label: "Light gray", value: "light" },
  { label: "Dark navy", value: "dark" },
];

const ALIGN_OPTIONS: SelectOption[] = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
];

const HEIGHT_OPTIONS: SelectOption[] = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

const CALLOUT_BG_OPTIONS: SelectOption[] = [
  { label: "Brand blue", value: "blue" },
  { label: "Dark navy", value: "navy" },
  { label: "Light", value: "light" },
];

const SIDE_OPTIONS: SelectOption[] = [
  { label: "Image on left", value: "left" },
  { label: "Image on right", value: "right" },
];

const SIZE_OPTIONS: SelectOption[] = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

/** Most products an admin can hand-pick for a single grid. */
export const MAX_PICKED_PRODUCTS = 24;
/** Products shown when the Featured grid falls back to the `featured` flag. */
export const DEFAULT_FEATURED_LIMIT = 6;

export const SECTION_META: Record<SectionType, SectionMeta> = {
  /* ---- Built-ins (homepage) ---- */
  hero: {
    label: "Hero Banner",
    description: "The big banner at the very top with the headline and Shop button.",
    group: "builtin",
    deletable: false,
    defaultProps: {},
    fields: [],
  },
  trust_strip: {
    label: "Trust Badges",
    description: "The row of trust badges (Third-Party Tested, 99%+ Purity, etc.).",
    group: "builtin",
    deletable: false,
    defaultProps: {},
    fields: [],
  },
  featured_products: {
    label: "Featured Products",
    description: "Hand-pick the products shown on the homepage, in your own order.",
    group: "builtin",
    deletable: false,
    defaultProps: { productIds: [], limit: DEFAULT_FEATURED_LIMIT },
    fields: [
      {
        key: "productIds",
        label: "Products to show",
        type: "products",
        hint: "These appear on the homepage in exactly this order. Leave the list empty to fall back to every product ticked “Featured” on its product page.",
      },
      {
        key: "limit",
        label: "How many to show automatically",
        type: "number",
        min: 1,
        max: MAX_PICKED_PRODUCTS,
        defaultValue: DEFAULT_FEATURED_LIMIT,
        hint: "Only used when you haven't picked any products above.",
      },
    ],
  },
  how_it_works: {
    label: "How Peptides Work",
    description: "The four-step explainer cards.",
    group: "builtin",
    deletable: false,
    defaultProps: {},
    fields: [],
  },
  blog_strip: {
    label: "Blog Posts",
    description:
      "A strip of your three latest blog posts with a link to the full blog. Hidden automatically until you publish a post.",
    group: "builtin",
    deletable: false,
    defaultProps: {},
    fields: [],
  },
  cta_banner: {
    label: "Call-to-Action Banner",
    description: "The closing 'Ready to start your research?' banner.",
    group: "builtin",
    deletable: false,
    defaultProps: {},
    fields: [],
  },

  /* ---- Custom blocks ---- */
  rich_text: {
    label: "Text Block",
    description: "A heading and paragraph of text.",
    group: "custom",
    deletable: true,
    defaultProps: {
      heading: "A new section",
      body: "Write something great here. This text is fully editable from the admin dashboard.",
      align: "center",
      background: "white",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text", maxLength: 200, placeholder: "Section heading" },
      { key: "body", label: "Body text", type: "textarea", maxLength: 5000, placeholder: "Paragraph text…" },
      { key: "align", label: "Alignment", type: "select", options: ALIGN_OPTIONS },
      { key: "background", label: "Background", type: "select", options: BG_OPTIONS },
    ],
  },
  image_banner: {
    label: "Image Banner",
    description: "A full-width image with optional overlay text and a button.",
    group: "custom",
    deletable: true,
    defaultProps: {
      image: "",
      heading: "Your headline here",
      subheading: "A short supporting line of text.",
      buttonLabel: "Shop Now",
      buttonHref: "/shop",
      height: "medium",
    },
    fields: [
      { key: "image", label: "Background image", type: "image", hint: "Recommended: a wide image, at least 1600px across." },
      { key: "heading", label: "Heading", type: "text", maxLength: 200, placeholder: "Headline" },
      { key: "subheading", label: "Subheading", type: "text", maxLength: 300, placeholder: "Supporting line" },
      { key: "buttonLabel", label: "Button text", type: "text", maxLength: 60, placeholder: "Shop Now" },
      { key: "buttonHref", label: "Button link", type: "url", maxLength: 500, placeholder: "/shop" },
      { key: "height", label: "Height", type: "select", options: HEIGHT_OPTIONS },
    ],
  },
  callout: {
    label: "Callout / CTA",
    description: "A coloured band with a heading, text and a button.",
    group: "custom",
    deletable: true,
    defaultProps: {
      heading: "Ready to get started?",
      text: "Add a compelling line that encourages visitors to take action.",
      buttonLabel: "Shop Now",
      buttonHref: "/shop",
      background: "blue",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text", maxLength: 200, placeholder: "Heading" },
      { key: "text", label: "Text", type: "textarea", maxLength: 1000, placeholder: "Supporting text" },
      { key: "buttonLabel", label: "Button text", type: "text", maxLength: 60, placeholder: "Shop Now" },
      { key: "buttonHref", label: "Button link", type: "url", maxLength: 500, placeholder: "/shop" },
      { key: "background", label: "Colour", type: "select", options: CALLOUT_BG_OPTIONS },
    ],
  },
  image_text: {
    label: "Image + Text",
    description: "An image on one side with a heading, text and button on the other.",
    group: "custom",
    deletable: true,
    defaultProps: {
      image: "",
      heading: "Tell your story",
      body: "Pair an image with a paragraph of text. Great for highlighting a product, a value, or your brand story.",
      buttonLabel: "Learn More",
      buttonHref: "/shop",
      imageSide: "left",
    },
    fields: [
      { key: "image", label: "Image", type: "image", hint: "A square or portrait image works best here." },
      { key: "heading", label: "Heading", type: "text", maxLength: 200, placeholder: "Heading" },
      { key: "body", label: "Body text", type: "textarea", maxLength: 3000, placeholder: "Paragraph text…" },
      { key: "buttonLabel", label: "Button text", type: "text", maxLength: 60, placeholder: "Learn More" },
      { key: "buttonHref", label: "Button link", type: "url", maxLength: 500, placeholder: "/shop" },
      { key: "imageSide", label: "Image position", type: "select", options: SIDE_OPTIONS },
    ],
  },
  faq: {
    label: "FAQ",
    description: "A list of expandable question-and-answer items.",
    group: "custom",
    deletable: true,
    defaultProps: {
      heading: "Frequently Asked Questions",
      items: [
        { question: "What is your first question?", answer: "Write the answer here." },
        { question: "What is your second question?", answer: "Write the answer here." },
      ] as FaqEntry[],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text", maxLength: 200, placeholder: "Frequently Asked Questions" },
      { key: "items", label: "Questions", type: "faqItems" },
    ],
  },
  spacer: {
    label: "Spacer / Divider",
    description: "Empty vertical space, optionally with a divider line.",
    group: "custom",
    deletable: true,
    defaultProps: {
      size: "medium",
      divider: false,
    },
    fields: [
      { key: "size", label: "Height", type: "select", options: SIZE_OPTIONS },
      { key: "divider", label: "Show a divider line", type: "boolean" },
    ],
  },
};

/** Section types that can be added from the "Add Section" menu. */
export const CUSTOM_SECTION_TYPES: SectionType[] = (
  Object.keys(SECTION_META) as SectionType[]
).filter((t) => SECTION_META[t].group === "custom");

/** Built-in section types, in their canonical homepage order. */
export const BUILTIN_HOME_ORDER: SectionType[] = [
  "hero",
  "trust_strip",
  "featured_products",
  "how_it_works",
  "blog_strip",
  "cta_banner",
];

/* ------------------------------------------------------------------ */
/*  Default layouts                                                    */
/* ------------------------------------------------------------------ */
/**
 * A page's out-of-the-box layout. Returns a fresh deep copy every call so
 * callers can never mutate the defaults (built-in props now hold arrays).
 */
export function defaultLayout(page: PageKey): PageSection[] {
  if (page !== "home") return [];
  return BUILTIN_HOME_ORDER.map((type) => makeSection(type));
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function uuid(): string {
  // Browser-safe; falls back to a random string where crypto is unavailable.
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `s-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

/** Create a fresh section of the given type with its default content. */
export function makeSection(type: SectionType): PageSection {
  const meta = SECTION_META[type];
  return {
    id: meta.group === "builtin" ? `builtin-${type}` : uuid(),
    type,
    enabled: true,
    props: structuredCloneSafe(meta.defaultProps),
  };
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/* ------------------------------------------------------------------ */
/*  Sanitisation (used by the API on write and the reader on load)     */
/* ------------------------------------------------------------------ */
const MAX_SECTIONS = 60;
const MAX_FAQ_ITEMS = 30;
const FAQ_Q_MAX = 300;
const FAQ_A_MAX = 3000;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function asString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

function sanitizeProps(type: SectionType, raw: unknown): Record<string, unknown> {
  const meta = SECTION_META[type];

  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const field of meta.fields) {
    const value = input[field.key];
    switch (field.type) {
      case "text":
      case "textarea":
      case "url":
      case "image": {
        out[field.key] = asString(value, field.maxLength ?? 2000);
        break;
      }
      case "boolean": {
        out[field.key] = value === true;
        break;
      }
      case "number": {
        const fallback = field.defaultValue ?? field.min ?? 0;
        const parsed =
          typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
        let num = Number.isFinite(parsed) ? Math.round(parsed) : fallback;
        if (field.min !== undefined) num = Math.max(field.min, num);
        if (field.max !== undefined) num = Math.min(field.max, num);
        out[field.key] = num;
        break;
      }
      case "products": {
        // Ordered list of product ids. Must be uuids — anything else would
        // blow up the `in (...)` lookup when the page renders.
        const list = Array.isArray(value) ? value : [];
        const seen = new Set<string>();
        const ids: string[] = [];
        for (const item of list) {
          if (ids.length >= MAX_PICKED_PRODUCTS) break;
          if (typeof item !== "string" || !UUID_RE.test(item)) continue;
          if (seen.has(item)) continue;
          seen.add(item);
          ids.push(item);
        }
        out[field.key] = ids;
        break;
      }
      case "select": {
        const allowed = (field.options ?? []).map((o) => o.value);
        out[field.key] =
          typeof value === "string" && allowed.includes(value)
            ? value
            : allowed[0] ?? "";
        break;
      }
      case "faqItems": {
        const list = Array.isArray(value) ? value : [];
        out[field.key] = list
          .slice(0, MAX_FAQ_ITEMS)
          .map((item) => {
            const obj = (item && typeof item === "object" ? item : {}) as Record<
              string,
              unknown
            >;
            return {
              question: asString(obj.question, FAQ_Q_MAX),
              answer: asString(obj.answer, FAQ_A_MAX),
            };
          })
          .filter((item) => item.question || item.answer);
        break;
      }
    }
  }
  return out;
}

/**
 * Validate + clean an arbitrary value into a safe PageSection[].
 * Drops unknown section types and unknown prop keys, caps lengths/counts.
 */
export function sanitizeSections(raw: unknown): PageSection[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: PageSection[] = [];

  for (const item of raw) {
    if (out.length >= MAX_SECTIONS) break;
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const type = obj.type as SectionType;
    if (!(type in SECTION_META)) continue;

    let id = typeof obj.id === "string" && obj.id ? obj.id : makeSection(type).id;
    // Guarantee uniqueness so React keys / reorder logic stay stable.
    if (seen.has(id)) id = `${id}-${out.length}`;
    seen.add(id);

    out.push({
      id,
      type,
      enabled: obj.enabled !== false,
      props: sanitizeProps(type, obj.props),
    });
  }
  return out;
}

/**
 * Ensure a page's layout is complete and renderable. For the homepage this
 * guarantees every built-in section is present (so admins can always re-enable
 * one) without disturbing the saved order.
 */
export function normalizeLayout(page: PageKey, raw: unknown): PageSection[] {
  const sections = sanitizeSections(raw);

  if (page === "home") {
    if (sections.length === 0) {
      return defaultLayout("home");
    }
    const present = new Set(
      sections.filter((s) => SECTION_META[s.type].group === "builtin").map((s) => s.type)
    );
    for (let i = 0; i < BUILTIN_HOME_ORDER.length; i++) {
      const type = BUILTIN_HOME_ORDER[i];
      if (present.has(type)) continue;

      // A built-in is missing from the saved layout — this happens when a new
      // built-in section ships after the admin already saved their homepage.
      // Insert it at its canonical position (right after the nearest earlier
      // built-in that's present, otherwise before the nearest later one) and
      // leave it enabled so the new section is visible out of the box. Admins
      // can still hide or reorder it from the Page Sections manager.
      let insertAt = sections.length;
      let anchored = false;
      for (let j = i - 1; j >= 0 && !anchored; j--) {
        const idx = sections.findIndex((s) => s.type === BUILTIN_HOME_ORDER[j]);
        if (idx !== -1) {
          insertAt = idx + 1;
          anchored = true;
        }
      }
      for (let j = i + 1; j < BUILTIN_HOME_ORDER.length && !anchored; j++) {
        const idx = sections.findIndex((s) => s.type === BUILTIN_HOME_ORDER[j]);
        if (idx !== -1) {
          insertAt = idx;
          anchored = true;
        }
      }

      sections.splice(insertAt, 0, makeSection(type));
      present.add(type);
    }
  }

  return sections;
}
