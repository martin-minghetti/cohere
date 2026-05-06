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

      <section className="mx-auto max-w-xl px-6 pt-12 pb-24 lg:px-10">
        <div className="flex gap-3 rounded-md border border-amber-300/70 bg-amber-50/80 p-4 text-[12px] leading-relaxed text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div>
            <p className="font-semibold uppercase tracking-[0.14em]">
              Modo demo · sin pago real
            </p>
            <p className="mt-1 text-amber-900/85">
              El backend integra el flow completo de Mercado Pago Subscriptions
              (preapproval_plan + preapproval + webhook). El pago en sí está
              simulado para que cualquiera pruebe la UX sin tarjeta.
            </p>
          </div>
        </div>

        <h1 className="mt-10 text-4xl font-semibold tracking-tight md:text-5xl">
          Autorizá tu suscripción
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          Si autorizás, vamos a debitarte automáticamente cada mes. Podés
          cancelar cuando quieras.
        </p>

        <div className="mt-10 rounded-md border border-border bg-card p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {pro.name}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{plan.name}</h2>

          <dl className="mt-6 space-y-3 border-t border-border/60 pt-5 text-[14px]">
            <Row label="A nombre de" value={sub.subscriberName} />
            <Row label="Email" value={sub.subscriberEmail} />
            <Row
              label="Cobro mensual"
              value={formatPriceARS(plan.pricePerMonth)}
              bold
            />
          </dl>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <form action={authorize} className="flex-1">
            <Button
              type="submit"
              className="h-12 w-full rounded-md bg-primary text-[12px] font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary/90"
            >
              <Check className="mr-2 h-3.5 w-3.5" />
              Autorizar (demo)
            </Button>
          </form>
          <form action={reject} className="sm:w-auto">
            <Button
              type="submit"
              variant="outline"
              className="h-12 w-full rounded-md border-border text-[12px] font-semibold uppercase tracking-[0.16em] sm:w-auto"
            >
              <X className="mr-2 h-3.5 w-3.5" />
              Rechazar
            </Button>
          </form>
        </div>

        <Link
          href={`/p/${pro.slug}`}
          className="mt-10 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          ← Volver al perfil
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
      <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className={bold ? "text-lg font-semibold" : "font-medium"}>
        {value}
      </dd>
    </div>
  );
}
