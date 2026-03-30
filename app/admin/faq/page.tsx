"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

/* ------------------------------------------------------------------ */
/*  Hardcoded defaults (mirror of faq/page.tsx)                        */
/* ------------------------------------------------------------------ */
const DEFAULT_FAQ_DATA: FaqSection[] = [
  {
    title: "General Questions",
    items: [
      {
        question: "What are research peptides?",
        answer:
          "Peptides are short chains of amino acids used in laboratory research. They play a key role in scientific studies related to cellular function, receptor binding, and molecular biology. Our peptides are synthesized to the highest purity standards for in-vitro research use only.",
      },
      {
        question: "Are your peptides legal in Canada?",
        answer:
          "Yes, research peptides are legal for in-vitro research purposes in Canada. They are not intended for human consumption, veterinary use, or any clinical applications. Purchasers are responsible for ensuring compliance with all applicable local regulations.",
      },
      {
        question: "Who can purchase from Jartides?",
        answer:
          "You must be 21 years of age or older and confirm that your purchase is intended for in-vitro research purposes only. By placing an order, you agree to our terms of service and acknowledge that our products are not for human consumption.",
      },
      {
        question: "How do you verify purity?",
        answer:
          "All products undergo HPLC (High-Performance Liquid Chromatography) and Mass Spectrometry testing by independent third-party laboratories. Certificates of Analysis (COAs) are available for every batch and can be viewed on our COA page.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes, we ship worldwide. Buyers are responsible for understanding and complying with their local regulations regarding the importation of research peptides. International shipping times and customs processing may vary by destination.",
      },
    ],
  },
  {
    title: "Orders & Shipping",
    items: [
      {
        question: "Is packaging discreet?",
        answer:
          "Yes, all orders ship in plain, unmarked packaging. Your privacy is important to us.",
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept Visa, Mastercard, American Express, and PayPal.",
      },
      {
        question: "What is your return/refund policy?",
        answer:
          "If your product arrives damaged or the quality is not correct, contact us within 30 days for a replacement or full refund. Products must be in sealed packaging.",
      },
      {
        question: "How do I track my order?",
        answer:
          "You'll receive a confirmation email with a tracking number once your order has shipped. You can use this tracking number to monitor your delivery status in real time.",
      },
    ],
  },
  {
    title: "Subscriptions",
    items: [
      {
        question: "When will Subscribe be available?",
        answer:
          "Our subscription service is coming soon! We're working hard to bring you the best monthly delivery experience with savings up to 20%. Stay tuned for updates.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Styling constants                                                  */
/* ------------------------------------------------------------------ */
const INPUT_CLS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3] transition-colors";

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
export default function AdminFaqPage() {
  const [sections, setSections] = useState<FaqSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Editing state
  const [editingItem, setEditingItem] = useState<{
    sectionIdx: number;
    itemIdx: number;
  } | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  // Adding state
  const [addingToSection, setAddingToSection] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // Adding section state
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // Collapsed sections
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(
    new Set()
  );

  /* ---------- Load ---------- */
  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) return;
      const data = await res.json();
      const faqSetting = data.find(
        (item: { key: string; value: unknown }) => item.key === "faq_data"
      );
      if (faqSetting?.value) {
        const parsed =
          typeof faqSetting.value === "string"
            ? JSON.parse(faqSetting.value)
            : faqSetting.value;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSections(parsed);
          return;
        }
      }
      // Fall back to defaults
      setSections(DEFAULT_FAQ_DATA);
    } catch {
      setSections(DEFAULT_FAQ_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- Save ---------- */
  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faq_data: sections }),
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save FAQ data.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Section helpers ---------- */
  function toggleCollapse(idx: number) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function deleteSection(sectionIdx: number) {
    if (!confirm("Delete this entire section and all its questions?")) return;
    setSections((prev) => prev.filter((_, i) => i !== sectionIdx));
    setDirty(true);
  }

  function addSection() {
    if (!newSectionTitle.trim()) return;
    setSections((prev) => [...prev, { title: newSectionTitle.trim(), items: [] }]);
    setNewSectionTitle("");
    setAddingSection(false);
    setDirty(true);
  }

  function renameSectionStart(sectionIdx: number) {
    const title = prompt("New section title:", sections[sectionIdx].title);
    if (title && title.trim()) {
      setSections((prev) =>
        prev.map((s, i) => (i === sectionIdx ? { ...s, title: title.trim() } : s))
      );
      setDirty(true);
    }
  }

  /* ---------- Item helpers ---------- */
  function startEdit(sectionIdx: number, itemIdx: number) {
    const item = sections[sectionIdx].items[itemIdx];
    setEditingItem({ sectionIdx, itemIdx });
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
  }

  function cancelEdit() {
    setEditingItem(null);
    setEditQuestion("");
    setEditAnswer("");
  }

  function saveEdit() {
    if (!editingItem) return;
    const { sectionIdx, itemIdx } = editingItem;
    setSections((prev) =>
      prev.map((section, si) =>
        si === sectionIdx
          ? {
              ...section,
              items: section.items.map((item, qi) =>
                qi === itemIdx
                  ? { question: editQuestion.trim(), answer: editAnswer.trim() }
                  : item
              ),
            }
          : section
      )
    );
    setEditingItem(null);
    setEditQuestion("");
    setEditAnswer("");
    setDirty(true);
  }

  function deleteItem(sectionIdx: number, itemIdx: number) {
    if (!confirm("Delete this question?")) return;
    setSections((prev) =>
      prev.map((section, si) =>
        si === sectionIdx
          ? { ...section, items: section.items.filter((_, qi) => qi !== itemIdx) }
          : section
      )
    );
    setDirty(true);
  }

  function addItem(sectionIdx: number) {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setSections((prev) =>
      prev.map((section, si) =>
        si === sectionIdx
          ? {
              ...section,
              items: [
                ...section.items,
                { question: newQuestion.trim(), answer: newAnswer.trim() },
              ],
            }
          : section
      )
    );
    setNewQuestion("");
    setNewAnswer("");
    setAddingToSection(null);
    setDirty(true);
  }

  function moveItem(
    sectionIdx: number,
    itemIdx: number,
    direction: "up" | "down"
  ) {
    setSections((prev) =>
      prev.map((section, si) => {
        if (si !== sectionIdx) return section;
        const items = [...section.items];
        const targetIdx = direction === "up" ? itemIdx - 1 : itemIdx + 1;
        if (targetIdx < 0 || targetIdx >= items.length) return section;
        [items[itemIdx], items[targetIdx]] = [items[targetIdx], items[itemIdx]];
        return { ...section, items };
      })
    );
    setDirty(true);
  }

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">FAQ Manager</h1>
        <p className="mb-8 text-sm text-gray-500">
          Manage frequently asked questions displayed on the FAQ page.
        </p>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="mx-auto max-w-4xl pb-28">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Manager</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage frequently asked questions displayed on the FAQ page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm font-medium text-green-600">Saved!</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0b3d7a]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, si) => {
          const isCollapsed = collapsedSections.has(si);

          return (
            <div
              key={si}
              className="rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Section header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => toggleCollapse(si)}
                  className="flex items-center gap-2 text-left"
                >
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h2>
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {section.items.length} question
                    {section.items.length !== 1 ? "s" : ""}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => renameSectionStart(si)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0b3d7a]"
                    title="Rename section"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSection(si)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Delete section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Section items */}
              {!isCollapsed && (
                <div className="divide-y divide-gray-50">
                  {section.items.map((item, qi) => {
                    const isEditing =
                      editingItem?.sectionIdx === si &&
                      editingItem?.itemIdx === qi;

                    if (isEditing) {
                      return (
                        <div key={qi} className="bg-blue-50/50 p-5">
                          <div className="space-y-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">
                                Question
                              </label>
                              <input
                                className={INPUT_CLS}
                                value={editQuestion}
                                onChange={(e) =>
                                  setEditQuestion(e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">
                                Answer
                              </label>
                              <textarea
                                className={INPUT_CLS}
                                rows={4}
                                value={editAnswer}
                                onChange={(e) => setEditAnswer(e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={saveEdit}
                                className="flex items-center gap-1 rounded-lg bg-[#0b3d7a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0b3d7a]/90"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                              >
                                <X className="h-3.5 w-3.5" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={qi}
                        className="group flex items-start gap-3 px-5 py-4 hover:bg-gray-50/50"
                      >
                        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800">
                            {item.question}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {item.answer}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => moveItem(si, qi, "up")}
                            disabled={qi === 0}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                            title="Move up"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(si, qi, "down")}
                            disabled={qi === section.items.length - 1}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                            title="Move down"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(si, qi)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-[#0b3d7a]"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(si, qi)}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add question form */}
                  {addingToSection === si ? (
                    <div className="bg-green-50/30 p-5">
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Question
                          </label>
                          <input
                            className={INPUT_CLS}
                            placeholder="Enter the question..."
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Answer
                          </label>
                          <textarea
                            className={INPUT_CLS}
                            rows={4}
                            placeholder="Enter the answer..."
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => addItem(si)}
                            disabled={!newQuestion.trim() || !newAnswer.trim()}
                            className="flex items-center gap-1 rounded-lg bg-[#0b3d7a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0b3d7a]/90 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Add Question
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingToSection(null);
                              setNewQuestion("");
                              setNewAnswer("");
                            }}
                            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAddingToSection(si);
                          setNewQuestion("");
                          setNewAnswer("");
                        }}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#1a6de3] transition-colors hover:bg-[#1a6de3]/5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Question
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add section */}
        {addingSection ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Section Title
                </label>
                <input
                  className={INPUT_CLS}
                  placeholder="e.g. Billing & Payments"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addSection}
                  disabled={!newSectionTitle.trim()}
                  className="flex items-center gap-1 rounded-lg bg-[#0b3d7a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0b3d7a]/90 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Add Section
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingSection(false);
                    setNewSectionTitle("");
                  }}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingSection(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-4 text-sm font-semibold text-gray-500 transition-colors hover:border-[#1a6de3] hover:bg-[#1a6de3]/5 hover:text-[#1a6de3]"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        )}
      </div>

      {/* Floating save bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ${
          dirty
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
            <p className="text-sm text-gray-600">
              You have unsaved changes.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDirty(false);
                  loadData();
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0b3d7a]/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
