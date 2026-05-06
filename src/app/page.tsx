import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPros } from "@/lib/queries";
import { formatDiscipline, formatPriceARS } from "@/lib/format";
import { db, schema } from "@/lib/db";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1400&q=80&auto=format&fit=crop";

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

      <section className="border-b border-border/60">
        <div className="mx-auto grid max-w-7xl gap-0 px-0 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-center px-6 py-20 lg:px-10 lg:py-32">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Demo · MP Subscriptions
            </p>
            <h1 className="mt-5 text-balance text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
              Tu práctica,
              <br />
              todos los días.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Cohere conecta a profesionales de yoga, pilates y wellness con
              sus alumnos vía suscripciones recurrentes de Mercado Pago. Vos
              das clases. La plata entra automática.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="#profesionales"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Ver profesionales
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="https://github.com/martin-minghetti/cohere"
                target="_blank"
                className="inline-flex h-12 items-center gap-2 rounded-md border border-border bg-background px-6 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-secondary"
              >
                Código abierto
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden bg-muted lg:aspect-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMAGE}
              alt="Práctica"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="grid gap-12 md:grid-cols-3">
            <Stat
              value="01"
              title="Cobro automático mensual"
              body="MP debita la tarjeta del alumno cada mes. No persigas pagos."
            />
            <Stat
              value="02"
              title="Pausa y cancelación real"
              body="El alumno opera desde su portal. Vos te enterás al instante."
            />
            <Stat
              value="03"
              title="Métricas reales"
              body="Suscriptores activos, MRR, churn. La data que importa."
            />
          </div>
        </div>
      </section>

      <section id="profesionales" className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Profesionales
            </h2>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {items.length} disponibles
            </p>
          </div>

          <ul className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {items.map(({ pro, cheapest }) => (
              <li key={pro.id}>
                <Link href={`/p/${pro.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pro.coverUrl}
                      alt={pro.name}
                      className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                    />
                    <span className="absolute left-3 top-3 rounded-sm bg-background/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
                      {formatDiscipline(pro.discipline)}
                    </span>
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-2">
                    <h3 className="text-xl font-semibold tracking-tight">
                      {pro.name}
                    </h3>
                    <span className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                      {pro.city}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-muted-foreground">
                    {pro.bio}
                  </p>
                  <div className="mt-5 flex items-baseline justify-between border-t border-border/60 pt-4">
                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Desde
                    </span>
                    <span className="text-base font-semibold">
                      {cheapest ? formatPriceARS(cheapest.pricePerMonth) : "—"}
                      <span className="text-[12px] font-normal text-muted-foreground">
                        {" "}
                        / mes
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function Stat({
  value,
  title,
  body,
}: {
  value: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
        {value}
      </p>
      <h3 className="mt-3 text-[17px] font-semibold leading-tight">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
