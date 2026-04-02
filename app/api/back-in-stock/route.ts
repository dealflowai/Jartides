import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCsrf } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const rateLimited = await rateLimit(req, { limit: 5, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = createAdminClient();
  const { error } = await db
    .from("back_in_stock_requests")
    .upsert(
      { ...parsed.data, notified: false },
      { onConflict: "product_id,email" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
