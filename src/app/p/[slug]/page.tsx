import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getProBySlug, getPlansForPro } from "@/lib/queries";
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

  const plans = await getPlansForPro(pro.id);

  return (
    <>
      <SiteHeader />

      <section className="relative">
        <div className="relative h-[40vh] min-h-[320px] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pro.coverUrl}
            alt={pro.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background" />
        </div>

        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="-mt-20 flex items-end gap-6">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pro.avatarUrl}
                alt={pro.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pb-2">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-primary">
                {formatDiscipline(pro.discipline)} · {pro.city}
              </span>
              <h1 className="mt-3 font-serif text-5xl tracking-tight md:text-6xl">
                {pro.name}
              </h1>
            </div>
          </div>

          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-foreground/85">
            {pro.bio}
          </p>
        </div>
      </section>

      <section className="border-t border-border/40 bg-secondary/30">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
          <h2 className="font-serif text-4xl tracking-tight">Planes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Suscribite y se debita automáticamente cada mes. Cancelás cuando
            quieras.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-card p-7 transition-shadow hover:shadow-md ${
                  plan.featured
                    ? "border-primary/60 shadow-sm"
                    : "border-border/60"
                }`}
              >
                {plan.featured ? (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-0.5 text-[11px] font-medium uppercase tracking-[0.15em] text-primary-foreground">
                    Recomendado
                  </span>
                ) : null}
                <h3 className="font-serif text-2xl">{plan.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-7 flex items-baseline gap-1.5">
                  <span className="font-serif text-4xl">
                    {formatPriceARS(plan.pricePerMonth)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ mes</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-foreground/85">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Cobro automático mensual
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Pausa o cancelación cuando quieras
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Pagás vía Mercado Pago
                  </li>
                </ul>
                <div className="mt-auto pt-7">
                  <Link
                    href={`/p/${pro.slug}/${plan.slug}/suscribirme`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Suscribirme
                    <ArrowRight className="h-4 w-4" />
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
