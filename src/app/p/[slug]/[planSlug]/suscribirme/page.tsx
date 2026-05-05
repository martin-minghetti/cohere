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

      <section className="mx-auto max-w-md px-6 pt-12 pb-24 lg:px-8">
        <Link
          href={`/p/${pro.slug}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {pro.name}
        </Link>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          Subscribe
        </h1>

        <div className="mt-8 rounded-xl border border-border/60 bg-card p-5">
          <p className="text-[12px] text-muted-foreground">{pro.name}</p>
          <h2 className="mt-1 text-[15px] font-semibold">{plan.name}</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {plan.description}
          </p>
          <div className="mt-5 flex items-baseline justify-between border-t border-border/60 pt-4">
            <span className="text-[13px] text-muted-foreground">Monthly</span>
            <span className="text-xl font-semibold tracking-tight">
              {formatPriceARS(plan.pricePerMonth)}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border/60 bg-card p-5">
          <SubscribeForm proSlug={pro.slug} planSlug={plan.slug} />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
