"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon";

type NavItem = { href: string; label: string; icon: string };

const EASE = [0.2, 0.7, 0.1, 1] as const;

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
  const reduced = useReducedMotion();

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

  const drawerInitial = reduced ? { x: 0, opacity: 0 } : { x: "100%" as const };
  const drawerAnimate = reduced ? { x: 0, opacity: 1 } : { x: 0 };
  const drawerExit = reduced ? { x: 0, opacity: 0 } : { x: "100%" as const };

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded text-paper hover:bg-paper/10"
      >
        <span
          className={`absolute inset-0 grid place-items-center transition-all duration-200 ${
            open ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
          }`}
          aria-hidden
        >
          <Icon icon="bars" />
        </span>
        <span
          className={`absolute inset-0 grid place-items-center transition-all duration-200 ${
            open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
          }`}
          aria-hidden
        >
          <Icon icon="xmark" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 top-[57px] z-40 bg-ink/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => setOpen(false)}
          >
            <motion.nav
              key="drawer"
              className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-ink text-paper p-3 overflow-y-auto shadow-2xl"
              aria-label="Admin mobile"
              initial={drawerInitial}
              animate={drawerAnimate}
              exit={drawerExit}
              transition={{ duration: 0.28, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="space-y-1 text-sm">
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded px-3 py-2.5 text-paper/85 hover:bg-paper/10 hover:text-paper transition-colors"
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
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
