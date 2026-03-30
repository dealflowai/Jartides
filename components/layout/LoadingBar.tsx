"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the bar briefly on route change
    setLoading(true);
    setVisible(true);

    const fadeTimer = setTimeout(() => {
      setLoading(false);
    }, 600);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]">
      <div
        className={`h-full bg-gradient-to-r from-[#1a6de3] to-[#4a9ff5] transition-opacity duration-300 ${
          loading ? "loading-bar opacity-100" : "opacity-0 w-full"
        }`}
      />
    </div>
  );
}
