import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Cell, Pie, PieChart, Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AlertTriangle, ArrowUpRight, FileCheck2, Network, MapPinned, Hourglass } from "lucide-react";
import { applications, constellation, realityCaseList, DEMO_APP_ID } from "@/data/synthetic";
import { Panel, bandColor } from "@/components/bits";
import { useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AICTE VerifyAI" },
      { name: "description", content: "Validation status, pending actions and alerts across EoA applications." },
      { property: "og:title", content: "Dashboard — AICTE VerifyAI" },
      { property: "og:description", content: "Validation status, pending actions and alerts across EoA applications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { role } = useAppState();
  const visible = role === "college" ? applications.filter((a) => a.collegeId === "C07") : applications;

  const stats = useMemo(() => {
    const bandCounts = { high: 0, medium: 0, low: 0 };
    for (const a of visible) bandCounts[a.trust.band]++;
    const statusCounts = new Map<string, number>();
    for (const a of visible)
      for (const d of a.docs) statusCounts.set(d.verification, (statusCounts.get(d.verification) ?? 0) + 1);
    const avgTrust = Math.round(visible.reduce((s, a) => s + a.trust.total, 0) / Math.max(1, visible.length));
    const pendingActions = visible.filter((a) => a.stage === "review" || a.trust.band === "low").length;
    return { bandCounts, statusCounts, avgTrust, pendingActions };
  }, [visible]);

  const bandData = [
    { name: "High", value: stats.bandCounts.high, color: "var(--success)" },
    { name: "Medium", value: stats.bandCounts.medium, color: "var(--warning)" },
    { name: "Low", value: stats.bandCounts.low, color: "var(--destructive)" },
  ].filter((d) => d.value > 0);

  const statusData = ["verified", "mismatch", "expired", "pending", "source_unavailable", "manual_review"].map((s) => ({
    name: s.replace("_", " "),
    value: stats.statusCounts.get(s) ?? 0,
  }));

  const flagged = visible.filter((a) => a.ringId || a.realityCase || a.trust.band === "low").slice(0, 6);
  const pending = visible.filter((a) => a.stage === "review").slice(0, 6);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Validation Dashboard</h1>
          <p className="text-sm text-muted-foreground">EoA intake, validation and decision support — cycle 2025-26</p>
        </div>
        <Link
          to="/applications/$id"
          params={{ id: DEMO_APP_ID }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Open demo application <ArrowUpRight className="size-4" />
        </Link>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={<FileCheck2 className="size-5" />} label="Applications in view" value={String(visible.length)} sub={`${stats.avgTrust} avg trust score`} />
        <StatCard icon={<AlertTriangle className="size-5" />} label="Flagged applications" value={String(flagged.length)} sub="needs officer review" tone="warning" />
        <StatCard icon={<Network className="size-5" />} label="Linked clusters" value={String(constellation.clusters.length)} sub="shared document elements" tone="accent" />
        <StatCard icon={<MapPinned className="size-5" />} label="Reality Gap cases" value={String(realityCaseList.length)} sub="claimed vs observed discrepancy" tone="accent" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Trust score distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={bandData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                {bandData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "var(--foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
            {bandData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: d.color }} /> {d.name} ({d.value})
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Document verification statuses">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} layout="vertical" margin={{ left: 40, right: 12 }}>
              <CartesianGrid stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "var(--foreground)" }}
              />
              <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Pending actions" action={<Hourglass className="size-4 text-warning" />}>
          <ul className="space-y-2 text-sm">
            {pending.length === 0 && <li className="text-muted-foreground">No applications awaiting officer action.</li>}
            {pending.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
                <div className="min-w-0">
                  <Link to="/applications/$id" params={{ id: a.id }} className="block truncate font-medium hover:text-primary">
                    {a.collegeName}
                  </Link>
                  <span className="text-xs text-muted-foreground">{a.id} · {a.category}</span>
                </div>
                <span className={cn("data-num text-lg font-semibold", bandColor(a.trust.band))}>{a.trust.total}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Applications">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Application</th>
                <th className="py-2 pr-4">Institution</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Trust</th>
                <th className="py-2 pr-4">Stage</th>
                <th className="py-2 pr-4">Flags</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/40">
                  <td className="data-num py-2.5 pr-4 text-xs">{a.id}</td>
                  <td className="py-2.5 pr-4">
                    <div className="max-w-56 truncate">{a.collegeName}</div>
                    <div className="text-xs text-muted-foreground">{a.city}, {a.state}</div>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{a.category}</td>
                  <td className="py-2.5 pr-4">
                    <span className={cn("data-num font-semibold", bandColor(a.trust.band))}>{a.trust.total}</span>
                  </td>
                  <td className="py-2.5 pr-4 capitalize text-muted-foreground">{a.stage}</td>
                  <td className="py-2.5 pr-4">
                    {a.flagSummary.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive">{a.flagSummary.length} flags</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    <Link to="/applications/$id" params={{ id: a.id }} className="text-xs font-medium text-primary hover:underline">
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function StatCard({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone?: "warning" | "accent" }) {
  return (
    <div className="panel flex items-center gap-4 p-4">
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-xl",
          tone === "warning" && "bg-warning/12 text-warning",
          tone === "accent" && "bg-accent/12 text-accent",
          !tone && "bg-primary/12 text-primary",
        )}
      >
        {icon}
      </span>
      <div>
        <div className="data-num text-2xl font-bold leading-none">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {label} · {sub}
        </div>
      </div>
    </div>
  );
}
