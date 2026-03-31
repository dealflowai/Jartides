import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

/**
 * Shared admin authorization check.
 * Verifies user is authenticated AND has the admin role.
 * Always uses the admin client for the role lookup to avoid RLS issues.
 */
export async function requireAdmin(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return user;
}

/**
 * Page-level admin guard for server components.
 * Redirects to home if the user is not an authenticated admin.
 */
export async function requireAdminPage(): Promise<User> {
  const user = await requireAdmin();
  if (!user) redirect("/");
  return user;
}
