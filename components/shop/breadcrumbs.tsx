import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-ink-mute">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((c, idx) => (
          <li key={`${c.label}-${idx}`} className="flex items-center gap-1.5">
            {c.href ? (
              <Link href={c.href} className="hover:text-primary transition-colors">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink font-medium">
                {c.label}
              </span>
            )}
            {idx < crumbs.length - 1 && (
              <Icon icon="chevron-right" className="text-ink-mute/60 text-xs" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
