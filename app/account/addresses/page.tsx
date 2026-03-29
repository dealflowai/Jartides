"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Address } from "@/lib/types";
import Button from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Star } from "lucide-react";

const COUNTRIES = [
  { code: "CA", label: "Canada" },
  { code: "US", label: "United States" },
];

const emptyForm = {
  full_name: "",
  line1: "",
  line2: "",
  city: "",
  province_state: "",
  postal_code: "",
  country: "CA",
  is_default: false,
};

export default function AddressesPage() {
  const supabase = createClient();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAddresses() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    setAddresses((data as Address[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }

  function openEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      full_name: addr.full_name,
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      province_state: addr.province_state,
      postal_code: addr.postal_code,
      country: addr.country,
      is_default: addr.is_default,
    });
    setShowForm(true);
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = { ...form, user_id: user.id };

    // If setting as default, unset others first
    if (form.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    if (editingId) {
      const { error: err } = await supabase
        .from("addresses")
        .update(payload)
        .eq("id", editingId);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("addresses").insert(payload);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    fetchAddresses();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    await supabase.from("addresses").delete().eq("id", id);
    fetchAddresses();
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#0b3d7a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-[family-name:var(--font-heading)] tracking-wide text-[#0b3d7a]">
          Addresses
        </h1>
        {!showForm && (
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Address
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-900">
            {editingId ? "Edit Address" : "New Address"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                name="full_name"
                required
                value={form.full_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a6de3] focus:ring-1 focus:ring-[#1a6de3] outline-none transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1
              </label>
              <input
                name="line1"
                required
                value={form.line1}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a6de3] focus:ring-1 focus:ring-[#1a6de3] outline-none transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2{" "}
                <span className="text-gray-400">(optional)</span>
              </label>
              <input
                name="line2"
                value={form.line2}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a6de3] focus:ring-1 focus:ring-[#1a6de3] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a6de3] focus:ring-1 focus:ring-[#1a6de3] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province / State
              </label>
              <input
                name="province_state"
                required
                value={form.province_state}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a6de3] focus:ring-1 focus:ring-[#1a6de3] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                name="postal_code"
                required
                value={form.postal_code}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a6de3] focus:ring-1 focus:ring-[#1a6de3] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a6de3] focus:ring-1 focus:ring-[#1a6de3] outline-none transition-colors bg-white"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="is_default"
              checked={form.is_default}
              onChange={handleChange}
              className="rounded border-gray-300 text-[#0b3d7a] focus:ring-[#1a6de3]"
            />
            Set as default address
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Address Cards */}
      {addresses.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-xl shadow-sm p-5 relative"
            >
              {addr.is_default && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-xs font-medium text-[#0b3d7a] bg-blue-50 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-current" />
                  Default
                </span>
              )}
              <div className="text-sm text-gray-700 space-y-0.5 pr-16">
                <p className="font-semibold">{addr.full_name}</p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {addr.city}, {addr.province_state} {addr.postal_code}
                </p>
                <p>{addr.country}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEdit(addr)}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#1a6de3] transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-3">No addresses saved yet.</p>
            <Button size="sm" onClick={openAdd}>
              Add your first address
            </Button>
          </div>
        )
      )}
    </div>
  );
}
