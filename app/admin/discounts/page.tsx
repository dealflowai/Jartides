"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface DiscountCode {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Styling constants                                                  */
/* ------------------------------------------------------------------ */
const INPUT_CLS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3] transition-colors";

const SELECT_CLS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3] transition-colors";

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
export default function AdminDiscountsPage() {
  const supabase = createClient();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState<"percentage" | "fixed">("percentage");
  const [formValue, setFormValue] = useState("");
  const [formMinOrder, setFormMinOrder] = useState("");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formExpiry, setFormExpiry] = useState("");

  /* ---------- Load ---------- */
  const loadCodes = useCallback(async () => {
    const { data, error } = await supabase
      .from("discount_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCodes(data);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  /* ---------- Create ---------- */
  async function handleCreate() {
    if (!formCode.trim() || !formValue) return;
    setCreating(true);

    const payload: Record<string, unknown> = {
      code: formCode.trim().toUpperCase(),
      type: formType,
      value: parseFloat(formValue),
      min_order_amount: formMinOrder ? parseFloat(formMinOrder) : 0,
      active: true,
    };

    if (formMaxUses) payload.max_uses = parseInt(formMaxUses, 10);
    if (formExpiry) payload.expires_at = new Date(formExpiry).toISOString();

    const { error } = await supabase.from("discount_codes").insert(payload);

    if (error) {
      alert(error.message || "Failed to create discount code.");
    } else {
      resetForm();
      loadCodes();
    }
    setCreating(false);
  }

  function resetForm() {
    setFormCode("");
    setFormType("percentage");
    setFormValue("");
    setFormMinOrder("");
    setFormMaxUses("");
    setFormExpiry("");
    setShowForm(false);
  }

  /* ---------- Toggle active ---------- */
  async function toggleActive(id: string, currentActive: boolean) {
    const { error } = await supabase
      .from("discount_codes")
      .update({ active: !currentActive })
      .eq("id", id);

    if (!error) {
      setCodes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !currentActive } : c))
      );
    }
  }

  /* ---------- Delete ---------- */
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this discount code?")) return;

    const { error } = await supabase
      .from("discount_codes")
      .delete()
      .eq("id", id);

    if (!error) {
      setCodes((prev) => prev.filter((c) => c.id !== id));
    }
  }

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Discount Codes</h1>
        <p className="mb-8 text-sm text-gray-500">
          Create and manage discount codes for your store.
        </p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="mx-auto max-w-5xl pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Codes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage discount codes for your store.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0b3d7a]/90"
          >
            <Plus className="h-4 w-4" />
            New Code
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Create Discount Code
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Code *
              </label>
              <input
                className={INPUT_CLS}
                placeholder="e.g. SAVE20"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Type *
              </label>
              <select
                className={SELECT_CLS}
                value={formType}
                onChange={(e) =>
                  setFormType(e.target.value as "percentage" | "fixed")
                }
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Value * {formType === "percentage" ? "(%)" : "($)"}
              </label>
              <input
                className={INPUT_CLS}
                type="number"
                min="0"
                step="0.01"
                placeholder={formType === "percentage" ? "20" : "10.00"}
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Min Order Amount ($)
              </label>
              <input
                className={INPUT_CLS}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formMinOrder}
                onChange={(e) => setFormMinOrder(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Max Uses (leave empty for unlimited)
              </label>
              <input
                className={INPUT_CLS}
                type="number"
                min="1"
                placeholder="Unlimited"
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Expiry Date
              </label>
              <input
                className={INPUT_CLS}
                type="datetime-local"
                value={formExpiry}
                onChange={(e) => setFormExpiry(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={creating || !formCode.trim() || !formValue}
              className="flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0b3d7a]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Code"
              )}
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {codes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-sm text-gray-500">
            No discount codes yet. Create your first one above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Code</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Value</th>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Min Order
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600">Uses</th>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Expires
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {codes.map((code) => {
                const isExpired =
                  code.expires_at && new Date(code.expires_at) < new Date();
                const isMaxed =
                  code.max_uses !== null && code.used_count >= code.max_uses;

                return (
                  <tr
                    key={code.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">
                      {code.code}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">
                      {code.type}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {code.type === "percentage"
                        ? `${code.value}%`
                        : `$${Number(code.value).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {Number(code.min_order_amount) > 0
                        ? `$${Number(code.min_order_amount).toFixed(2)}`
                        : "--"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {code.used_count}
                      {code.max_uses !== null ? ` / ${code.max_uses}` : " / --"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {code.expires_at
                        ? new Date(code.expires_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      {isExpired ? (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          Expired
                        </span>
                      ) : isMaxed ? (
                        <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                          Maxed
                        </span>
                      ) : code.active ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(code.id, code.active)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0b3d7a]"
                          title={code.active ? "Deactivate" : "Activate"}
                        >
                          {code.active ? (
                            <ToggleRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(code.id)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
