import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp, Users, Pause } from "lucide-react";
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

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active: {
    label: "Activa",
    cls: "bg-accent/15 text-accent",
  },
  pending: { label: "Pendiente", cls: "bg-amber-100 text-amber-900" },
  paused: { label: "Pausada", cls: "bg-secondary text-foreground" },
  cancelled: { label: "Cancelada", cls: "bg-destructive/10 text-destructive" },
  failed: { label: "Rechazada", cls: "bg-destructive/10 text-destructive" },
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

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-24 lg:px-10">
        <Link
          href={`/p/${pro.slug}`}
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Perfil público
        </Link>

        <div className="mt-10 flex items-center gap-5">
          <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pro.avatarUrl}
              alt={pro.name}
              className="h-full w-full object-cover grayscale"
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              {formatDiscipline(pro.discipline)} · Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {pro.name.split(" ")[0]}
            </h1>
          </div>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-3">
          <Stat
            Icon={Users}
            label="Suscriptores activos"
            value={String(activeCount)}
          />
          <Stat
            Icon={TrendingUp}
            label="MRR (Monthly Recurring Revenue)"
            value={formatPriceARS(monthlyRevenue)}
          />
          <Stat
            Icon={Pause}
            label="Pausados / cancelados"
            value={`${pausedCount} / ${cancelledCount}`}
            muted
          />
        </div>

        <div className="mt-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Suscriptores
            </h2>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {subs.length} total
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-md border border-border bg-card">
            {subs.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-[13px] text-muted-foreground">
                Todavía no hay suscriptores. Compartí el link de tus planes.
              </div>
            ) : (
              <table className="w-full text-[14px]">
                <thead className="border-b border-border bg-secondary/40 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
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
                    const badge =
                      STATUS_BADGE[s.status] ?? STATUS_BADGE.pending;
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-border/60 last:border-none"
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
                        <td className="px-5 py-4 text-right font-semibold">
                          {formatPriceARS(s.pricePerMonth)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span
                            className={`inline-block rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badge.cls}`}
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
  muted,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-6">
      <div
        className={`inline-flex h-7 w-7 items-center justify-center rounded-sm ${
          muted ? "bg-muted text-muted-foreground" : "bg-accent/15 text-accent"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
