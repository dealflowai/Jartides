import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect password recovery to reset page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Link any guest orders to this account
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const admin = createAdminClient();
          await admin
            .from("orders")
            .update({ user_id: user.id })
            .eq("guest_email", user.email)
            .is("user_id", null);
        }
      } catch {
        // Silently fail — linking is a nice-to-have
      }

      return NextResponse.redirect(`${origin}/account`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
