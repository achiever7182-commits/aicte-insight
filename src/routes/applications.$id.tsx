import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Network,
  MapPinned,
  MessageSquareText,
  CheckCircle2,
  Flag,
  Landmark,
  ShieldCheck,
  History,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { getApplication, getFingerprint, DEMO_APP_ID } from "@/data/synthetic";
import { DocumentScan } from "@/data/doc-renderer";
import { Panel, StatusPill, TrustDial, SeverityBadge, bandColor } from "@/components/bits";
import { useAppState } from "@/lib/store";
import type { EvidenceBox } from "@/data/types";
import { cn } from "@/lib/utils";
import { notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/applications/$id")({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.app.collegeName} — AICTE VerifyAI`
          : "Application Review — AICTE VerifyAI",
      },
      {
        name: "description",
        content:
          "Trust score breakdown, document evidence and decision support for an EoA application.",
      },
      { property: "og:title", content: "Application review — AICTE VerifyAI" },
      {
        property: "og:description",
        content: "Trust score breakdown, document evidence and decision support for an EoA application.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ params }) => {
    let app = getApplication(params.id);
    if (!app && typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("verifyai-custom-apps");
        if (saved) {
          const list = JSON.parse(saved) as any[];
          app = list.find((a) => a.id === params.id);
        }
      } catch {
        /* ignore */
      }
    }
    return { app, appId: params.id };
  },
  component: AppReview,
});

function AppReview() {
  const { app: loaderApp, appId } = Route.useLoaderData();
  const { role, applications, decisionFor, logDecision } = useAppState();

  const app = loaderApp || applications.find((a) => a.id === appId);
  if (!app) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-foreground">Application Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1">
          The requested application ID ({appId}) does not exist.
        </p>
      </div>
    );
  }

  const [activeDocId, setActiveDocId] = useState(app.docs?.[0]?.id);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceBox | undefined>();
  const [note, setNote] = useState("");
  const [logged, setLogged] = useState(false);

  const doc = app.docs.find((d) => d.id === activeDocId) ?? app.docs[0];
  const decision = decisionFor(app.id);

  const allEvidence = useMemo(
    () =>
      app.docs.flatMap((d) =>
        d.evidence.map((ev) => ({ ...ev, docId: d.id, docType: d.classification }))
      ),
    [app]
  );

  const act = async (action: "approve" | "override" | "request_evidence") => {
    await logDecision({
      applicationId: app.id,
      applicationLabel: `${app.collegeName} (${app.id})`,
      action,
      detail: { note, trustScore: app.trust.total, flags: app.flagSummary.length },
    });
    setNote("");
    setLogged(true);
    setTimeout(() => setLogged(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="size-4 text-primary" /> Back to Dashboard
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {app.ringId && (
            <Link
              to="/constellation"
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-rose-300 hover:bg-rose-500/20 font-mono text-[11px] font-bold transition"
            >
              <Network className="size-3.5" /> Collusion Ring Active
            </Link>
          )}

          {app.realityCase && (
            <Link
              to="/reality-twin"
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-amber-300 hover:bg-amber-500/20 font-mono text-[11px] font-bold transition"
            >
              <MapPinned className="size-3.5" /> Reality Gap Flagged
            </Link>
          )}

          <Link
            to="/copilot"
            search={{ app: app.id }}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-foreground hover:border-primary/50 transition font-medium"
          >
            <MessageSquareText className="size-3.5 text-primary" /> Consult Copilot
          </Link>

          <Link
            to="/audit"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-foreground hover:border-primary/50 transition font-medium"
          >
            <History className="size-3.5 text-primary" /> Audit Trail
          </Link>
        </div>
      </div>

      {/* Main Institution Header Banner */}
      <header className="panel flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl border border-border bg-card/80 shadow-md">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {app.collegeName}
            </h1>
            <span className="data-num rounded-md bg-muted px-2.5 py-0.5 text-xs font-mono font-bold text-primary">
              {app.id}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              Code: {app.collegeCode}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            {app.category} · {app.program} · Approved Intake: {app.intake} seats · Submitted: {app.submittedAt} · {app.city}, {app.state}
          </p>

          {decision && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1 text-xs text-primary font-mono">
              <CheckCircle2 className="size-3.5" />
              <span>
                Logged Statutory Decision: <strong className="uppercase">{decision.action.replace("_", " ")}</strong> by {decision.actor}
              </span>
            </div>
          )}

          {logged && (
            <div className="mt-2 text-xs font-mono text-emerald-400 animate-pulse flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> Decision recorded to immutable statutory audit trail.
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono uppercase text-muted-foreground font-semibold">Risk Classification</div>
            <div className={cn("text-base font-bold", bandColor(app.trust.band))}>
              {app.trust.band.toUpperCase()} CONFIDENCE
            </div>
          </div>
          <TrustDial score={app.trust.total} band={app.trust.band} size={110} />
        </div>
      </header>

      {/* Grid Layout: Left Document Scans, Right Fact Check & Decision */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* Document Scan & OCR Viewer */}
          <Panel
            title="Statutory Documents & Extracted Evidence"
            action={<span className="text-xs text-muted-foreground hidden sm:inline">Click any highlighted box on document to inspect</span>}
          >
            {/* Document Selection Tabs */}
            <div className="mb-4 flex flex-wrap gap-2">
              {app.docs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setActiveDocId(d.id);
                    setActiveEvidence(undefined);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                    d.id === doc.id
                      ? "border-primary/60 bg-primary/15 text-primary font-bold shadow-sm"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  <FileText className="size-3.5 shrink-0" />
                  <span>{d.classification.replace(" / Ownership Proof", "").replace(" Extract", "")}</span>
                  {d.evidence.length > 0 && (
                    <span className="rounded-full bg-rose-500/20 text-rose-400 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                      {d.evidence.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] items-start">
              {/* Document Canvas Rendering */}
              <div className="rounded-xl border border-border/80 bg-[#0E0C0A] p-2 flex justify-center shadow-inner">
                <DocumentScan
                  doc={doc}
                  activeEvidenceId={activeEvidence?.id}
                  onEvidenceClick={setActiveEvidence}
                />
              </div>

              {/* Document Metadata & Evidence Flags */}
              <div className="space-y-3.5">
                <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </span>
                    <StatusPill status={doc.verification} />
                  </div>
                  <p className="text-xs text-foreground leading-relaxed pt-1">{doc.verificationNote}</p>
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    OCR Classification
                  </div>
                  <p className="text-xs text-foreground">
                    Classified as <strong className="text-primary">{doc.classification}</strong> · Confidence:{" "}
                    <span className="font-mono text-primary font-bold">{Math.round(doc.ocrConfidence * 100)}%</span>
                  </p>

                  <dl className="mt-2 space-y-1.5 text-xs font-mono">
                    {doc.fields.map((f) => (
                      <div key={f.label} className="flex justify-between gap-3 border-b border-border/40 pb-1">
                        <dt className="text-muted-foreground">{f.label}:</dt>
                        <dd className="text-foreground font-semibold text-right truncate max-w-44">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {doc.evidence.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-mono uppercase tracking-wider font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" /> Forensic Findings ({doc.evidence.length})
                    </div>
                    {doc.evidence.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setActiveEvidence(ev)}
                        className={cn(
                          "flex w-full items-start gap-2.5 rounded-xl border p-3 text-left transition-all",
                          activeEvidence?.id === ev.id
                            ? "border-rose-500/70 bg-rose-950/20 shadow-sm"
                            : "border-border bg-muted/40 hover:bg-muted"
                        )}
                      >
                        <Flag
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            ev.severity === "high"
                              ? "text-rose-400"
                              : ev.severity === "medium"
                              ? "text-amber-400"
                              : "text-primary"
                          )}
                        />
                        <div className="min-w-0">
                          <SeverityBadge severity={ev.severity} />
                          <span className="mt-1 block text-xs text-foreground leading-snug">{ev.reason}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Trust Why, Checklist, Officer Decision */}
        <div className="space-y-6">
          {/* Trust Score Breakdown */}
          <Panel title="Trust Score Diagnostics">
            <ul className="space-y-3.5">
              {app.trust.factors.map((f) => (
                <li key={f.label} className="space-y-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-foreground">{f.label}</span>
                    <span className="data-num font-mono text-muted-foreground">
                      {f.score}/100 (w {f.weight}%)
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${f.score}%`,
                        background:
                          f.score >= 75 ? "#10B981" : f.score >= 50 ? "#F59E0B" : "#F43F5E",
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{f.note}</p>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Checklist */}
          <Panel title="Statutory Checklist (APH)">
            <ul className="space-y-2 text-xs">
              {app.checklist.map((c) => (
                <li key={c.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/20">
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                      c.status === "submitted" && "bg-emerald-500/20 text-emerald-400",
                      c.status === "flagged" && "bg-rose-500/20 text-rose-400",
                      c.status === "missing" && "bg-amber-500/20 text-amber-400"
                    )}
                  >
                    {c.status === "submitted" ? "✓" : "!"}
                  </span>
                  <div className="min-w-0">
                    <span className={cn(c.status === "missing" ? "text-muted-foreground line-through" : "text-foreground font-medium")}>
                      {c.label}
                    </span>
                    {!c.required && <span className="ml-1.5 text-[10px] uppercase font-mono text-muted-foreground">optional</span>}
                    {c.note && <span className="block text-[11px] text-rose-400 mt-0.5">{c.note}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Officer Decision Box */}
          <Panel title="Statutory Officer Adjudication">
            {(role === "officer" || role === "admin") && !decision ? (
              <div className="space-y-3.5 text-xs">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Record formal statutory reasoning, meeting date, or file references for the immutable audit trail…"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-input/60 p-3 text-xs outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary text-foreground"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => act("approve")}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-2.5 text-xs font-bold hover:bg-emerald-500/30 transition shadow-sm"
                  >
                    <CheckCircle2 className="size-4" /> Grant Approval
                  </button>
                  <button
                    onClick={() => act("request_evidence")}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-2.5 text-xs font-bold hover:bg-amber-500/30 transition shadow-sm"
                  >
                    <Landmark className="size-4" /> Request Clarification
                  </button>
                  <button
                    onClick={() => act("override")}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-2.5 text-xs font-bold hover:bg-rose-500/30 transition shadow-sm"
                  >
                    <Flag className="size-4" /> Override AI
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  All officer actions are cryptographically signed and stored in the tamper-proof statutory audit trail.
                </p>
              </div>
            ) : decision ? (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground capitalize">
                    {decision.action.replace("_", " ")} — Confirmed
                  </span>
                  <Link to="/audit" className="font-mono text-primary hover:underline flex items-center gap-1">
                    Audit Log <ArrowUpRight className="size-3" />
                  </Link>
                </div>
                <p className="text-muted-foreground font-mono text-[11px]">
                  Logged by {decision.actor} ({decision.role}) at {new Date(decision.created_at).toLocaleString("en-IN")}
                </p>
                {typeof decision.detail?.note === "string" && decision.detail.note && (
                  <p className="text-foreground italic bg-muted/40 p-2.5 rounded-lg border border-border/60">
                    &ldquo;{decision.detail.note}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                You are currently viewing as a College Representative. Statutory adjudication actions are restricted to designated AICTE Review Officers.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
