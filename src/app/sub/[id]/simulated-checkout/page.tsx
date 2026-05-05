import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Info, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { getSubscriptionWithPlanAndPro } from "@/lib/queries";
import { validateSubscriptionToken } from "@/lib/subscription-token";
import { formatPriceARS } from "@/lib/format";
import { simulatePreapprovalAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SimulatedCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t: token } = await searchParams;
  const validation = validateSubscriptionToken(id, token);
  if (!validation.ok) notFound();

  const data = await getSubscriptionWithPlanAndPro(id);
  if (!data) notFound();
  const { sub, plan, pro } = data;

  const tokenStr = token ?? "";
  const authorize = simulatePreapprovalAction.bind(
    null,
    sub.id,
    "authorized",
    tokenStr,
  );
  const reject = simulatePreapprovalAction.bind(
    null,
    sub.id,
    "rejected",
    tokenStr,
  );

  return (
    <>
      <SiteHeader />

      <section className="mx-auto max-w-md px-6 pt-12 pb-24 lg:px-8">
        <div className="flex gap-2.5 rounded-md border border-amber-300/70 bg-amber-50/70 p-3.5 text-[12px] leading-relaxed text-amber-900">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
          <div>
            <p className="font-medium">Demo mode · no real charge</p>
            <p className="mt-0.5 text-amber-900/80">
              The backend integrates the full preapproval_plan + preapproval +
              webhook flow. The actual payment is simulated so anyone can
              exercise the UX without a card.
            </p>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          Authorize your subscription
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          If you authorize, the card on file will be charged monthly.
        </p>

        <div className="mt-8 rounded-xl border border-border/60 bg-card p-5">
          <p className="text-[12px] text-muted-foreground">{pro.name}</p>
          <h2 className="mt-1 text-[15px] font-semibold">{plan.name}</h2>

          <dl className="mt-5 space-y-2.5 border-t border-border/60 pt-4 text-[13px]">
            <Row label="Subscriber" value={sub.subscriberName} />
            <Row label="Email" value={sub.subscriberEmail} />
            <Row
              label="Monthly"
              value={formatPriceARS(plan.pricePerMonth)}
              bold
            />
          </dl>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <form action={authorize} className="flex-1">
            <Button
              type="submit"
              className="h-10 w-full rounded-md text-[13px] font-medium"
            >
              <Check className="mr-2 h-3.5 w-3.5" />
              Authorize (demo)
            </Button>
          </form>
          <form action={reject} className="sm:w-auto">
            <Button
              type="submit"
              variant="outline"
              className="h-10 w-full rounded-md text-[13px] font-medium sm:w-auto"
            >
              <X className="mr-2 h-3.5 w-3.5" />
              Reject
            </Button>
          </form>
        </div>

        <Link
          href={`/p/${pro.slug}`}
          className="mt-8 inline-block text-[12px] text-muted-foreground hover:text-foreground"
        >
          ← Back to profile
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={bold ? "text-base font-semibold" : "font-medium"}>
        {value}
      </dd>
    </div>
  );
}
