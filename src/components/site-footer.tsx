import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-serif text-base text-foreground">Cohere</span>{" "}
            · demo portfolio · no es un negocio real
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/martin-minghetti/cohere"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="https://github.com/martin-minghetti/cohere/blob/main/BUILD_LOG.md"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              BUILD_LOG
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
