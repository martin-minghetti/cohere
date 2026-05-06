import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link
          href="/"
          className="flex items-center text-[15px] font-semibold uppercase tracking-[0.18em]"
        >
          Cohere
        </Link>
        <nav className="flex items-center gap-6 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Profesionales
          </Link>
          <Link
            href="https://github.com/martin-minghetti/cohere"
            target="_blank"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </header>
  );
}
