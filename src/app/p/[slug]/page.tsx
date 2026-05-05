import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  getProBySlug,
  getPlansForPro,
  getActiveSubscribersCount,
} from "@/lib/queries";
import { formatDiscipline, formatPriceARS } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pro = await getProBySlug(slug);
  if (!pro) notFound();

  const [plans, activeCount] = await Promise.all([
    getPlansForPro(pro.id),
    getActiveSubscribersCount(pro.id),
  ]);

  return (
    <>
      <SiteHeader />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-6 pt-12 pb-16 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All pros
          </Link>

          <div className="mt-8 flex items-start gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pro.avatarUrl}
              alt={pro.name}
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-semibold tracking-tight">
                {pro.name}
              </h1>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                {formatDiscipline(pro.discipline)} · {pro.city}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">
                    {activeCount}
                  </span>{" "}
                  active subscriber{activeCount === 1 ? "" : "s"}
                </span>
                <span aria-hidden className="hidden sm:inline">
                  ·
                </span>
                <span>{plans.length} plan{plans.length === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-[15px] leading-relaxed text-foreground/85">
            {pro.bio}
          </p>
        </div>
      </section>

      <section className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight">
            Membership plans
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Subscribe and the card is charged monthly. Cancel anytime.
          </p>

          <div className="mt-8 space-y-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex flex-col gap-4 rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm md:flex-row md:items-center md:gap-6 ${
                  plan.featured ? "border-primary/60" : "border-border/60"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold">{plan.name}</h3>
                    {plan.featured ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-primary">
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {plan.description}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                    <Bullet>Auto-billed monthly</Bullet>
                    <Bullet>Pause or cancel anytime</Bullet>
                    <Bullet>Mercado Pago checkout</Bullet>
                  </ul>
                </div>
                <div className="flex flex-row items-center justify-between gap-5 md:flex-col md:items-end md:justify-center">
                  <p className="text-[15px]">
                    <span className="text-2xl font-semibold tracking-tight">
                      {formatPriceARS(plan.pricePerMonth)}
                    </span>
                    <span className="ml-1 text-[13px] text-muted-foreground">
                      / mo
                    </span>
                  </p>
                  <Link
                    href={`/p/${pro.slug}/${plan.slug}/suscribirme`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Subscribe
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <Check className="h-3 w-3 text-primary" />
      {children}
    </li>
  );
}
