// Custom next/image loader.
//
// We deliberately do NOT use Vercel's image optimizer. Its Hobby-plan
// transformation quota runs out partway through a month and every `/_next/image`
// request then returns `402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`, which
// shows up on the site as broken product images. Supabase Storage can resize on
// its own `/render/image/` endpoint instead — same origin the files already live
// on, no Vercel billing, and it content-negotiates WebP from the Accept header
// (a 900 KB source PNG comes back as a ~20 KB WebP at card size).
//
// Anything that isn't a public Supabase object (local /images/*, /api/coa/*,
// data: URIs) is passed through untouched — those assets are pre-optimized at
// their natural display size, so there is nothing left to do at request time.

const PUBLIC_OBJECT = "/storage/v1/object/public/";
const RENDER_IMAGE = "/storage/v1/render/image/public/";

// Supabase clamps transform params to these ranges; going outside them 400s.
const MAX_WIDTH = 2500;
const MIN_QUALITY = 20;
const MAX_QUALITY = 100;

interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

export default function supabaseImageLoader({ src, width, quality }: LoaderArgs): string {
  // Accept both the stored `/object/public/` form and an already-rewritten
  // `/render/image/public/` one, so a render URL that finds its way into the DB
  // still gets resized to the width Next actually asked for.
  const isObject = src.includes(PUBLIC_OBJECT);
  if (!isObject && !src.includes(RENDER_IMAGE)) return src;

  // Drop any existing query so repeated loader passes can't stack params.
  const path = src.split("?")[0];
  const base = isObject ? path.replace(PUBLIC_OBJECT, RENDER_IMAGE) : path;
  const w = Math.max(1, Math.min(Math.round(width), MAX_WIDTH));
  const q = Math.max(MIN_QUALITY, Math.min(Math.round(quality ?? 75), MAX_QUALITY));

  // Width only — Supabase derives the height, so nothing gets cropped.
  return `${base}?width=${w}&quality=${q}`;
}
