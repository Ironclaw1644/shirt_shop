"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function AdminKeyboardShortcuts() {
  const router = useRouter();
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/") {
        e.preventDefault();
        (document.getElementById("admin-search") as HTMLInputElement | null)?.focus();
      }
      if (e.key === "c") {
        // Contextual create — route to products new
        router.push("/admin/products/new");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);
  return null;
}
