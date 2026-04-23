import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { siteConfig } from "@/lib/site-config";
import { ContactForm } from "@/components/shop/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Georgia Print Hub team in Alpharetta, GA.",
};

export default function ContactPage() {
  return (
    <div className="container py-16 grid lg:grid-cols-2 gap-12">
      <div>
        <Eyebrow tone="crimson">Say hi</Eyebrow>
        <h1 className="heading-display mt-3 text-5xl text-ink">
          Let&rsquo;s talk printing.
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Send a note, request a quote, or drop by the Alpharetta shop.
        </p>

        <div className="mt-8 space-y-3 text-ink-soft">
          <p className="flex items-center gap-3">
            <Icon icon="location-dot" className="text-primary" /> Alpharetta, GA — serving North Georgia
          </p>
          {siteConfig.phone && (
            <p className="flex items-center gap-3">
              <Icon icon="phone" className="text-primary" /> {siteConfig.phone}
            </p>
          )}
          <p className="flex items-center gap-3">
            <Icon icon="envelope-open-text" className="text-primary" /> {siteConfig.email}
          </p>
          <p className="flex items-center gap-3">
            <Icon icon="clock" className="text-primary" /> Mon–Fri {siteConfig.hours.weekdays}
          </p>
        </div>

        <div className="mt-8 aspect-[4/3] rounded-lg overflow-hidden border border-ink/10 bg-paper-warm">
          <iframe
            aria-label="Alpharetta map"
            className="w-full h-full"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-84.378%2C34.057%2C-84.243%2C34.120&layer=mapnik"
          />
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
