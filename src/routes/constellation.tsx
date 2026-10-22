import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum } from "d3-force";
import { X, FileDown, GitMerge } from "lucide-react";
import { applications, constellation, getCollege, getFingerprint } from "@/data/synthetic";
import { hammingDistance } from "@/lib/fingerprint";
import { StampSeal } from "@/data/doc-renderer";
import { Panel } from "@/components/bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/constellation")({
  head: () => ({
    meta: [
      { title: "Fraud Constellation — AICTE VerifyAI" },
      { name: "description", content: "Interactive graph of institutions linked by shared document fingerprints: stamps, seals, photos, signatories." },
      { property: "og:title", content: "Fraud Constellation — AICTE VerifyAI" },
      { property: "og:description", content: "Institutions linked by shared document elements — potential links, needs human verification." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConstellationPage,
});

type GNode = { id: string; name: string; ringId?: string; x?: number; y?: number; vx?: number; vy?: number };
type GLink = { source: string | GNode; target: string | GNode; kind: string; ringId?: string; distance: number };

const KIND_COLOR: Record<string, string> = {
  notary: "var(--destructive)",
  stamp: "var(--destructive)",
  photo: "var(--warning)",
  signatory: "var(--accent)",
  address: "var(--accent)",
  pdf_meta: "var(--muted-foreground)",
};

function ConstellationPage() {
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const simRef = useRef<ReturnType<typeof forceSimulation<GNode>> | null>(null);
  const nodesRef = useRef<GNode[]>([]);
  const linksRef = useRef<GLink[]>([]);

  const clusterInfo = useMemo(() => {
    return constellation.clusters.map((c) => ({
      ...c,
      names: c.collegeIds.map((id) => getCollege(id)?.name ?? id),
      appIds: c.collegeIds.map((id) => applications.find((a) => a.collegeId === id)?.id ?? id),
    }));
  }, []);

  useEffect(() => {
    const edges = constellation.edges;
    const nodeIds = [...new Set(edges.flatMap((e) => [e.a, e.b]))];
    const nodes: GNode[] = nodeIds.map((id) => ({
      id,
      name: getCollege(id)?.name ?? id,
      ringId: edges.find((e) => (e.a === id || e.b === id) && e.ringId)?.ringId,
    }));
    const links: GLink[] = edges.map((e) => ({ source: e.a, target: e.b, kind: e.kind, ringId: e.ringId, distance: e.distance }));
    nodesRef.current = nodes;
    linksRef.current = links;
    const sim = forceSimulation<GNode>(nodes)
      .force("link", forceLink<GNode, GLink>(links).id((d) => d.id).distance(110).strength(0.35))
      .force("charge", forceManyBody().strength(-320))
      .force("center", forceCenter(430, 330))
      .force("collide", forceCollide(34))
      .on("tick", () => setTick((t) => t + 1));
    simRef.current = sim;
    return () => {
      sim.stop();
    };
  }, []);

  const selectedNode = selected ? nodesRef.current.find((n) => n.id === selected) : null;
  const selectedEdges = selected ? constellation.edges.filter((e) => e.a === selected || e.b === selected) : [];
  const selectedFps = [...new Set(selectedEdges.map((e) => e.fingerprintId))].map((id) => getFingerprint(id)!).filter(Boolean);
  const ringFps = selectedFps.filter((f) => f.collegeIds.length > 1);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold">Fraud Constellation</h1>
        <p className="text-sm text-muted-foreground">
          Institutions linked by shared document fingerprints — stamps, seals, photographs, signatories, addresses. Every link is a{" "}
          <span className="text-warning">potential link, needs human verification</span> — never a conclusion.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <Panel className="relative min-h-[660px] overflow-hidden">
          <svg width="100%" height={640} viewBox="0 0 860 660" data-tick={tick}>
            <defs>
              <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {linksRef.current.map((l, i) => {
              const s = l.source as GNode;
              const t = l.target as GNode;
              if (typeof s === "string" || typeof t === "string" || !s.x || !t.x) return null;
              return (
                <line
                  key={i}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke={KIND_COLOR[l.kind] ?? "var(--border)"}
                  strokeOpacity={l.ringId ? 0.55 : 0.25}
                  strokeWidth={l.ringId ? 2 : 1}
                  strokeDasharray={l.ringId ? undefined : "4 4"}
                />
              );
            })}
            {nodesRef.current.map((n) => {
              const color = n.ringId ? KIND_COLOR[constellation.edges.find((e) => (e.a === n.id || e.b === n.id) && e.ringId)!.kind] : "var(--muted-foreground)";
              const active = n.id === selected;
              return (
                <g key={n.id} transform={`translate(${n.x ?? 0},${n.y ?? 0})`} onClick={() => setSelected(n.id)} style={{ cursor: "pointer" }}>
                  <circle r={active ? 17 : 13} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={active ? 3 : 1.8} filter={n.ringId ? "url(#glow)" : undefined} />
                  <circle r={4} fill={color} />
                  <text y={30} textAnchor="middle" fontSize={10} fill="var(--foreground)" opacity={0.85} style={{ maxWidth: 120 }}>
                    {getCollege(n.id)?.name.split(" ").slice(0, 2).join(" ")}
                  </text>
                  <text y={42} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)" className="data-num">
                    {n.id}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            {[
              ["Notary / stamp", "var(--destructive)"],
              ["Photograph", "var(--warning)"],
              ["Signatory / address", "var(--accent)"],
            ].map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: color }} /> {label}
              </span>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          {selectedNode ? (
            <Panel
              title={selectedNode.name}
              action={
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              }
            >
              <div className="space-y-3 text-sm">
                <p className="text-xs text-muted-foreground">
                  {selectedEdges.length} shared-element link{selectedEdges.length !== 1 ? "s" : ""} detected · cluster{" "}
                  {constellation.clusters.find((c) => c.collegeIds.includes(selectedNode.id))?.id ?? "—"}
                </p>
                {ringFps.map((f) => {
                  const counterpart = f.collegeIds.find((c) => c !== selectedNode.id)!;
                  const d = hammingDistance(f.hash, (getFingerprint(f.id) ?? f).hash);
                  return (
                    <div key={f.id} className="rounded-xl border border-border bg-muted/40 p-3">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide" style={{ color: KIND_COLOR[f.kind] }}>
                        <GitMerge className="size-3.5" /> {f.kind} · hamming {d}
                      </div>
                      <p className="mt-1">{f.label}</p>
                      <div className="mt-2 flex items-center justify-around rounded-lg border border-border bg-background p-2">
                        <div className="text-center">
                          <StampSeal fp={f} size={104} />
                          <p className="mt-1 text-[10px] text-muted-foreground">{selectedNode.id}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">vs</span>
                        <div className="text-center">
                          <StampSeal fp={f} size={104} />
                          <p className="mt-1 text-[10px] text-muted-foreground">{counterpart}</p>
                        </div>
                      </div>
                      <p className="data-num mt-2 text-[10px] text-muted-foreground">hash {f.hash}</p>
                      <p className="mt-1 text-[11px] text-warning">Potential link — needs human verification before any conclusion.</p>
                    </div>
                  );
                })}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => setShowReport(true)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <FileDown className="size-4" /> Generate Ring Report
                  </button>
                  <Link
                    to="/applications/$id"
                    params={{ id: applications.find((a) => a.collegeId === selectedNode.id)?.id ?? "A01" }}
                    className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-center text-sm hover:bg-muted"
                  >
                    Open application
                  </Link>
                </div>
              </div>
            </Panel>
          ) : (
            <Panel title="How to read this graph">
              <p className="text-sm text-muted-foreground">
                Each node is an institution. Glowing edges connect filings that share a document fingerprint — a near-identical notarial seal, an identical
                photograph, a recurring signatory or address. Click any node to inspect the shared element side by side and generate a ring report.
              </p>
            </Panel>
          )}

          <Panel title="Detected clusters">
            <ul className="space-y-2 text-sm">
              {clusterInfo.map((c) => (
                <li key={c.id} className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="data-num text-xs" style={{ color: c.ringId ? "var(--destructive)" : "var(--warning)" }}>
                      {c.id} · {c.kinds.join(", ")}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.collegeIds.length} institutions</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.names.join(" · ")}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {showReport && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm" onClick={() => setShowReport(false)}>
          <div className="panel max-h-[80vh] w-full max-w-2xl overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">Ring Report — cluster of {selectedNode.id}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Generated {new Date().toLocaleString()} · Prototype · Synthetic data</p>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                During fingerprint matching, documents filed by the institutions listed below were found to share one or more elements (seal images, signatory
                identity, correspondence address or photographs) within Hamming distance {">"}= 0 of a common reference fingerprint.
              </p>
              <p>
                This is a <span className="font-semibold text-warning">potential link and requires human verification</span>. Shared elements can have lawful
                explanations (common consultants, shared premises, re-issued seals). No conclusion of wrongdoing is drawn by this system.
              </p>
              <ul className="list-inside list-disc text-xs text-muted-foreground">
                {constellation.clusters
                  .find((c) => c.collegeIds.includes(selectedNode.id))
                  ?.collegeIds.map((id) => (
                    <li key={id}>
                      {id} — {getCollege(id)?.name}, {getCollege(id)?.city}
                    </li>
                  ))}
              </ul>
              <p className="text-xs">
                Recommended next step: physical verification of the original documents and issuer confirmation before any adverse inference.
              </p>
            </div>
            <button onClick={() => setShowReport(false)} className={cn("mt-5 rounded-lg bg-muted px-4 py-2 text-sm hover:bg-muted/70")}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
