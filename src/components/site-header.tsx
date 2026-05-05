import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span className="inline-block h-5 w-5 rounded-md bg-primary" />
          Cohere
        </Link>
        <nav className="flex items-center gap-5 text-[13px] text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Pros
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
