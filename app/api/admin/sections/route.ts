import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { getAllPageSections } from "@/lib/sections/server";
import {
  isPageKey,
  sanitizeSections,
  settingsKeyForPage,
  PAGE_META,
} from "@/lib/sections/schema";

/** GET — return every managed page's layout (normalised, with built-ins). */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const layouts = await getAllPageSections();
  return NextResponse.json(layouts);
}

/** PUT — save a single page's layout. Body: { page, sections }. */
export async function PUT(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { page, sections } =
    (body as { page?: unknown; sections?: unknown }) ?? {};

  if (!isPageKey(page)) {
    return NextResponse.json({ error: "Unknown page" }, { status: 400 });
  }

  // Validate + strip anything unexpected before persisting.
  const clean = sanitizeSections(sections);

  const db = createAdminClient();
  const { error } = await db
    .from("site_settings")
    .upsert(
      { key: settingsKeyForPage(page), value: clean },
      { onConflict: "key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Refresh the affected page (and the homepage, which links everywhere).
  try {
    revalidatePath(PAGE_META[page].path);
  } catch {
    /* dynamic page — nothing cached to revalidate */
  }

  return NextResponse.json({ success: true, sections: clean });
}
