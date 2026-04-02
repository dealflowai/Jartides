import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ linked: 0 });
    }

    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .update({ user_id: user.id })
      .eq("guest_email", user.email)
      .is("user_id", null)
      .select("id");

    return NextResponse.json({ linked: data?.length ?? 0 });
  } catch {
    return NextResponse.json({ linked: 0 });
  }
}
