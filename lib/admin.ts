import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

export type StaffRole = "admin" | "fulfillment";

interface StaffUser extends User {
  role: StaffRole;
}

/**
 * Get the authenticated user's profile role.
 * Returns null if unauthenticated.
 */
async function getUserWithRole(): Promise<{ user: User; role: Profile["role"] } | null> {
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

  if (!profile) return null;
  return { user, role: profile.role as Profile["role"] };
}

/**
 * Require the user to have the admin role.
 * Returns the user if authorized, null otherwise.
 */
export async function requireAdmin(): Promise<User | null> {
  const result = await getUserWithRole();
  if (!result || result.role !== "admin") return null;
  return result.user;
}

/**
 * Require the user to be staff (admin or fulfillment).
 * Returns the user with their role if authorized, null otherwise.
 */
export async function requireStaff(): Promise<StaffUser | null> {
  const result = await getUserWithRole();
  if (!result) return null;
  if (result.role !== "admin" && result.role !== "fulfillment") return null;
  return Object.assign(result.user, { role: result.role }) as StaffUser;
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

/**
 * Page-level staff guard for server components.
 * Allows admin and fulfillment roles. Redirects to home otherwise.
 * Returns the user with their role attached.
 */
export async function requireStaffPage(): Promise<StaffUser> {
  const staff = await requireStaff();
  if (!staff) redirect("/");
  return staff;
}
