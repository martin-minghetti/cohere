import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-3 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-medium text-foreground">Cohere</span> · portfolio demo · not a real business
          </p>
          <div className="flex items-center gap-5">
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
              Build log
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
