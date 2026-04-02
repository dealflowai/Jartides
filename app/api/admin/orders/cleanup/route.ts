import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";

// Cancel orders that have been "pending" for more than 1 hour (never paid)
export async function POST(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago

  const { data, error } = await db
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("status", "pending")
    .lt("created_at", cutoff)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    cancelled: data?.length ?? 0,
    message: `Cancelled ${data?.length ?? 0} stale pending orders.`,
  });
}
