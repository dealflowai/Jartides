import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { writeAuditLog } from "@/lib/audit";
import slugify from "slugify";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(500).optional().default(""),
  content: z.string().default(""),
  cover_image: z.string().nullable().optional(),
  author: z.string().max(120).optional().default("Jartides Team"),
  meta_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(320).nullable().optional(),
  published: z.boolean().default(false),
});

function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true }).slice(0, 200);
}

/** Map a Postgres unique-violation into a friendly 409. */
function friendlyError(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    return NextResponse.json(
      { error: "A post with that URL slug already exists. Choose a different slug." },
      { status: 409 }
    );
  }
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// List all posts (admins read drafts + published through the RLS admin policy).
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = blogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { slug, title, published, ...rest } = parsed.data;
  const finalSlug = toSlug(slug || title);
  if (!finalSlug) {
    return NextResponse.json(
      { error: "Could not build a URL slug from the title." },
      { status: 400 }
    );
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("blog_posts")
    .insert({
      ...rest,
      title,
      slug: finalSlug,
      published,
      published_at: published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return friendlyError(error);

  writeAuditLog({
    admin_id: admin.id,
    action: "blog.create",
    entity_type: "blog_post",
    entity_id: data.id,
    details: { title: data.title, published: data.published },
  });

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...payload } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing post id" }, { status: 400 });
  }

  const parsed = blogSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { slug, title, published, ...rest } = parsed.data;
  const finalSlug = toSlug(slug || title);
  if (!finalSlug) {
    return NextResponse.json(
      { error: "Could not build a URL slug from the title." },
      { status: 400 }
    );
  }

  const db = createAdminClient();

  // Stamp published_at the first time a post goes live; keep it stable after.
  const { data: current } = await db
    .from("blog_posts")
    .select("published_at")
    .eq("id", id)
    .single();

  let publishedAt: string | null = current?.published_at ?? null;
  if (published && !publishedAt) publishedAt = new Date().toISOString();
  if (!published) publishedAt = null;

  const { data, error } = await db
    .from("blog_posts")
    .update({
      ...rest,
      title,
      slug: finalSlug,
      published,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return friendlyError(error);

  writeAuditLog({
    admin_id: admin.id,
    action: "blog.update",
    entity_type: "blog_post",
    entity_id: id,
    details: { title: data.title, published: data.published },
  });

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing post id" }, { status: 400 });
  }

  const db = createAdminClient();
  const { error } = await db.from("blog_posts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  writeAuditLog({
    admin_id: admin.id,
    action: "blog.delete",
    entity_type: "blog_post",
    entity_id: id,
  });

  return NextResponse.json({ success: true });
}
