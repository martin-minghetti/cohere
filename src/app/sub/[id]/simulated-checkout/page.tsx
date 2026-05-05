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

      <section className="mx-auto max-w-2xl px-6 pt-12 pb-32 lg:px-10">
        <div className="rounded-xl border border-amber-300/60 bg-amber-50/80 p-5 text-sm">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div className="space-y-1">
              <p className="font-medium text-amber-900">
                Modo demo · no se procesa pago real
              </p>
              <p className="leading-relaxed text-amber-800/90">
                Esta es una simulación de Mercado Pago Subscriptions. El backend
                integra el flow completo (preapproval_plan + preapproval +
                webhook), pero los pagos están simulados para que cualquiera
                pruebe la UX sin tarjeta real.
              </p>
            </div>
          </div>
        </div>

        <h1 className="mt-10 font-serif text-4xl leading-[1.1] md:text-5xl">
          Autorizá tu suscripción
        </h1>
        <p className="mt-3 text-lg text-foreground/80">
          Si autorizás, vamos a debitarte automáticamente cada mes.
        </p>

        <div className="mt-10 rounded-2xl border border-border/60 bg-card p-7 shadow-sm">
          <p className="text-sm text-muted-foreground">{pro.name}</p>
          <h2 className="mt-1 font-serif text-2xl">{plan.name}</h2>

          <dl className="mt-7 space-y-4 text-sm">
            <Row label="A nombre de" value={sub.subscriberName} />
            <Row label="Email" value={sub.subscriberEmail} />
            <Row
              label="Cobro mensual"
              value={formatPriceARS(plan.pricePerMonth)}
              bold
            />
          </dl>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto]">
          <form action={authorize}>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full text-base"
            >
              <Check className="mr-2 h-4 w-4" />
              Autorizar suscripción (demo)
            </Button>
          </form>
          <form action={reject}>
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full rounded-full text-base sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Simular rechazo
            </Button>
          </form>
        </div>

        <Link
          href={`/p/${pro.slug}`}
          className="mt-8 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
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
    <div className="flex items-center justify-between border-b border-border/40 pb-3 last:border-none">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={bold ? "font-serif text-lg" : "font-medium"}>{value}</dd>
    </div>
  );
}
