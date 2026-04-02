"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Crown,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
  order_count: number;
  total_spent: number;
}

type SortField = "full_name" | "email" | "role" | "created_at" | "order_count" | "total_spent";
type SortDir = "asc" | "desc";

type ToastType = "success" | "error";
interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatPrice(cents: number) {
  const formatted = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
  return `${formatted} CAD`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
            t.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="ml-2 shrink-0 rounded p-0.5 hover:bg-black/5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sortable header                                                    */
/* ------------------------------------------------------------------ */
function SortHeader({
  label,
  field,
  current,
  dir,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: SortDir;
  onSort: (f: SortField) => void;
  className?: string;
}) {
  const active = current === field;
  return (
    <th
      className={`cursor-pointer select-none px-4 py-3 ${className ?? ""}`}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active &&
          (dir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          ))}
      </span>
    </th>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [roleFilter, setRoleFilter] = useState<"all" | "customer" | "admin">("all");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  let toastId = 0;

  function addToast(type: ToastType, message: string) {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  /* ---------- Load ---------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/customers");
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `Failed to load customers (${res.status})`);
        }
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load customers");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ---------- Role toggle ---------- */
  async function toggleRole(customer: Customer) {
    const newRole = customer.role === "admin" ? "customer" : "admin";
    setUpdatingRole(customer.id);

    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: customer.id, role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to update role");
      }

      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, role: newRole } : c))
      );
      addToast("success", `${customer.full_name || customer.email} is now ${newRole}`);
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  }

  /* ---------- Sort ---------- */
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "created_at" || field === "total_spent" || field === "order_count" ? "desc" : "asc");
    }
  }

  /* ---------- Filtered + sorted list ---------- */
  const filtered = useMemo(() => {
    let list = customers;

    // Role filter
    if (roleFilter !== "all") {
      list = list.filter((c) => c.role === roleFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          (c.full_name?.toLowerCase().includes(q) ?? false) ||
          (c.phone?.toLowerCase().includes(q) ?? false)
      );
    }

    // Sort
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "full_name":
          cmp = (a.full_name ?? "").localeCompare(b.full_name ?? "");
          break;
        case "email":
          cmp = a.email.localeCompare(b.email);
          break;
        case "role":
          cmp = a.role.localeCompare(b.role);
          break;
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "order_count":
          cmp = a.order_count - b.order_count;
          break;
        case "total_spent":
          cmp = a.total_spent - b.total_spent;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [customers, search, sortField, sortDir, roleFilter]);

  /* ---------- Stats ---------- */
  const totalCustomers = customers.length;
  const totalAdmins = customers.filter((c) => c.role === "admin").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Customers</h1>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
        </div>
      </div>
    );
  }

  /* ---------- Load error ---------- */
  if (loadError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Customers</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <XCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
          <p className="text-sm font-medium text-red-800">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Customers</h1>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-[#1a6de3]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{totalAdmins}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "customer", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                roleFilter === r
                  ? "bg-[#0b3d7a] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r === "all" ? "All" : r === "customer" ? "Customers" : "Admins"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <SortHeader label="Name" field="full_name" current={sortField} dir={sortDir} onSort={handleSort} />
              <SortHeader label="Email" field="email" current={sortField} dir={sortDir} onSort={handleSort} />
              <SortHeader label="Role" field="role" current={sortField} dir={sortDir} onSort={handleSort} />
              <SortHeader label="Orders" field="order_count" current={sortField} dir={sortDir} onSort={handleSort} className="text-right" />
              <SortHeader label="Total Spent" field="total_spent" current={sortField} dir={sortDir} onSort={handleSort} className="text-right" />
              <SortHeader label="Joined" field="created_at" current={sortField} dir={sortDir} onSort={handleSort} />
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {customer.full_name || "—"}
                    </p>
                    {customer.phone && (
                      <p className="text-xs text-gray-400">{customer.phone}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      customer.role === "admin"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {customer.role === "admin" && <Crown className="h-3 w-3" />}
                    {customer.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                  {customer.order_count}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                  {formatPrice(customer.total_spent)}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(customer.created_at)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRole(customer)}
                    disabled={updatingRole === customer.id}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                      customer.role === "admin"
                        ? "border border-red-200 text-red-600 hover:bg-red-50"
                        : "border border-blue-200 text-[#1a6de3] hover:bg-blue-50"
                    }`}
                  >
                    {updatingRole === customer.id
                      ? "Updating..."
                      : customer.role === "admin"
                        ? "Remove Admin"
                        : "Make Admin"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  {search || roleFilter !== "all"
                    ? "No customers match your filters."
                    : "No customers yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <p className="mt-3 text-right text-xs text-gray-400">
        Showing {filtered.length} of {totalCustomers} user{totalCustomers !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
