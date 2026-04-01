"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface PendingEdit {
  key: string;
  value: string;
}

interface EditContextValue {
  isAdmin: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  registerEdit: (key: string, value: string) => void;
  saveAll: () => Promise<void>;
  cancelAll: () => void;
  isSaving: boolean;
  pendingEdits: Map<string, string>;
  editGeneration: number; // bumped on cancel so EditableText can reset
}

const EditContext = createContext<EditContextValue>({
  isAdmin: false,
  isEditMode: false,
  toggleEditMode: () => {},
  registerEdit: () => {},
  saveAll: async () => {},
  cancelAll: () => {},
  isSaving: false,
  pendingEdits: new Map(),
  editGeneration: 0,
});

export function useEdit() {
  return useContext(EditContext);
}

export function EditProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editGeneration, setEditGeneration] = useState(0);
  const pendingEditsRef = useRef<Map<string, string>>(new Map());
  const [pendingEdits, setPendingEdits] = useState<Map<string, string>>(
    new Map()
  );

  // Inline edit mode disabled — use /admin dashboard instead
  // useEffect(() => {
  //   let cancelled = false;
  //   fetch("/api/admin/check-role")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (!cancelled) setIsAdmin(data.isAdmin === true);
  //     })
  //     .catch(() => {
  //       if (!cancelled) setIsAdmin(false);
  //     });
  //   return () => {
  //     cancelled = true;
  //   };
  // }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      if (prev) {
        // Turning off edit mode -- cancel pending edits
        pendingEditsRef.current = new Map();
        setPendingEdits(new Map());
        setEditGeneration((g) => g + 1);
      }
      return !prev;
    });
  }, []);

  const registerEdit = useCallback((key: string, value: string) => {
    pendingEditsRef.current.set(key, value);
    setPendingEdits(new Map(pendingEditsRef.current));
  }, []);

  const saveAll = useCallback(async () => {
    if (pendingEditsRef.current.size === 0) {
      setIsEditMode(false);
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, string> = {};
      pendingEditsRef.current.forEach((value, key) => {
        payload[key] = value;
      });

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }

      pendingEditsRef.current = new Map();
      setPendingEdits(new Map());
      setIsEditMode(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }, []);

  const cancelAll = useCallback(() => {
    pendingEditsRef.current = new Map();
    setPendingEdits(new Map());
    setEditGeneration((g) => g + 1);
    setIsEditMode(false);
  }, []);

  return (
    <EditContext.Provider
      value={{
        isAdmin,
        isEditMode,
        toggleEditMode,
        registerEdit,
        saveAll,
        cancelAll,
        isSaving,
        pendingEdits,
        editGeneration,
      }}
    >
      {children}
    </EditContext.Provider>
  );
}
