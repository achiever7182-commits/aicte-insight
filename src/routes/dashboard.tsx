import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  FileCheck2,
  Network,
  MapPinned,
  Hourglass,
  Search,
  Filter,
  ShieldCheck,
  Building,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Scale,
  Sparkles,
} from "lucide-react";
import { applications, constellation, realityCaseList, DEMO_APP_ID } from "@/data/synthetic";
import { Panel, bandColor } from "@/components/bits";
import { useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Validation Dashboard — AICTE VerifyAI" },
      {
        name: "description",
        content:
          "Institutional validation status, pending actions, and forensic alerts across Extension of Approval applications.",
      },
      { property: "og:title", content: "Validation Dashboard — AICTE VerifyAI" },
      {
        property: "og:description",
        content: "EoA intake, multi-spectral validation and decision support — cycle 2025-26.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { role } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "flagged" | "low" | "medium" | "high" | "rings">("all");
  const [sortBy, setSortBy] = useState<"trust_asc" | "trust_desc" | "flags">("trust_asc");

  const visible =
    role === "college" ? applications.filter((a) => a.collegeId === "C07") : applications;

  const stats = useMemo(() => {
    const bandCounts = { high: 0, medium: 0, low: 0 };
    for (const a of visible) bandCounts[a.trust.band]++;
    const statusCounts = new Map<string, number>();
    for (const a of visible)
      for (const d of a.docs)
        statusCounts.set(d.verification, (statusCounts.get(d.verification) ?? 0) + 1);
    const avgTrust = Math.round(
      visible.reduce((s, a) => s + a.trust.total, 0) / Math.max(1, visible.length),
    );
    const pendingActions = visible.filter(
      (a) => a.stage === "review" || a.trust.band === "low",
    ).length;
    return { bandCounts, statusCounts, avgTrust, pendingActions };
  }, [visible]);

  const bandData = [
    { name: "High Trust", value: stats.bandCounts.high, color: "#10B981" },
    { name: "Medium Risk", value: stats.bandCounts.medium, color: "#F59E0B" },
    { name: "Low (Flagged)", value: stats.bandCounts.low, color: "#F43F5E" },
  ].filter((d) => d.value > 0);

  const statusData = [
    "verified",
    "mismatch",
    "expired",
    "pending",
    "source_unavailable",
    "manual_review",
  ].map((s) => ({
    name: s.replace("_", " ").toUpperCase(),
    value: stats.statusCounts.get(s) ?? 0,
  }));

  const flagged = visible.filter((a) => a.ringId || a.realityCase || a.trust.band === "low");
  const pending = visible.filter((a) => a.stage === "review").slice(0, 5);

  // Filtered and sorted applications list
  const filteredApps = useMemo(() => {
    let list = visible.filter((a) => {
      const matchSearch =
        a.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.collegeCode.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filterTab === "flagged") return a.flagSummary.length > 0 || Boolean(a.ringId) || Boolean(a.realityCase);
      if (filterTab === "low") return a.trust.band === "low";
      if (filterTab === "medium") return a.trust.band === "medium";
      if (filterTab === "high") return a.trust.band === "high";
      if (filterTab === "rings") return Boolean(a.ringId);
      return true;
    });

    list = [...list].sort((x, y) => {
      if (sortBy === "trust_asc") return x.trust.total - y.trust.total;
      if (sortBy === "trust_desc") return y.trust.total - x.trust.total;
      if (sortBy === "flags") return y.flagSummary.length - x.flagSummary.length;
      return 0;
    });

    return list;
  }, [visible, searchTerm, filterTab, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF9933] uppercase tracking-wider font-bold mb-1">
            <ShieldCheck className="size-3.5" /> Extension of Approval (EoA) Control Deck
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Validation Command Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time algorithmic intake, forensic surveillance, and officer decision support — Cycle 2025-26.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/applications/$id"
            params={{ id: DEMO_APP_ID }}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-[0_0_16px_rgba(255,153,51,0.3)] hover:bg-primary/90 transition"
          >
            <span>Inspect Demo Case</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* High-Impact Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        <StatCard
          icon={<FileCheck2 className="size-5" />}
          label="Applications in Scope"
          value={String(visible.length)}
          sub={`${stats.avgTrust} Mean Trust Score`}
          tone="default"
        />
        <StatCard
          icon={<AlertTriangle className="size-5" />}
          label="Flagged for Scrutiny"
          value={String(flagged.length)}
          sub="Requires human adjudication"
          tone="warning"
        />
        <StatCard
          icon={<Network className="size-5" />}
          label="Collusion Rings Isolated"
          value={String(constellation.clusters.length)}
          sub="Shared notary seals & ghost rolls"
          tone="destructive"
        />
        <StatCard
          icon={<MapPinned className="size-5" />}
          label="Reality Gap Gaps"
          value={String(realityCaseList.length)}
          sub="Claimed vs satellite disparity"
          tone="accent"
        />
      </div>

      {/* Vigilance Quick-Action Alert Banner */}
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Flame className="size-5 animate-pulse" />
          </span>
          <div>
            <div className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>High-Priority Vigilance Alert: 3 Active Collusion Rings</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold">
                APH VIGILANCE
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Perceptual SimHash has isolated shared notary public stamps across 4 Pune campuses (Ring A) and duplicate site photos (Ring B).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/constellation"
            className="rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3.5 py-1.5 text-xs font-mono font-bold hover:bg-rose-500/30 transition flex items-center gap-1.5"
          >
            <span>Open Constellation</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
          <Link
            to="/reality-twin"
            className="rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            Satellite Gaps
          </Link>
        </div>
      </div>

      {/* Analytics Grid: Trust Distribution, Verification Breakdown, Pending Queue */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Chart 1: Trust Score Distribution Donut */}
        <Panel title="Trust score distribution">
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={bandData}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={84}
                paddingAngle={4}
                stroke="none"
              >
                {bandData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#161411",
                  border: "1px solid #2C2721",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "#F5EFE6",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 flex justify-center gap-4 text-xs font-mono text-muted-foreground">
            {bandData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: d.color }} />
                <span>
                  {d.name} ({d.value})
                </span>
              </span>
            ))}
          </div>
        </Panel>

        {/* Chart 2: Document Verification Status Bar */}
        <Panel title="Document Verification Statuses">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={statusData} layout="vertical" margin={{ left: 10, right: 12, top: 4, bottom: 4 }}>
              <CartesianGrid stroke="#26211C" horizontal={false} strokeDasharray="3 3" />
              <XAxis
                type="number"
                tick={{ fill: "#9E9485", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fill: "#9E9485", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255, 153, 51, 0.06)" }}
                contentStyle={{
                  background: "#161411",
                  border: "1px solid #2C2721",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "#F5EFE6",
                }}
              />
              <Bar dataKey="value" fill="#FF9933" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Card 3: Pending Action Review Queue */}
        <Panel
          title="Priority Action Queue"
          action={
            <span className="flex items-center gap-1 text-xs font-mono text-amber-400 font-semibold">
              <Hourglass className="size-3.5" /> {pending.length} Pending
            </span>
          }
        >
          <ul className="space-y-2 text-xs">
            {pending.length === 0 ? (
              <li className="text-muted-foreground py-8 text-center">No applications awaiting officer action.</li>
            ) : (
              pending.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/40 p-2.5 hover:border-primary/40 transition group"
                >
                  <div className="min-w-0 pr-2">
                    <Link
                      to="/applications/$id"
                      params={{ id: a.id }}
                      className="block truncate font-semibold text-foreground group-hover:text-primary transition"
                    >
                      {a.collegeName}
                    </Link>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {a.id} · {a.category} · {a.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("data-num text-sm font-black", bandColor(a.trust.band))}>
                      {a.trust.total}
                    </span>
                    <Link
                      to="/applications/$id"
                      params={{ id: a.id }}
                      className="rounded bg-primary/10 text-primary p-1 hover:bg-primary/20"
                      aria-label="Inspect dossier"
                    >
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Panel>
      </div>

      {/* Main Applications Registry Section */}
      <Panel
        title={`Applications Registry (${filteredApps.length} of ${visible.length})`}
        action={
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-border bg-input/60 px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="trust_asc">Lowest Trust First</option>
              <option value="trust_desc">Highest Trust First</option>
              <option value="flags">Most Flags First</option>
            </select>
          </div>
        }
      >
        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Institution, Code, City, State or App ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-input/60 pl-10 pr-4 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap rounded-xl border border-border bg-muted/40 p-1 text-xs">
            {[
              { id: "all", label: "All" },
              { id: "flagged", label: "Flagged" },
              { id: "low", label: "Low Trust" },
              { id: "medium", label: "Medium" },
              { id: "high", label: "High" },
              { id: "rings", label: "Fraud Rings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={cn(
                  "rounded-lg px-2.5 py-1 font-medium transition-colors text-xs",
                  filterTab === tab.id
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase font-mono tracking-wider text-muted-foreground">
                <th className="py-2.5 pr-4">Application</th>
                <th className="py-2.5 pr-4">Institution Details</th>
                <th className="py-2.5 pr-4">Category</th>
                <th className="py-2.5 pr-4">Trust Score</th>
                <th className="py-2.5 pr-4">Stage</th>
                <th className="py-2.5 pr-4">Forensic Signals</th>
                <th className="py-2.5 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No applications matched your filter query.
                  </td>
                </tr>
              ) : (
                filteredApps.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-muted/40 transition">
                    <td className="data-num py-3 pr-4 text-xs font-semibold text-primary">
                      {a.id}
                    </td>

                    <td className="py-3 pr-4">
                      <div className="max-w-64 truncate font-semibold text-foreground">
                        {a.collegeName}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        Code: {a.collegeCode} · {a.city}, {a.state}
                      </div>
                    </td>

                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {a.category}
                    </td>

                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={cn("data-num text-sm font-black", bandColor(a.trust.band))}>
                          {a.trust.total}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">
                          / 100
                        </span>
                      </div>
                    </td>

                    <td className="py-3 pr-4 text-xs capitalize text-muted-foreground">
                      <span className="px-2 py-0.5 rounded bg-muted font-mono text-[11px]">
                        {a.stage}
                      </span>
                    </td>

                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {a.ringId && (
                          <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400">
                            RING COLLUSION
                          </span>
                        )}
                        {a.realityCase && (
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400">
                            REALITY GAP
                          </span>
                        )}
                        {a.flagSummary.length > 0 ? (
                          <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive font-mono font-medium">
                            {a.flagSummary.length} Flags
                          </span>
                        ) : !a.ringId && !a.realityCase ? (
                          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> Clean
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="py-3 text-right">
                      <Link
                        to="/applications/$id"
                        params={{ id: a.id }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <span>Review</span>
                        <ArrowUpRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "warning" | "destructive" | "accent" | "default";
}) {
  return (
    <div className="panel flex items-center gap-3.5 p-4 rounded-xl border border-border bg-card/80 hover:border-primary/40 transition">
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          tone === "warning" && "bg-amber-500/15 text-amber-400 border border-amber-500/25",
          tone === "destructive" && "bg-rose-500/15 text-rose-400 border border-rose-500/25",
          tone === "accent" && "bg-[#F5C542]/15 text-[#F5C542] border border-[#F5C542]/25",
          (!tone || tone === "default") && "bg-primary/15 text-primary border border-primary/25"
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="data-num text-2xl font-black leading-none text-foreground">{value}</div>
        <div className="mt-1 text-xs font-medium text-foreground truncate">{label}</div>
        <div className="text-[11px] text-muted-foreground truncate">{sub}</div>
      </div>
    </div>
  );
}
