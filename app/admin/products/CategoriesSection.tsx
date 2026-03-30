"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Trash2, Plus, Check, X, Tags } from "lucide-react";
import type { Category } from "@/lib/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function CategoriesSection({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", sort_order: "0" });

  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    setCategories((data ?? []) as Category[]);
  }

  function startEdit(cat: Category) {
    setEditing(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      sort_order: cat.sort_order.toString(),
    });
    setAdding(false);
  }

  function startAdd() {
    setAdding(true);
    setEditing(null);
    setForm({ name: "", slug: "", sort_order: "0" });
  }

  function cancel() {
    setEditing(null);
    setAdding(false);
  }

  async function saveEdit(id: string) {
    await supabase
      .from("categories")
      .update({
        name: form.name,
        slug: form.slug,
        sort_order: parseInt(form.sort_order) || 0,
      })
      .eq("id", id);
    setEditing(null);
    load();
  }

  async function saveNew() {
    await supabase.from("categories").insert({
      name: form.name,
      slug: form.slug || slugify(form.name),
      sort_order: parseInt(form.sort_order) || 0,
    });
    setAdding(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    load();
  }

  const inputCls =
    "rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#1a6de3] focus:outline-none";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tags className="h-5 w-5 text-[#1a6de3]" />
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b3d7a] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#09326a]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Category
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3 text-right">Sort Order</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) =>
              editing === cat.id ? (
                <tr key={cat.id} className="bg-blue-50/30">
                  <td className="px-4 py-2">
                    <input
                      className={inputCls}
                      value={form.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setForm((f) => ({ ...f, name, slug: slugify(name) }));
                      }}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className={inputCls}
                      value={form.slug}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, slug: e.target.value }))
                      }
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <input
                      type="number"
                      className={`${inputCls} w-16 text-right`}
                      value={form.sort_order}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sort_order: e.target.value }))
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => saveEdit(cat.id)} className="rounded p-1 text-green-600 hover:bg-green-50">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={cancel} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-right">{cat.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(cat)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-[#1a6de3]">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(cat.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {adding && (
              <tr className="bg-blue-50/30">
                <td className="px-4 py-2">
                  <input
                    className={inputCls}
                    placeholder="Category name"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({ ...f, name, slug: slugify(name) }));
                    }}
                    autoFocus
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    className={inputCls}
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <input
                    type="number"
                    className={`${inputCls} w-16 text-right`}
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sort_order: e.target.value }))
                    }
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <button onClick={saveNew} className="rounded p-1 text-green-600 hover:bg-green-50">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={cancel} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {categories.length === 0 && !adding && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
