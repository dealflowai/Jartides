import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    // Use admin client to bypass RLS for the profile role check
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "customer";
    return NextResponse.json({
      isAdmin: role === "admin",
      isStaff: role === "admin" || role === "fulfillment",
      role,
    });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
