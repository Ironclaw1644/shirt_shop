import { AdminPageHeader } from "@/components/admin/page-header";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const blocks = [
  { key: "hero", label: "Homepage hero", icon: "image" },
  { key: "capabilities", label: "Capabilities strip", icon: "layer-group" },
  { key: "featured", label: "Featured products", icon: "star" },
  { key: "banners", label: "Site banners", icon: "flag" },
  { key: "city-pages", label: "City landing copy", icon: "map-pin" },
];

export default function AdminContent() {
  return (
    <div>
      <AdminPageHeader title="Content" subtitle="Edit homepage blocks, banners, and city landing copy." />
      <div className="p-4 sm:p-6 lg:p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map((b) => (
          <Link
            key={b.key}
            href={`/admin/content/${b.key}`}
            className="group rounded-lg border border-ink/10 bg-white p-6 hover:-translate-y-0.5 hover:shadow-press-lg transition-all"
          >
            <Icon icon={b.icon as never} className="text-2xl text-primary" />
            <p className="mt-3 font-display text-lg font-bold">{b.label}</p>
            <p className="mt-1 text-xs text-ink-mute group-hover:text-primary">
              Edit block →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
