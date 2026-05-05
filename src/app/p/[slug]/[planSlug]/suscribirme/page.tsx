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

      <section className="mx-auto max-w-2xl px-6 pt-12 pb-32 lg:px-10">
        <Link
          href={`/p/${pro.slug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a {pro.name}
        </Link>

        <h1 className="mt-8 font-serif text-4xl tracking-tight md:text-5xl">
          Suscribirme
        </h1>

        <div className="mt-10 rounded-2xl border border-border/60 bg-card p-7 shadow-sm">
          <p className="text-sm text-muted-foreground">{pro.name}</p>
          <h2 className="mt-1 font-serif text-2xl">{plan.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {plan.description}
          </p>
          <div className="mt-7 flex items-baseline justify-between border-t border-border/40 pt-6">
            <span className="text-sm text-muted-foreground">Cobro mensual</span>
            <span className="font-serif text-3xl">
              {formatPriceARS(plan.pricePerMonth)}
            </span>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border/60 bg-card p-7 shadow-sm">
          <SubscribeForm proSlug={pro.slug} planSlug={plan.slug} />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
