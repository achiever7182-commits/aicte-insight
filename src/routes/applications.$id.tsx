import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, FileText, Network, MapPinned, MessageSquareText, CheckCircle2, Flag, Landmark } from "lucide-react";
import { getApplication, getFingerprint, DEMO_APP_ID } from "@/data/synthetic";
import { DocumentScan } from "@/data/doc-renderer";
import { Panel, StatusPill, TrustDial, SeverityBadge } from "@/components/bits";
import { useAppState } from "@/lib/store";
import type { EvidenceBox } from "@/data/types";
import { cn } from "@/lib/utils";
import { notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/applications/$id")({
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.app.collegeName} — AICTE VerifyAI` : "Application — AICTE VerifyAI" },
      { name: "description", content: "Trust score breakdown, document evidence and decision support for an EoA application." },
      { property: "og:title", content: "Application review — AICTE VerifyAI" },
      { property: "og:description", content: "Trust score breakdown, document evidence and decision support for an EoA application." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ params }) => {
    const app = getApplication(params.id);
    if (!app) throw notFound();
    return { app };
  },
  component: AppReview,
});

function AppReview() {
  const { app } = Route.useLoaderData();
  const { role, decisionFor, logDecision } = useAppState();
  const [activeDocId, setActiveDocId] = useState(app.docs[0].id);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceBox | undefined>();
  const [note, setNote] = useState("");
  const [logged, setLogged] = useState(false);

  const doc = app.docs.find((d) => d.id === activeDocId) ?? app.docs[0];
  const decision = decisionFor(app.id);

  const allEvidence = useMemo(
    () => app.docs.flatMap((d) => d.evidence.map((ev) => ({ ...ev, docId: d.id, docType: d.classification }))),
    [app],
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
    setTimeout(() => setLogged(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Dashboard
        </Link>
        <div className="flex gap-2 text-xs">
          {app.ringId && (
            <Link to="/constellation" className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent hover:bg-accent/20">
              <Network className="size-3.5" /> View in Constellation
            </Link>
          )}
          {app.realityCase && (
            <Link to="/reality-twin" className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent hover:bg-accent/20">
              <MapPinned className="size-3.5" /> Reality Twin
            </Link>
          )}
          <Link to="/copilot" search={{ app: app.id }} className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 hover:bg-muted/70">
            <MessageSquareText className="size-3.5" /> Ask Copilot
          </Link>
        </div>
      </div>

      <header className="panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold">{app.collegeName}</h1>
            <span className="data-num rounded bg-muted px-2 py-0.5 text-xs">{app.id}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {app.category} · {app.program} · intake {app.intake} · submitted {app.submittedAt} · {app.city}, {app.state}
          </p>
          {decision && (
            <p className="mt-2 text-xs text-muted-foreground">
              <CheckCircle2 className="mr-1 inline size-3.5 text-primary" />
              Logged decision: <span className="font-semibold capitalize text-foreground">{decision.action.replace("_", " ")}</span> by {decision.actor}
            </p>
          )}
          {logged && <p className="mt-2 text-xs text-primary">Decision recorded to the audit trail.</p>}
        </div>
        <TrustDial score={app.trust.total} band={app.trust.band} />
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          {/* Documents with evidence boxes */}
          <Panel
            title="Documents & extracted evidence"
            action={<span className="text-xs text-muted-foreground">Click a highlighted box to jump to its reason</span>}
          >
            <div className="mb-3 flex flex-wrap gap-1.5">
              {app.docs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setActiveDocId(d.id);
                    setActiveEvidence(undefined);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                    d.id === doc.id ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileText className="size-3.5" />
                  {d.classification.replace(" / Ownership Proof", "").replace(" Extract", "")}
                  {d.evidence.length > 0 && <span className="rounded bg-destructive/20 px-1 text-[10px] text-destructive">{d.evidence.length}</span>}
                </button>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div className="max-w-lg">
                <DocumentScan doc={doc} activeEvidenceId={activeEvidence?.id} onEvidenceClick={setActiveEvidence} />
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verification</span>
                    <StatusPill status={doc.verification} />
                  </div>
                  <p className="mt-2 text-sm">{doc.verificationNote}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">OCR & classification</div>
                  <p className="mt-1 text-sm">
                    Classified as <span className="font-medium text-primary">{doc.classification}</span> · OCR confidence{" "}
                    <span className="data-num">{doc.ocrConfidence}%</span>
                  </p>
                  <dl className="mt-2 space-y-1.5 text-xs">
                    {doc.fields.map((f) => (
                      <div key={f.label} className="flex justify-between gap-3 border-b border-border/40 pb-1">
                        <dt className="text-muted-foreground">{f.label}</dt>
                        <dd className="data-num text-right">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {doc.evidence.length > 0 && (
                  <div className="space-y-2">
                    {doc.evidence.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setActiveEvidence(ev)}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-xl border p-3 text-left transition-colors",
                          activeEvidence?.id === ev.id ? "border-destructive/60 bg-destructive/10" : "border-border bg-muted/40 hover:bg-muted",
                        )}
                      >
                        <Flag className={cn("mt-0.5 size-4 shrink-0", ev.severity === "high" ? "text-destructive" : ev.severity === "medium" ? "text-warning" : "text-primary")} />
                        <span>
                          <SeverityBadge severity={ev.severity} />
                          <span className="mt-1 block text-sm">{ev.reason}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          {/* Trust breakdown */}
          <Panel title="Trust score — why">
            <ul className="space-y-3">
              {app.trust.factors.map((f) => (
                <li key={f.label}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{f.label}</span>
                    <span className="data-num text-xs text-muted-foreground">
                      {f.score}/100 · w {f.weight}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${f.score}%`,
                        background: f.score >= 75 ? "var(--success)" : f.score >= 50 ? "var(--warning)" : "var(--destructive)",
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Checklist */}
          <Panel title="Category checklist">
            <ul className="space-y-2 text-sm">
              {app.checklist.map((c) => (
                <li key={c.id} className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[9px]",
                      c.status === "submitted" && "bg-success/20 text-success",
                      c.status === "flagged" && "bg-destructive/20 text-destructive",
                      c.status === "missing" && "bg-warning/20 text-warning",
                    )}
                  >
                    {c.status === "submitted" ? "✓" : "!"}
                  </span>
                  <span>
                    <span className={cn(c.status === "missing" && "text-muted-foreground")}>{c.label}</span>
                    {!c.required && <span className="ml-1.5 text-[10px] uppercase text-muted-foreground">optional</span>}
                    {c.note && <span className="block text-xs text-destructive/90">{c.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Ring links */}
          {app.ringId && (
            <Panel title="Network signals">
              <div className="space-y-2 text-sm">
                {app.docs
                  .flatMap((d) => d.fingerprintIds)
                  .filter((fid, i, arr) => arr.indexOf(fid) === i)
                  .map((fid) => getFingerprint(fid))
                  .filter((f): f is NonNullable<typeof f> => !!f && f.collegeIds.length > 1)
                  .map((f) => (
                    <div key={f.id} className="rounded-xl border border-accent/30 bg-accent/5 p-3">
                      <div className="text-xs uppercase tracking-wide text-accent">{f.kind}</div>
                      <p className="mt-0.5">{f.label}</p>
                      <p className="data-num mt-1 text-xs text-muted-foreground">
                        hash {f.hash} · shared with {f.collegeIds.length - 1} other filing{f.collegeIds.length > 2 ? "s" : ""}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Potential link — needs human verification.</p>
                    </div>
                  ))}
              </div>
            </Panel>
          )}

          {/* Human-in-the-loop */}
          <Panel title="Officer decision (human-in-the-loop)">
            {(role === "officer" || role === "admin") && !decision ? (
              <div className="space-y-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note for the audit trail (reason, references)…"
                  className="h-20 w-full resize-none rounded-lg border border-input bg-muted/50 p-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                />
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => act("approve")} className="flex items-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-sm font-medium text-success hover:bg-success/25">
                    <CheckCircle2 className="size-4" /> Approve for agenda
                  </button>
                  <button onClick={() => act("request_evidence")} className="flex items-center gap-1.5 rounded-lg bg-warning/15 px-3 py-2 text-sm font-medium text-warning hover:bg-warning/25">
                    <Landmark className="size-4" /> Request evidence
                  </button>
                  <button onClick={() => act("override")} className="flex items-center gap-1.5 rounded-lg bg-destructive/15 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/25">
                    <Flag className="size-4" /> Override with justification
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Recommendations on this page are AI-generated decision support. Final decisions rest with the competent AICTE authority.
                </p>
              </div>
            ) : decision ? (
              <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
                <p className="font-medium capitalize">{decision.action.replace("_", " ")} — logged</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {decision.actor} · {new Date(decision.created_at).toLocaleString()}
                </p>
                {typeof decision.detail?.note === "string" && decision.detail.note && <p className="mt-2 text-xs">“{decision.detail.note}”</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You are viewing as a college user — decisions are recorded by AICTE officers and visible in the audit trail.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
