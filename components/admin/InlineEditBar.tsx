"use client";

import { useEdit } from "./EditContext";

export default function InlineEditBar() {
  const {
    isAdmin,
    isEditMode,
    toggleEditMode,
    saveAll,
    cancelAll,
    isSaving,
    pendingEdits,
  } = useEdit();

  if (!isAdmin) return null;

  return (
    <>
      {/* Global hover tooltip style for editable fields */}
      {isEditMode && (
        <style jsx global>{`
          .editable-field:hover {
            border-color: rgba(26, 109, 227, 0.9) !important;
          }
          .editable-field:hover::after {
            content: "click to edit";
            position: absolute;
            top: -22px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            font-family: system-ui, sans-serif;
            background: #1a6de3;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            white-space: nowrap;
            pointer-events: none;
            z-index: 9999;
            font-weight: 500;
            letter-spacing: 0.01em;
          }
          .editable-field:focus {
            border-color: #1a6de3 !important;
            border-style: solid !important;
            box-shadow: 0 0 0 2px rgba(26, 109, 227, 0.2);
          }
        `}</style>
      )}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "10px 16px",
          background: "rgba(6, 26, 56, 0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(26, 109, 227, 0.3)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "13px",
        }}
      >
        {!isEditMode ? (
          <button
            onClick={toggleEditMode}
            style={{
              background: "#1a6de3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Mode
          </button>
        ) : (
          <>
            <span style={{ color: "rgba(255,255,255,0.6)", marginRight: "4px" }}>
              {pendingEdits.size > 0
                ? `${pendingEdits.size} unsaved change${pendingEdits.size > 1 ? "s" : ""}`
                : "Editing -- click any highlighted text"}
            </span>
            <button
              onClick={saveAll}
              disabled={isSaving}
              style={{
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "6px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: isSaving ? "wait" : "pointer",
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={cancelAll}
              disabled={isSaving}
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                padding: "6px 16px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </>
  );
}
