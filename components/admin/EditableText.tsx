"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEdit } from "./EditContext";

interface EditableTextProps {
  /** Key in the site_settings table */
  settingKey: string;
  /** Default / current text content */
  children: React.ReactNode;
  /** Extra className applied to the wrapper in edit mode */
  className?: string;
}

export default function EditableText({
  settingKey,
  children,
  className = "",
}: EditableTextProps) {
  const { isEditMode, registerEdit, editGeneration } = useEdit();
  const ref = useRef<HTMLSpanElement>(null);
  const originalText = typeof children === "string" ? children : "";

  // Reset content when edits are cancelled (editGeneration changes)
  useEffect(() => {
    if (ref.current && !isEditMode) {
      ref.current.textContent = originalText;
    }
  }, [editGeneration, isEditMode, originalText]);

  const handleBlur = useCallback(() => {
    if (!ref.current) return;
    const newText = ref.current.textContent?.trim() ?? "";
    if (newText !== originalText) {
      registerEdit(settingKey, newText);
    }
  }, [originalText, registerEdit, settingKey]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }, []);

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`editable-field ${className}`}
      data-setting-key={settingKey}
      style={{
        outline: "none",
        border: "1.5px dashed rgba(26, 109, 227, 0.5)",
        borderRadius: "4px",
        padding: "2px 4px",
        cursor: "text",
        position: "relative",
        minWidth: "20px",
        display: "inline",
        transition: "border-color 0.15s ease",
      }}
      title="Click to edit"
    >
      {children}
    </span>
  );
}
