import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, X, Pause, Play } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { getSubscriptionWithPlanAndPro } from "@/lib/queries";
import { validatePortalToken } from "@/lib/subscription-token";
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
  active: { label: "Activa", tone: "ok", Icon: Check },
  pending: { label: "Pendiente", tone: "wait", Icon: Clock },
  paused: { label: "Pausada", tone: "wait", Icon: Pause },
  cancelled: { label: "Cancelada", tone: "err", Icon: X },
  failed: { label: "Rechazada", tone: "err", Icon: X },
};

export default async function SubscriptionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t: token } = await searchParams;
  const validation = validatePortalToken(id, token);
  if (!validation.ok) notFound();

  const data = await getSubscriptionWithPlanAndPro(id);
  if (!data) notFound();
  const { sub, plan, pro } = data;

  const meta = STATUS_META[sub.status] ?? STATUS_META.pending;
  const StatusIcon = meta.Icon;
  const isActive = sub.status === "active";
  const isPaused = sub.status === "paused";
  const isCancellable = sub.status === "active" || sub.status === "paused";

  const tokenStr = token ?? "";
  const pauseBound = pauseAction.bind(null, sub.id, tokenStr);
  const resumeBound = resumeAction.bind(null, sub.id, tokenStr);
  const cancelBound = cancelAction.bind(null, sub.id, tokenStr);

  return (
    <>
      <SiteHeader />

      <section className="mx-auto max-w-xl px-6 pt-14 pb-24 lg:px-10">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-sm ${
              meta.tone === "ok"
                ? "bg-accent text-accent-foreground"
                : meta.tone === "wait"
                  ? "bg-secondary text-foreground"
                  : "bg-destructive/10 text-destructive"
            }`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {meta.label}
          </p>
        </div>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
          {isActive
            ? `Listo, ${sub.subscriberName.split(" ")[0]}.`
            : isPaused
              ? "Suscripción pausada"
              : sub.status === "cancelled"
                ? "Suscripción cancelada"
                : sub.status === "failed"
                  ? "No pudimos confirmar el pago"
                  : "Esperando autorización"}
        </h1>

        {isActive && sub.nextBillingDate && (
          <p className="mt-3 text-[14px] text-muted-foreground">
            Próximo cobro:{" "}
            <span className="font-semibold text-foreground">
              {sub.nextBillingDate}
            </span>
          </p>
        )}

        <div className="mt-10 rounded-md border border-border bg-card p-6">
          <Link
            href={`/p/${pro.slug}`}
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            {pro.name}
          </Link>
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

        {(isActive || isPaused) && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {isActive && (
              <form action={pauseBound} className="flex-1">
                <Button
                  type="submit"
                  variant="outline"
                  className="h-11 w-full rounded-md border-border text-[12px] font-semibold uppercase tracking-[0.16em]"
                >
                  <Pause className="mr-2 h-3.5 w-3.5" />
                  Pausar
                </Button>
              </form>
            )}
            {isPaused && (
              <form action={resumeBound} className="flex-1">
                <Button
                  type="submit"
                  className="h-11 w-full rounded-md bg-primary text-[12px] font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="mr-2 h-3.5 w-3.5" />
                  Reanudar
                </Button>
              </form>
            )}
            {isCancellable && (
              <form action={cancelBound} className="flex-1">
                <Button
                  type="submit"
                  variant="outline"
                  className="h-11 w-full rounded-md border-border text-[12px] font-semibold uppercase tracking-[0.16em] text-destructive hover:text-destructive"
                >
                  <X className="mr-2 h-3.5 w-3.5" />
                  Cancelar suscripción
                </Button>
              </form>
            )}
          </div>
        )}

        <Link
          href={`/p/${pro.slug}`}
          className="mt-12 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          ← Volver al perfil
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}
