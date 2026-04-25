"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon";

type NavItem = { href: string; label: string; icon: string };

export function AdminMobileNav({
  nav,
  userLabel,
  role,
}: {
  nav: NavItem[];
  userLabel: string;
  role: string;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded text-paper hover:bg-paper/10"
      >
        <Icon icon={open ? "xmark" : "bars"} />
      </button>

      {open && (
        <div
          className="fixed inset-0 top-[57px] z-40 bg-ink/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <nav
            className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-ink text-paper p-3 overflow-y-auto"
            aria-label="Admin mobile"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="space-y-1 text-sm">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded px-3 py-2.5 text-paper/85 hover:bg-paper/10 hover:text-paper"
                  >
                    <Icon icon={n.icon as IconName} className="w-4 text-accent" />
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 px-3 py-3 border-t border-paper/10 text-xs text-paper/60">
              <div className="truncate">{userLabel}</div>
              <div className="uppercase tracking-widest text-accent">{role}</div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
