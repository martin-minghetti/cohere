import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp, Users, Pause, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  getProBySlug,
  getActiveSubscribersCount,
  getMonthlyRevenue,
  getSubscriptionsForPro,
} from "@/lib/queries";
import { formatPriceARS, formatDiscipline } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<
  string,
  { label: string; cls: string }
> = {
  active: {
    label: "Activa",
    cls: "bg-primary/10 text-primary",
  },
  pending: {
    label: "Pendiente",
    cls: "bg-amber-100 text-amber-900",
  },
  paused: {
    label: "Pausada",
    cls: "bg-secondary text-foreground",
  },
  cancelled: {
    label: "Cancelada",
    cls: "bg-destructive/10 text-destructive",
  },
  failed: {
    label: "Rechazada",
    cls: "bg-destructive/10 text-destructive",
  },
};

export default async function ProDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pro = await getProBySlug(slug);
  if (!pro) notFound();

  const [activeCount, monthlyRevenue, subs] = await Promise.all([
    getActiveSubscribersCount(pro.id),
    getMonthlyRevenue(pro.id),
    getSubscriptionsForPro(pro.id),
  ]);

  const pausedCount = subs.filter((s) => s.status === "paused").length;
  const cancelledCount = subs.filter((s) => s.status === "cancelled").length;

  return (
    <>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-32 lg:px-10">
        <Link
          href={`/p/${pro.slug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al perfil público
        </Link>

        <div className="mt-8 flex items-baseline justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-primary">
              {formatDiscipline(pro.discipline)} · dashboard
            </span>
            <h1 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">
              Hola, {pro.name.split(" ")[0]}.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Resumen de tus suscriptores y revenue mensual recurrente.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Stat
            Icon={Users}
            label="Subscribers activos"
            value={String(activeCount)}
            tone="primary"
          />
          <Stat
            Icon={TrendingUp}
            label="MRR (revenue mensual)"
            value={formatPriceARS(monthlyRevenue)}
            tone="primary"
          />
          <Stat
            Icon={Pause}
            label="Pausados / cancelados"
            value={`${pausedCount} / ${cancelledCount}`}
            tone="muted"
          />
        </div>

        <div className="mt-16">
          <h2 className="font-serif text-2xl tracking-tight">Suscriptores</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Todos los que iniciaron una suscripción, en cualquier estado.
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card">
            {subs.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                Todavía no hay suscriptores. Compartí el link de tus planes.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left">Nombre</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Plan</th>
                    <th className="px-5 py-3 text-right">Mensual</th>
                    <th className="px-5 py-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => {
                    const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.pending;
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-border/40 last:border-none"
                      >
                        <td className="px-5 py-4 font-medium">
                          {s.subscriberName}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {s.subscriberEmail}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {s.planName}
                        </td>
                        <td className="px-5 py-4 text-right font-medium">
                          {formatPriceARS(s.pricePerMonth)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function Stat({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "primary" | "muted";
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-7 shadow-sm">
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
          tone === "primary"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
    </div>
  );
}
