import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPlanByProAndSlug } from "@/lib/queries";
import { formatPriceARS } from "@/lib/format";
import { SubscribeForm } from "./subscribe-form";

export const dynamic = "force-dynamic";

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ slug: string; planSlug: string }>;
}) {
  const { slug, planSlug } = await params;
  const data = await getPlanByProAndSlug(slug, planSlug);
  if (!data) notFound();
  const { plan, pro } = data;

  return (
    <>
      <SiteHeader />

      <section className="mx-auto max-w-xl px-6 pt-12 pb-24 lg:px-10">
        <Link
          href={`/p/${pro.slug}`}
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {pro.name}
        </Link>

        <h1 className="mt-10 text-4xl font-semibold tracking-tight md:text-5xl">
          Confirmá tu suscripción
        </h1>

        <div className="mt-10 rounded-md border border-border bg-card p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {pro.name}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{plan.name}</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            {plan.description}
          </p>
          <div className="mt-6 flex items-baseline justify-between border-t border-border/60 pt-5">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Cobro mensual
            </span>
            <span className="text-2xl font-semibold tracking-tight">
              {formatPriceARS(plan.pricePerMonth)}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-md border border-border bg-card p-6">
          <SubscribeForm proSlug={pro.slug} planSlug={plan.slug} />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
