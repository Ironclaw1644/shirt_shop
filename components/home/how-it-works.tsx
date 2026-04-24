import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Choose your product",
    body:
      "Search 5,000+ SKUs. Filter by method, brand, or quantity. Need something we don't list? Ask — odds are we can make it.",
    art: "how-it-works-choose",
  },
  {
    number: "02",
    title: "Customize & proof",
    body:
      "Upload artwork or use our in-browser Designer. We generate a digital proof for your approval before the press runs.",
    art: "how-it-works-customize",
  },
  {
    number: "03",
    title: "We print, pack, ship",
    body:
      "Locally printed in Georgia, packed, and out the door — many jobs same-day or in a few hours. Local pickup across metro Atlanta; nationwide flat-rate shipping on standard items.",
    art: "how-it-works-ship",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-paper">
      <div className="container">
        <div className="max-w-2xl mb-14">
          <Eyebrow tone="crimson">Three steps, one press</Eyebrow>
          <h2 className="heading-display mt-3 text-4xl sm:text-5xl lg:text-6xl text-ink">
            How it works
          </h2>
        </div>

        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="group relative flex flex-col rounded-lg border border-ink/10 bg-card overflow-hidden shadow-press hover:shadow-press-lg transition-shadow"
            >
              <div className="relative aspect-[4/3] bg-paper-warm overflow-hidden">
                <Image
                  src={`/images/generated/${step.art}.webp`}
                  alt={step.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <span className="absolute top-4 left-4 font-display text-6xl font-black text-primary opacity-90 [text-shadow:2px_2px_0_#FAFAF7]">
                  {step.number}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-ink-soft leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link href="/custom-printing">
              Start with printing <Icon icon="arrow-right" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/apparel-headwear">Browse apparel</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
