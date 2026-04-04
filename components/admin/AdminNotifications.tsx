"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Mail, Package, AlertTriangle, X } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "inbox" | "shipping" | "stock" | "abandoned";
  title: string;
  description: string;
  href: string;
  time?: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const items: Notification[] = [];

    try {
      // Unread inbox messages
      const inboxRes = await fetch("/api/admin/inbox");
      if (inboxRes.ok) {
        const messages = await inboxRes.json();
        const unread = messages.filter(
          (m: { direction: string; is_read: boolean }) =>
            m.direction === "inbound" && !m.is_read
        );
        if (unread.length > 0) {
          items.push({
            id: "inbox",
            type: "inbox",
            title: `${unread.length} unread message${unread.length > 1 ? "s" : ""}`,
            description: "New contact form submissions",
            href: "/admin/email",
          });
        }
      }

      // Orders needing shipping labels
      const ordersRes = await fetch("/api/admin/orders?status=processing");
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        const needsLabel = orders.filter(
          (o: { tracking_number: string | null }) => !o.tracking_number
        );
        if (needsLabel.length > 0) {
          items.push({
            id: "shipping",
            type: "shipping",
            title: `${needsLabel.length} order${needsLabel.length > 1 ? "s" : ""} need shipping`,
            description: "Processing orders without tracking numbers",
            href: "/admin/orders",
          });
        }
      }

      // Low stock products
      const stockRes = await fetch("/api/admin/inventory/low-stock");
      if (stockRes.ok) {
        const data = await stockRes.json();
        const count = data.products?.length ?? 0;
        if (count > 0) {
          items.push({
            id: "stock",
            type: "stock",
            title: `${count} product${count > 1 ? "s" : ""} low on stock`,
            description: "Restock needed soon",
            href: "/admin/inventory",
          });
        }
      }
    } catch {
      /* ignore fetch errors */
    }

    setNotifications(items);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const iconMap = {
    inbox: Mail,
    shipping: Package,
    stock: AlertTriangle,
    abandoned: Mail,
  };

  const colorMap = {
    inbox: "text-blue-600 bg-blue-50",
    shipping: "text-purple-600 bg-purple-50",
    stock: "text-red-600 bg-red-50",
    abandoned: "text-amber-600 bg-amber-50",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-[#0b3d7a] hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl z-50">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">All caught up!</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = iconMap[n.type];
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className={`rounded-lg p-2 ${colorMap[n.type]} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500">{n.description}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
