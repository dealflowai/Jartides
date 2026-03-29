import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminNav from "@/components/admin/AdminNav";
import type { Profile } from "@/lib/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const adminSupabase = createAdminClient();
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile || profile.role !== "admin") redirect("/");

  return (
    <div className="flex h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="px-6 py-5">
          <h1 className="text-sm font-bold tracking-widest text-[#0b3d7a]">
            JARTIDES ADMIN
          </h1>
        </div>
        <AdminNav />
      </aside>

      <div className="ml-64 flex-1 overflow-y-auto bg-gray-50 p-8">
        {children}
      </div>
    </div>
  );
}
