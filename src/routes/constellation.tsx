import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force";
import {
  X,
  FileDown,
  GitMerge,
  Network,
  RotateCcw,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { applications, constellation, getCollege, getFingerprint } from "@/data/synthetic";
import { hammingDistance } from "@/lib/fingerprint";
import { StampSeal } from "@/data/doc-renderer";
import { Panel } from "@/components/bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/constellation")({
  head: () => ({
    meta: [
      { title: "Fraud Constellation — AICTE VerifyAI" },
      {
        name: "description",
        content:
          "Interactive graph of institutions linked by shared document fingerprints: stamps, seals, photos, signatories.",
      },
      { property: "og:title", content: "Fraud Constellation — AICTE VerifyAI" },
      {
        property: "og:description",
        content:
          "Institutions linked by shared document elements — potential links, needs human verification.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConstellationPage,
});

type GNode = {
  id: string;
  name: string;
  ringId?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
};

type GLink = {
  source: string | GNode;
  target: string | GNode;
  kind: string;
  ringId?: string;
  distance: number;
};

const KIND_COLOR: Record<string, string> = {
  notary: "#F43F5E",
  stamp: "#F43F5E",
  photo: "#F59E0B",
  signatory: "#F5C542",
  address: "#38BDF8",
  pdf_meta: "#9E9485",
};

function ConstellationPage() {
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<string | null>("C06");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    const links: GLink[] = edges.map((e) => ({
      source: e.a,
      target: e.b,
      kind: e.kind,
      ringId: e.ringId,
      distance: e.distance,
    }));
    nodesRef.current = nodes;
    linksRef.current = links;

    const sim = forceSimulation<GNode>(nodes)
      .force(
        "link",
        forceLink<GNode, GLink>(links)
          .id((d) => d.id)
          .distance(115)
          .strength(0.35)
      )
      .force("charge", forceManyBody().strength(-340))
      .force("center", forceCenter(430, 330))
      .force("collide", forceCollide(36))
      .on("tick", () => setTick((t) => t + 1));

    simRef.current = sim;
    return () => {
      sim.stop();
    };
  }, []);

  const restartSimulation = () => {
    if (simRef.current) {
      simRef.current.alpha(0.6).restart();
    }
  };

  const selectedNode = selected ? nodesRef.current.find((n) => n.id === selected) : null;
  const selectedEdges = selected
    ? constellation.edges.filter((e) => e.a === selected || e.b === selected)
    : [];
  const selectedFps = [...new Set(selectedEdges.map((e) => e.fingerprintId))]
    .map((id) => getFingerprint(id)!)
    .filter(Boolean);
  const ringFps = selectedFps.filter((f) => f.collegeIds.length > 1);

  // Connected node IDs for highlighting
  const connectedNodeIds = useMemo(() => {
    if (!selected) return new Set<string>();
    const ids = new Set<string>([selected]);
    selectedEdges.forEach((e) => {
      ids.add(e.a);
      ids.add(e.b);
    });
    return ids;
  }, [selected, selectedEdges]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF9933] uppercase tracking-wider font-bold mb-1">
            <Network className="size-3.5" /> Graph Collision Analytics
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Fraud Constellation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Inter-institutional graph intelligence identifying shared notary stamps, recycled photos, and duplicate signatories across filings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={restartSimulation}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            <RotateCcw className="size-3.5 text-primary" />
            <span>Re-center Graph</span>
          </button>
        </div>
      </header>

      {/* Advisory Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-3.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-amber-300">
          <AlertTriangle className="size-4 shrink-0 text-amber-400" />
          <span>
            <strong className="font-semibold">Regulatory Standard:</strong> Graph linkages are evidentiary leads
            requiring physical officer verification. Shared elements may represent legitimate consultants or shared legal chambers.
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase text-muted-foreground hidden md:inline">
          C++ CORE ENGINE
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1.1fr]">
        {/* Interactive Graph Panel */}
        <Panel className="relative min-h-[660px] overflow-hidden p-0 rounded-2xl border border-border bg-[#0E0C0A]">
          {/* Top Filter Controls HUD */}
          <div className="absolute top-4 inset-x-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-[#14110E]/90 p-1 text-xs backdrop-blur-md">
              {[
                { id: "all", label: "All Links" },
                { id: "notary", label: "Notaries" },
                { id: "photo", label: "Photos" },
                { id: "signatory", label: "Signatories" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setKindFilter(f.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                    kindFilter === f.id
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] font-mono text-[#A89F91] rounded-xl border border-border/80 bg-[#14110E]/90 px-3 py-1.5 backdrop-blur-md">
              {nodesRef.current.length} Institutions · {constellation.edges.length} Edges
            </div>
          </div>

          <svg width="100%" height={640} viewBox="0 0 860 660" data-tick={tick} className="select-none">
            <defs>
              <filter id="glow-red" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="graph-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 153, 51, 0.05)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Background radial highlight */}
            <circle cx="430" cy="330" r="300" fill="url(#graph-bg)" />

            {/* Links */}
            {linksRef.current.map((l, i) => {
              const s = l.source as GNode;
              const t = l.target as GNode;
              if (typeof s === "string" || typeof t === "string" || !s.x || !t.x) return null;

              if (kindFilter !== "all" && l.kind !== kindFilter) return null;

              const isHighlighted =
                selected && (s.id === selected || t.id === selected);

              return (
                <line
                  key={i}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke={KIND_COLOR[l.kind] ?? "#9E9485"}
                  strokeOpacity={isHighlighted ? 0.95 : l.ringId ? 0.5 : 0.2}
                  strokeWidth={isHighlighted ? 3 : l.ringId ? 2 : 1.2}
                  strokeDasharray={l.ringId ? undefined : "4 4"}
                />
              );
            })}

            {/* Nodes */}
            {nodesRef.current.map((n) => {
              const ringEdge = constellation.edges.find(
                (e) => (e.a === n.id || e.b === n.id) && e.ringId
              );
              const color = ringEdge ? KIND_COLOR[ringEdge.kind] : "#9E9485";
              const isSelected = n.id === selected;
              const isConnected = connectedNodeIds.has(n.id);

              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x ?? 0},${n.y ?? 0})`}
                  onClick={() => setSelected(n.id)}
                  style={{ cursor: "pointer" }}
                  className="transition-transform group"
                >
                  {/* Outer glow ring */}
                  <circle
                    r={isSelected ? 18 : isConnected ? 15 : 12}
                    fill={color}
                    fillOpacity={isSelected ? 0.35 : 0.18}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : isConnected ? 2 : 1.5}
                    filter={n.ringId || isSelected ? "url(#glow-red)" : undefined}
                  />

                  {/* Core dot */}
                  <circle r={isSelected ? 5 : 4} fill={isSelected ? "#FFF" : color} />

                  {/* Labels */}
                  <text
                    y={28}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={isSelected ? 700 : 500}
                    fill={isSelected ? "#FF9933" : "#F5EFE6"}
                    opacity={isSelected ? 1 : isConnected ? 0.9 : 0.75}
                    fontFamily="var(--font-display)"
                  >
                    {getCollege(n.id)?.name.split(" ").slice(0, 2).join(" ")}
                  </text>
                  <text
                    y={40}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#9E9485"
                    className="data-num"
                  >
                    {n.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bottom Left Legend */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-4 text-xs font-mono text-muted-foreground rounded-xl border border-border/80 bg-[#14110E]/90 p-3 backdrop-blur-md">
            {[
              ["Notary / Stamp Reuse", "#F43F5E"],
              ["Duplicate Photograph", "#F59E0B"],
              ["Signatory / Chamber", "#F5C542"],
            ].map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: color }} />
                <span>{label}</span>
              </span>
            ))}
          </div>
        </Panel>

        {/* Forensic Side Inspector Panel */}
        <div className="space-y-4">
          {selectedNode ? (
            <Panel
              title={`Forensic Dossier: ${selectedNode.id}`}
              action={
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Deselect node"
                >
                  <X className="size-4" />
                </button>
              }
            >
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {selectedNode.name}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {selectedEdges.length} Shared-Element Link{selectedEdges.length !== 1 ? "s" : ""} Isolated
                    · Cluster {constellation.clusters.find((c) => c.collegeIds.includes(selectedNode.id))?.id ?? "None"}
                  </p>
                </div>

                {ringFps.map((f) => {
                  const counterpart = f.collegeIds.find((c) => c !== selectedNode.id)!;
                  const d = hammingDistance(f.hash, (getFingerprint(f.id) ?? f).hash);
                  return (
                    <div
                      key={f.id}
                      className="rounded-xl border border-border bg-[#14110E] p-3.5 space-y-2.5"
                    >
                      <div
                        className="flex items-center justify-between text-xs font-mono uppercase font-bold"
                        style={{ color: KIND_COLOR[f.kind] }}
                      >
                        <span className="flex items-center gap-1.5">
                          <GitMerge className="size-3.5" /> {f.kind.toUpperCase()} COLLISION
                        </span>
                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">
                          Hamming: {d} bits
                        </span>
                      </div>

                      <p className="text-xs text-foreground font-medium">{f.label}</p>

                      {/* Side by side stamp comparison */}
                      <div className="flex items-center justify-around rounded-xl border border-border/80 bg-[#0E0C0A] p-3">
                        <div className="text-center">
                          <StampSeal fp={f} size={96} />
                          <p className="mt-1 font-mono text-[11px] font-bold text-primary">
                            {selectedNode.id}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground uppercase font-bold">
                          VS
                        </span>
                        <div className="text-center">
                          <StampSeal fp={f} size={96} />
                          <p className="mt-1 font-mono text-[11px] font-bold text-amber-400">
                            {counterpart}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                        <span>Fingerprint:</span>
                        <span className="text-foreground">0x{f.hash}</span>
                      </div>

                      <p className="text-[11px] text-amber-400 leading-snug">
                        Potential duplicate seal detected across independent institutional filings.
                      </p>
                    </div>
                  );
                })}

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => setShowReport(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
                  >
                    <FileDown className="size-4" /> Generate Formal Ring Report
                  </button>

                  <Link
                    to="/applications/$id"
                    params={{
                      id: applications.find((a) => a.collegeId === selectedNode.id)?.id ?? "A01",
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
                  >
                    <span>Open Case Dossier</span>
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </Panel>
          ) : (
            <Panel title="Forensic Graph Guide">
              <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Each node represents an accredited technical campus. Luminous edges represent cryptographic near-duplicate
                  hashes identified across statutory legal documents.
                </p>
                <p>
                  Click on any node in the constellation graph to inspect its matching seal stamps, calculate bit Hamming distances,
                  and generate a formal vigilance inquiry report.
                </p>
              </div>
            </Panel>
          )}

          {/* Detected Collusion Clusters Summary */}
          <Panel title="Isolated Collusion Rings">
            <ul className="space-y-2.5 text-xs">
              {clusterInfo.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-border/80 bg-[#14110E] p-3 hover:border-primary/40 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: c.ringId ? "#F43F5E" : "#F59E0B" }}
                    >
                      {c.id} · {c.kinds.join(", ").toUpperCase()}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {c.collegeIds.length} Campuses
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-snug truncate">
                    {c.names.join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Ring Report Dialog Modal */}
      {showReport && selectedNode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm"
          onClick={() => setShowReport(false)}
        >
          <div
            className="panel max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6 rounded-2xl border border-border bg-[#14110E] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/70 pb-4 mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Statutory Vigilance Inquiry — Cluster {selectedNode.id}
                </h3>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  Ref: AICTE/APH/VIG/2025-26 · Generated {new Date().toLocaleDateString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setShowReport(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
              <p>
                During automated perceptual hash matching, statutory documents filed by the institutions listed below
                exhibited cryptographic collision within a threshold of 4 bits on 64-bit SimHash representations.
              </p>
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-300 font-medium">
                NOTICE: This finding represents an evidentiary flag for officer review. Formal physical verification of original
                stamped deeds is required prior to any statutory sanction or adverse recommendation.
              </div>
              <div>
                <div className="font-bold text-foreground uppercase tracking-wider font-mono mb-1.5">
                  Linked Institutions in Cluster:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {constellation.clusters
                    .find((c) => c.collegeIds.includes(selectedNode.id))
                    ?.collegeIds.map((id) => (
                      <li key={id} className="text-foreground">
                        {id} — {getCollege(id)?.name} ({getCollege(id)?.city}, {getCollege(id)?.state})
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end gap-2.5">
              <button
                onClick={() => setShowReport(false)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
