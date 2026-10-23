import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">N</span>
          <span className="font-display text-lg font-bold tracking-tight">Niche Finder</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-5">
          <Link to="/" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground [&.active]:text-primary">
            Analyzer
          </Link>
          <Link to="/pricing" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground [&.active]:text-primary">
            Pricing
          </Link>
          <Link to="/pricing" className="hidden rounded-xl bg-primary px-4 py-2 font-display text-sm font-bold text-primary-foreground transition hover:opacity-90 sm:inline-block">
            Get access
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Niche Finder — built for AI automation agencies.</p>
        <div className="flex gap-5">
          <Link to="/" className="transition hover:text-foreground">Analyzer</Link>
          <Link to="/pricing" className="transition hover:text-foreground">Pricing</Link>
        </div>
      </div>
    </footer>
  );
}
