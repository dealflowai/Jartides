"use client";

import { useEffect } from "react";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("admin-mode");
    return () => {
      document.body.classList.remove("admin-mode");
    };
  }, []);

  return <>{children}</>;
}
