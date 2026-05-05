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
  active: { label: "Active", cls: "bg-primary/10 text-primary" },
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-900" },
  paused: { label: "Paused", cls: "bg-secondary text-foreground" },
  cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive" },
  failed: { label: "Failed", cls: "bg-destructive/10 text-destructive" },
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

      <section className="mx-auto max-w-5xl px-6 pt-10 pb-24 lg:px-8">
        <Link
          href={`/p/${pro.slug}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Public profile
        </Link>

        <div className="mt-6 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pro.avatarUrl}
            alt={pro.name}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
              {formatDiscipline(pro.discipline)} · Dashboard
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
              {pro.name.split(" ")[0]}
            </h1>
          </div>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          <Stat
            Icon={Users}
            label="Active subscribers"
            value={String(activeCount)}
          />
          <Stat
            Icon={TrendingUp}
            label="MRR (monthly recurring revenue)"
            value={formatPriceARS(monthlyRevenue)}
          />
          <Stat
            Icon={Pause}
            label="Paused / cancelled"
            value={`${pausedCount} / ${cancelledCount}`}
            muted
          />
        </div>

        <div className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[15px] font-semibold tracking-tight">
              Subscribers
            </h2>
            <p className="text-[12px] text-muted-foreground">
              {subs.length} total
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-card">
            {subs.length === 0 ? (
              <div className="flex items-center justify-center py-14 text-[13px] text-muted-foreground">
                No subscribers yet. Share your plan link.
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <thead className="border-b border-border/60 bg-secondary/40 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Name</th>
                    <th className="px-4 py-2.5 text-left font-medium">Email</th>
                    <th className="px-4 py-2.5 text-left font-medium">Plan</th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Monthly
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => {
                    const badge =
                      STATUS_BADGE[s.status] ?? STATUS_BADGE.pending;
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-border/40 last:border-none"
                      >
                        <td className="px-4 py-3 font-medium">
                          {s.subscriberName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {s.subscriberEmail}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {s.planName}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatPriceARS(s.pricePerMonth)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.cls}`}
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
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div
        className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
          muted ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
