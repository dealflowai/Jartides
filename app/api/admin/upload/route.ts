import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
const ALLOWED_BUCKETS = ["product-images", "coa-documents"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const bucket = formData.get("bucket") as string | null;

  if (!file || !bucket) {
    return NextResponse.json(
      { error: "File and bucket are required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json(
      { error: "Invalid storage bucket" },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Accepted: JPEG, PNG, WebP, GIF, PDF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10 MB." },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!ext) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const db = createAdminClient();
  const { error: uploadError } = await db.storage
    .from(bucket)
    .upload(path, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // For COA documents, return a proxied URL so the Supabase domain is never exposed
  if (bucket === "coa-documents") {
    return NextResponse.json({ url: `/api/coa/${path}` });
  }

  const {
    data: { publicUrl },
  } = db.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
