"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-ink group-[.toaster]:border-ink/10 group-[.toaster]:shadow-press-lg",
          description: "group-[.toast]:text-ink-mute",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-surface group-[.toast]:text-ink",
        },
      }}
    />
  );
}
