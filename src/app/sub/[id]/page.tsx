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
  { label: string; tone: "ok" | "wait" | "err"; Icon: React.ComponentType<{ className?: string }> }
> = {
  active: { label: "Activa", tone: "ok", Icon: Check },
  pending: { label: "Pendiente de autorización", tone: "wait", Icon: Clock },
  paused: { label: "Pausada", tone: "wait", Icon: Pause },
  cancelled: { label: "Cancelada", tone: "err", Icon: X },
  failed: { label: "Rechazada", tone: "err", Icon: X },
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

      <section className="mx-auto max-w-2xl px-6 pt-16 pb-32 lg:px-10">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              meta.tone === "ok"
                ? "bg-primary text-primary-foreground"
                : meta.tone === "wait"
                  ? "bg-secondary text-foreground"
                  : "bg-destructive/15 text-destructive"
            }`}
          >
            <StatusIcon className="h-6 w-6" />
          </span>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {meta.label}
          </p>
        </div>

        <h1 className="mt-6 font-serif text-4xl leading-[1.1] md:text-5xl">
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
          <p className="mt-3 text-lg text-foreground/80">
            Próximo cobro:{" "}
            <span className="font-medium text-foreground">
              {sub.nextBillingDate}
            </span>
          </p>
        )}

        <div className="mt-10 rounded-2xl border border-border/60 bg-card p-7 shadow-sm">
          <Link
            href={`/p/${pro.slug}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {pro.name}
          </Link>
          <h2 className="mt-1 font-serif text-2xl">{plan.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {plan.description}
          </p>
          <div className="mt-7 flex items-baseline justify-between border-t border-border/40 pt-6">
            <span className="text-sm text-muted-foreground">
              Cobro mensual
            </span>
            <span className="font-serif text-3xl">
              {formatPriceARS(plan.pricePerMonth)}
            </span>
          </div>
        </div>

        {(isActive || isPaused) && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {isActive && (
              <form action={pauseBound} className="flex-1">
                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full text-base"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar
                </Button>
              </form>
            )}
            {isPaused && (
              <form action={resumeBound} className="flex-1">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full text-base"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Reanudar
                </Button>
              </form>
            )}
            {isCancellable && (
              <form action={cancelBound} className="flex-1">
                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full text-base text-destructive hover:text-destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar suscripción
                </Button>
              </form>
            )}
          </div>
        )}

        <Link
          href={`/p/${pro.slug}`}
          className="mt-12 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Volver al perfil
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}
