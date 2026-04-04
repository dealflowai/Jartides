"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FileCheck,
  ShoppingBag,
  Warehouse,
  MessageCircleQuestion,
  Ticket,
  Settings,
  ArrowLeft,
  ShieldCheck,
  Users,
  Star,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Email", href: "/admin/email", icon: Mail },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { label: "COA Documents", href: "/admin/coa", icon: FileCheck },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Discounts", href: "/admin/discounts", icon: Ticket },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "FAQ Manager", href: "/admin/faq", icon: MessageCircleQuestion },
  { label: "Compliance", href: "/admin/compliance", icon: ShieldCheck },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex flex-1 flex-col justify-between px-3 py-2">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                  active
                    ? "bg-[#1a6de3]/10 font-semibold text-[#0b3d7a] border-l-[3px] border-[#0b3d7a]"
                    : "text-gray-600 border-l-[3px] border-transparent hover:border-[#1a6de3] hover:bg-[#1a6de3]/5 hover:text-[#0b3d7a] hover:translate-x-1 hover:shadow-sm"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 border-l-[3px] border-transparent transition-all duration-200 hover:border-gray-400 hover:bg-gray-100 hover:text-[#0b3d7a] hover:translate-x-1 hover:shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Site
      </Link>
    </nav>
  );
}
