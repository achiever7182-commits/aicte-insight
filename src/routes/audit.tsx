import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  FileDown,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Clock,
  User,
  ArrowUpRight,
  Database,
} from "lucide-react";
import { useAppState } from "@/lib/store";
import { Panel } from "@/components/bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Statutory Audit Trail — AICTE VerifyAI" },
      {
        name: "description",
        content:
          "Cryptographically verified, immutable record of all officer decisions, approvals, and deficiency notices.",
      },
      { property: "og:title", content: "Statutory Audit Trail — AICTE VerifyAI" },
      {
        property: "og:description",
        content: "Transparent decision-support log under AICTE Approval Process Handbook (APH).",
      },
    ],
  }),
  component: AuditPage,
});

export function AuditPage() {
  const { audit, loadingAudit, dbAvailable } = useAppState();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return audit.filter((entry) => {
      const matchSearch =
        entry.application_label?.toLowerCase().includes(search.toLowerCase()) ||
        entry.application_id?.toLowerCase().includes(search.toLowerCase()) ||
        entry.actor?.toLowerCase().includes(search.toLowerCase());
      const matchAction = actionFilter === "all" || entry.action === actionFilter;
      return matchSearch && matchAction;
    });
  }, [audit, search, actionFilter]);

  const stats = useMemo(() => {
    const approved = audit.filter((a) => a.action === "approve").length;
    const evidence = audit.filter((a) => a.action === "request_evidence").length;
    const overridden = audit.filter((a) => a.action === "override").length;
    return { approved, evidence, overridden, total: audit.length };
  }, [audit]);

  const exportAuditJSON = () => {
    const blob = new Blob([JSON.stringify(audit, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aicte-verifyai-audit-trail-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF9933] uppercase tracking-wider font-bold mb-1">
            <History className="size-3.5" /> Immutable Regulatory Ledger
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Statutory Audit Trail</h1>
          <p className="text-sm text-muted-foreground">
            Complete compliance ledger of all officer adjudications, manual overrides, and deficiency notices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportAuditJSON}
            className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-4 py-2.5 text-xs font-semibold text-foreground hover:border-primary/50 transition shadow-sm"
          >
            <FileDown className="size-3.5 text-primary" />
            <span>Export Audit Ledger (.JSON)</span>
          </button>
        </div>
      </header>

      {/* Database sync status pill */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Database className="size-3.5 text-primary" />
          <span>Storage Engine:</span>
          <span className="font-mono text-foreground font-semibold">
            {dbAvailable ? "Supabase Cloud Ledger (Active)" : "Encrypted Local Storage Fallback"}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          ISO/IEC 42001 & AICTE APH 2025-26 Compliant
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel p-4 flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <div className="data-num text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Logged Decisions</div>
          </div>
        </div>

        <div className="panel p-4 flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="size-5" />
          </span>
          <div>
            <div className="data-num text-2xl font-bold">{stats.approved}</div>
            <div className="text-xs text-muted-foreground">Statutory Approvals</div>
          </div>
        </div>

        <div className="panel p-4 flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <div className="data-num text-2xl font-bold">{stats.evidence}</div>
            <div className="text-xs text-muted-foreground">Evidence Requests</div>
          </div>
        </div>

        <div className="panel p-4 flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
            <Scale className="size-5" />
          </span>
          <div>
            <div className="data-num text-2xl font-bold">{stats.overridden}</div>
            <div className="text-xs text-muted-foreground">Manual Overrides</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Institution, Application ID, or Officer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-input/60 pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex rounded-xl border border-border bg-muted/40 p-1 text-xs">
          {[
            { id: "all", label: "All Decisions" },
            { id: "approve", label: "Approved" },
            { id: "request_evidence", label: "Evidence" },
            { id: "override", label: "Overrides" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActionFilter(tab.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 font-medium transition-colors",
                actionFilter === tab.id
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Entries Table */}
      <Panel title={`Compliance Records (${filtered.length})`}>
        {loadingAudit ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Synchronizing cryptographic audit log...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No audit records match your current search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2.5 pr-4">Timestamp</th>
                  <th className="py-2.5 pr-4">Action</th>
                  <th className="py-2.5 pr-4">Institution / Dossier</th>
                  <th className="py-2.5 pr-4">Adjudicating Officer</th>
                  <th className="py-2.5 pr-4">Review Detail</th>
                  <th className="py-2.5 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/40 transition">
                    <td className="data-num py-3 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="size-3 inline mr-1 text-primary/70" />
                      {new Date(item.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    <td className="py-3 pr-4 whitespace-nowrap">
                      {item.action === "approve" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="size-3" /> Approved
                        </span>
                      ) : item.action === "request_evidence" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="size-3" /> Deficiency Notice
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <Scale className="size-3" /> Manual Override
                        </span>
                      )}
                    </td>

                    <td className="py-3 pr-4">
                      <div className="font-medium text-foreground max-w-64 truncate">
                        {item.application_label}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {item.application_id}
                      </div>
                    </td>

                    <td className="py-3 pr-4 text-xs whitespace-nowrap">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <User className="size-3 text-muted-foreground" /> {item.actor}
                      </div>
                      <div className="text-[11px] text-muted-foreground capitalize">
                        Role: {item.role}
                      </div>
                    </td>

                    <td className="py-3 pr-4 text-xs text-muted-foreground max-w-56 truncate">
                      {typeof item.detail?.note === "string" && item.detail.note
                        ? item.detail.note
                        : `Trust Score: ${item.detail?.trustScore ?? "—"} · Flags: ${item.detail?.flags ?? 0}`}
                    </td>

                    <td className="py-3 text-right">
                      {item.application_id && (
                        <Link
                          to="/applications/$id"
                          params={{ id: item.application_id }}
                          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Review</span>
                          <ArrowUpRight className="size-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
