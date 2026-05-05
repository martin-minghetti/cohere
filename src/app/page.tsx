import Link from "next/link";
import { ArrowRight, RefreshCw, BarChart3, Pause } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPros } from "@/lib/queries";
import { formatDiscipline, formatPriceARS } from "@/lib/format";
import { db, schema } from "@/lib/db";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getProsWithCheapestPlan() {
  const pros = await getPros();
  return Promise.all(
    pros.map(async (pro) => {
      const [cheapest] = await db
        .select()
        .from(schema.plans)
        .where(eq(schema.plans.proId, pro.id))
        .orderBy(asc(schema.plans.pricePerMonth))
        .limit(1);
      return { pro, cheapest };
    }),
  );
}

export default async function HomePage() {
  const items = await getProsWithCheapestPlan();

  return (
    <>
      <SiteHeader />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-6 pt-20 pb-16 lg:px-8">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Demo · Mercado Pago Subscriptions
          </p>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
            Charge monthly memberships without fighting the integration.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Cohere connects yoga, pilates and wellness pros with their students through
            recurring Mercado Pago subscriptions. You teach. Money lands automatically.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <Link
              href="#pros"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse pros
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="https://github.com/martin-minghetti/cohere"
              target="_blank"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-[13px] font-medium transition-colors hover:bg-secondary"
            >
              Open source
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <Feature
              Icon={RefreshCw}
              title="Automatic monthly billing"
              body="MP charges the student's card each month. No chasing payments."
            />
            <Feature
              Icon={Pause}
              title="Pause and cancel"
              body="Students can pause or cancel from their portal. You see it instantly."
            />
            <Feature
              Icon={BarChart3}
              title="Real metrics"
              body="Active subscribers, MRR, churn. The data that actually informs decisions."
            />
          </div>
        </div>
      </section>

      <section id="pros" className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Pros on Cohere
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {items.length} available
            </p>
          </div>

          <ul className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map(({ pro, cheapest }) => (
              <li key={pro.id}>
                <Link
                  href={`/p/${pro.slug}`}
                  className="group flex flex-col gap-5 rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pro.avatarUrl}
                      alt={pro.name}
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold">
                        {pro.name}
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {formatDiscipline(pro.discipline)} · {pro.city}
                      </p>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                    {pro.bio}
                  </p>
                  <div className="flex items-baseline justify-between border-t border-border/60 pt-4 text-[13px]">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-medium text-foreground">
                      {cheapest ? formatPriceARS(cheapest.pricePerMonth) : "—"}
                      <span className="text-muted-foreground"> / mo</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function Feature({
  Icon,
  title,
  body,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
