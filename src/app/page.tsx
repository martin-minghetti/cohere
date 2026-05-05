import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, RefreshCw, Wallet, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPros } from "@/lib/queries";
import { formatDiscipline, formatPriceARS } from "@/lib/format";
import { db, schema } from "@/lib/db";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getProsWithCheapestPlan() {
  const pros = await getPros();
  return Promise.all(
    pros.map(async (pro) => {
      const [cheapest] = await db
        .select()
        .from(schema.plans)
        .where(eq(schema.plans.proId, pro.id))
        .orderBy(asc(schema.plans.pricePerMonth))
        .limit(1);
      return { pro, cheapest };
    }),
  );
}

export default async function HomePage() {
  const items = await getProsWithCheapestPlan();

  return (
    <>
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-32 lg:px-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3 w-3" />
            Demo · Mercado Pago Subscriptions
          </div>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Cobrá tu membresía mensual sin pelearte con la integración.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Cohere conecta a profesionales de yoga, pilates y wellness con sus
            alumnos vía suscripciones recurrentes de Mercado Pago. Vos das
            clases. La plata entra automática.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="#profesionales"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ver profesionales
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="https://github.com/martin-minghetti/cohere"
              target="_blank"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Código abierto
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border/40 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-12 md:grid-cols-3">
            <Feature
              Icon={RefreshCw}
              title="Cobro automático mensual"
              body="MP debita la tarjeta del alumno cada mes. No persigas pagos, no mandes recordatorios."
            />
            <Feature
              Icon={Wallet}
              title="Pausa y cancelación real"
              body="El alumno puede pausar o darse de baja desde su portal. Vos te enterás al instante."
            />
            <Feature
              Icon={Users}
              title="Dashboard con métricas reales"
              body="Subscribers activos, ingreso mensual, churn. La data que importa para decidir."
            />
          </div>
        </div>
      </section>

      <section id="profesionales" className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-4xl tracking-tight md:text-5xl">
              Profesionales en Cohere
            </h2>
            <p className="text-sm text-muted-foreground">
              {items.length} disponibles
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map(({ pro, cheapest }) => (
              <Link
                key={pro.id}
                href={`/p/${pro.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pro.coverUrl}
                    alt={pro.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-foreground backdrop-blur">
                    {formatDiscipline(pro.discipline)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-2xl">{pro.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {pro.city}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {pro.bio}
                  </p>
                  <div className="mt-6 flex items-baseline justify-between border-t border-border/40 pt-5">
                    <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      desde
                    </span>
                    <span className="font-serif text-2xl">
                      {cheapest
                        ? formatPriceARS(cheapest.pricePerMonth)
                        : "—"}
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        / mes
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function Feature({
  Icon,
  title,
  body,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 font-serif text-2xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
