import Link from "next/link";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-medium tracking-tight"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Cohere
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
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
