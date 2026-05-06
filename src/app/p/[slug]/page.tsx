import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
        <div className="mx-auto max-w-5xl px-6 pt-12 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Profesionales
          </Link>

          <div className="mt-12 grid gap-10 md:grid-cols-[auto_1fr] md:items-end">
            <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-md bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pro.avatarUrl}
                alt={pro.name}
                className="h-full w-full object-cover grayscale"
              />
            </div>
            <div className="pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                {formatDiscipline(pro.discipline)} · {pro.city}
              </p>
              <h1 className="mt-3 text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                {pro.name}
              </h1>
              <p className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <span>
                  {activeCount} suscriptor{activeCount === 1 ? "" : "es"} activos
                </span>
                <span aria-hidden>·</span>
                <span>
                  {plans.length} plan{plans.length === 1 ? "" : "es"}
                </span>
              </p>
            </div>
          </div>

          <p className="mt-12 max-w-3xl pb-16 text-[16px] leading-relaxed text-foreground/85 md:pb-20">
            {pro.bio}
          </p>
        </div>
      </section>

      <section className="bg-secondary/40">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Membresías
            </h2>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {plans.length} planes
            </p>
          </div>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            Suscribite y se debita automáticamente cada mes. Pausá o cancelá
            cuando quieras desde tu portal.
          </p>

          <div className="mt-12 space-y-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`group relative flex flex-col gap-5 rounded-md border bg-card p-6 transition-colors md:flex-row md:items-center md:gap-8 md:p-8 ${
                  plan.featured
                    ? "border-accent/60 bg-accent/[0.04]"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-semibold tracking-tight">
                      {plan.name}
                    </h3>
                    {plan.featured ? (
                      <span className="rounded-sm bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-foreground">
                        Recomendado
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground md:max-w-xl">
                    {plan.description}
                  </p>
                </div>
                <div className="flex flex-row items-end justify-between gap-6 md:flex-col md:items-end md:justify-center">
                  <p className="leading-none">
                    <span className="text-3xl font-semibold tracking-tight">
                      {formatPriceARS(plan.pricePerMonth)}
                    </span>
                    <span className="ml-1 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      / mes
                    </span>
                  </p>
                  <Link
                    href={`/p/${pro.slug}/${plan.slug}/suscribirme`}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Me suscribo
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
