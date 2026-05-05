import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, X, Pause, Play } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { getSubscriptionWithPlanAndPro } from "@/lib/queries";
import { formatPriceARS } from "@/lib/format";
import { pauseAction, resumeAction, cancelAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_META: Record<
  string,
  {
    label: string;
    tone: "ok" | "wait" | "err";
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  active: { label: "Active", tone: "ok", Icon: Check },
  pending: { label: "Pending authorization", tone: "wait", Icon: Clock },
  paused: { label: "Paused", tone: "wait", Icon: Pause },
  cancelled: { label: "Cancelled", tone: "err", Icon: X },
  failed: { label: "Rejected", tone: "err", Icon: X },
};

export default async function SubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getSubscriptionWithPlanAndPro(id);
  if (!data) notFound();
  const { sub, plan, pro } = data;

  const meta = STATUS_META[sub.status] ?? STATUS_META.pending;
  const StatusIcon = meta.Icon;
  const isActive = sub.status === "active";
  const isPaused = sub.status === "paused";
  const isCancellable = sub.status === "active" || sub.status === "paused";

  const pauseBound = pauseAction.bind(null, sub.id);
  const resumeBound = resumeAction.bind(null, sub.id);
  const cancelBound = cancelAction.bind(null, sub.id);

  return (
    <>
      <SiteHeader />

      <section className="mx-auto max-w-md px-6 pt-12 pb-24 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-md ${
              meta.tone === "ok"
                ? "bg-primary/10 text-primary"
                : meta.tone === "wait"
                  ? "bg-secondary text-foreground"
                  : "bg-destructive/10 text-destructive"
            }`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
          </span>
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {meta.label}
          </p>
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          {isActive
            ? `You're in, ${sub.subscriberName.split(" ")[0]}.`
            : isPaused
              ? "Subscription paused"
              : sub.status === "cancelled"
                ? "Subscription cancelled"
                : sub.status === "failed"
                  ? "Payment not confirmed"
                  : "Awaiting authorization"}
        </h1>

        {isActive && sub.nextBillingDate && (
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Next charge:{" "}
            <span className="font-medium text-foreground">
              {sub.nextBillingDate}
            </span>
          </p>
        )}

        <div className="mt-8 rounded-xl border border-border/60 bg-card p-5">
          <Link
            href={`/p/${pro.slug}`}
            className="text-[12px] text-muted-foreground hover:text-foreground"
          >
            {pro.name}
          </Link>
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

        {(isActive || isPaused) && (
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            {isActive && (
              <form action={pauseBound} className="flex-1">
                <Button
                  type="submit"
                  variant="outline"
                  className="h-10 w-full rounded-md text-[13px] font-medium"
                >
                  <Pause className="mr-2 h-3.5 w-3.5" />
                  Pause
                </Button>
              </form>
            )}
            {isPaused && (
              <form action={resumeBound} className="flex-1">
                <Button
                  type="submit"
                  className="h-10 w-full rounded-md text-[13px] font-medium"
                >
                  <Play className="mr-2 h-3.5 w-3.5" />
                  Resume
                </Button>
              </form>
            )}
            {isCancellable && (
              <form action={cancelBound} className="flex-1">
                <Button
                  type="submit"
                  variant="outline"
                  className="h-10 w-full rounded-md text-[13px] font-medium text-destructive hover:text-destructive"
                >
                  <X className="mr-2 h-3.5 w-3.5" />
                  Cancel subscription
                </Button>
              </form>
            )}
          </div>
        )}

        <Link
          href={`/p/${pro.slug}`}
          className="mt-10 inline-block text-[12px] text-muted-foreground hover:text-foreground"
        >
          ← Back to profile
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}
