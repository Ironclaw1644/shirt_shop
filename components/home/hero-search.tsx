import { Icon } from "@/components/ui/icon";

/**
 * Big front-and-center homepage search bar. Sits directly under the navbar,
 * above the InkPressHero eyebrow. Submits GET to /search?q=…
 */
export function HeroSearch() {
  return (
    <section className="relative bg-paper border-b border-ink/5">
      <div className="container py-4 sm:py-5">
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
              className="pointer-events-none absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-lg sm:text-xl text-primary"
            />
            <input
              id="hero-search"
              type="search"
              name="q"
              placeholder="Hi! What can we help you find today?"
              autoComplete="off"
              className="h-12 sm:h-16 w-full rounded-full border-2 border-ink/10 bg-white pl-11 sm:pl-14 pr-14 sm:pr-36 text-sm sm:text-lg text-ink placeholder:text-ink-mute placeholder:italic shadow-press transition-shadow focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-press-lg"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 sm:h-12 sm:w-auto items-center justify-center sm:gap-2 rounded-full bg-primary sm:px-6 font-display font-semibold text-white text-base shadow-press hover:bg-primary-700 hover:-translate-y-[1px] transition-all"
            >
              <span className="hidden sm:inline">Search</span>
              <Icon icon="arrow-right" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
