import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";

const phoneSchema = z.object({
  phone: z.string().trim().max(40),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const staff = await requireStaff();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = phoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const db = createAdminClient();
  const { error } = await db
    .from("orders")
    .update({ shipping_phone: parsed.data.phone || null })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, phone: parsed.data.phone });
}
