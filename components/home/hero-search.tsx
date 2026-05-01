import { Icon } from "@/components/ui/icon";

/**
 * Big front-and-center homepage search bar. Sits directly under the navbar,
 * above the InkPressHero eyebrow. Submits GET to /search?q=…
 */
export function HeroSearch() {
  return (
    <section className="relative bg-paper border-b border-ink/5">
      <div className="container py-6 sm:py-8">
        <form
          action="/search"
          method="get"
          role="search"
          className="mx-auto w-full max-w-2xl"
        >
          <label htmlFor="hero-search" className="sr-only">
            What can we help you find today?
          </label>
          <div className="relative group">
            <Icon
              icon="magnifying-glass"
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-primary"
            />
            <input
              id="hero-search"
              type="search"
              name="q"
              placeholder="Hi! What can we help you find today?"
              autoComplete="off"
              className="h-14 sm:h-16 w-full rounded-full border-2 border-ink/10 bg-white pl-14 pr-32 sm:pr-36 text-base sm:text-lg text-ink placeholder:text-ink-mute placeholder:italic shadow-press transition-shadow focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-press-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 sm:h-12 items-center gap-2 rounded-full bg-primary px-5 sm:px-6 font-display font-semibold text-white text-sm sm:text-base shadow-press hover:bg-primary-700 hover:-translate-y-[1px] transition-all"
            >
              Search
              <Icon icon="arrow-right" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
