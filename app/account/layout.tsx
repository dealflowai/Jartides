import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import AccountNav from "./AccountNav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const displayName = profile?.full_name || user.email || "User";
  const displayEmail = user.email || "";

  const links = [
    { href: "/account", label: "Overview" },
    { href: "/account/orders", label: "Orders" },
    { href: "/account/addresses", label: "Addresses" },
    { href: "/account/subscriptions", label: "Subscriptions" },
  ];

  return (
    <div className="bg-[#f7f9fc] min-h-[calc(100vh-200px)]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Mobile: horizontal scroll tabs */}
        <div className="md:hidden mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <p className="font-semibold text-[#0b3d7a]">{displayName}</p>
              <p className="text-xs text-gray-500">{displayEmail}</p>
            </div>
          </div>
          <AccountNav links={links} />
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="mb-6">
              <p className="font-semibold text-[#0b3d7a]">{displayName}</p>
              <p className="text-xs text-gray-500">{displayEmail}</p>
            </div>

            <nav className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-700 border-l-[3px] border-transparent transition-all duration-200 hover:border-[#0b3d7a] hover:bg-white hover:text-[#0b3d7a] hover:translate-x-1 hover:shadow-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <form action="/api/auth/signout" method="POST" className="mt-6">
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
