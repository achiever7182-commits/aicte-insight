import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  MapPinned,
  Camera,
  Ruler,
  AlertTriangle,
  ListOrdered,
  Sun,
  Compass,
  Building,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { applications, realityCaseList } from "@/data/synthetic";
import { SplitMap } from "@/components/split-map";
import { Panel } from "@/components/bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reality-twin")({
  head: () => ({
    meta: [
      { title: "Reality Twin — AICTE VerifyAI" },
      {
        name: "description",
        content:
          "Claimed vs observed: EXIF and sun-angle checks, floor-plan norms, satellite footprints and inspection priorities.",
      },
      { property: "og:title", content: "Reality Twin — AICTE VerifyAI" },
      {
        property: "og:description",
        content: "Claimed vs observed infrastructure evidence — discrepancy for inspection, not accusation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RealityTwin,
});

function RealityTwin() {
  const [activeId, setActiveId] = useState(realityCaseList[0].collegeId);
  const active = realityCaseList.find((c) => c.collegeId === activeId) ?? realityCaseList[0];
  const activeApp = applications.find((a) => a.collegeId === active.collegeId) ?? applications[0];
  const deficit = active.rooms.reduce((s, r) => s + Math.max(0, r.normSqft - r.claimedSqft), 0);
  const sorted = [...realityCaseList].sort((a, b) => b.gapScore - a.gapScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF9933] uppercase tracking-wider font-bold mb-1">
            <Compass className="size-3.5" /> Geospatial &amp; Multimodal Physical Audit
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Reality Twin — Claimed vs Satellite</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Photogrammetric, geometric, and solar-azimuth shadow validation prioritizing physical campus scrutiny.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/applications/$id"
            params={{ id: activeApp.id }}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            <span>Review Full Dossier ({activeApp.id})</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* Advisory Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-3.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-amber-300">
          <AlertTriangle className="size-4 shrink-0 text-amber-400" />
          <span>
            <strong className="font-semibold">Inspection Prioritisation:</strong> Reality Twin outputs are
            discrepancy signals designed to guide physical inspection teams, not automated rejections.
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase text-muted-foreground hidden md:inline">
          ISRO / ESRI TILE FEED
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.9fr]">
        {/* Left Column: Priority List & Photo Forensics */}
        <div className="space-y-4">
          <Panel
            title="Inspection Priority Ranking"
            action={<ListOrdered className="size-4 text-primary" />}
          >
            <ol className="space-y-2">
              {sorted.map((c, i) => {
                const college = applications.find((a) => a.collegeId === c.collegeId)!;
                const tone =
                  c.gapScore >= 70
                    ? "destructive"
                    : c.gapScore >= 45
                    ? "warning"
                    : "success";
                return (
                  <li key={c.collegeId}>
                    <button
                      onClick={() => setActiveId(c.collegeId)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                        c.collegeId === activeId
                          ? "border-primary/60 bg-primary/10 shadow-sm"
                          : "border-border bg-muted/40 hover:bg-muted/70"
                      )}
                    >
                      <span className="data-num w-5 text-xs font-bold text-muted-foreground">
                        0{i + 1}.
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs sm:text-sm font-semibold text-foreground">
                          {college.collegeName}
                        </span>
                        <span className="block text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                          {c.note.slice(0, 56)}…
                        </span>
                      </span>
                      <span
                        className={cn(
                          "data-num rounded-lg px-2 py-0.5 text-xs font-black shrink-0",
                          tone === "destructive" && "bg-rose-500/15 text-rose-400 border border-rose-500/30",
                          tone === "warning" && "bg-amber-500/15 text-amber-400 border border-amber-500/30",
                          tone === "success" && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        )}
                      >
                        {c.gapScore} GAP
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Panel>

          {/* Photo Forensics & Solar Azimuth */}
          <Panel title="Multimodal Photo Forensics" action={<Camera className="size-4 text-primary" />}>
            <dl className="space-y-2 text-xs">
              {[
                ["Source Photograph", active.photoExif.fileName],
                ["Camera Sensor", active.photoExif.camera],
                ["GPS Coordinates", active.photoExif.gps],
                [
                  "Timestamp Recorded",
                  new Date(active.photoExif.capturedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                ],
                ["Expected Sun Azimuth", `${active.photoExif.expectedSunAzimuth}°`],
                ["Observed Shadow Angle", `${active.photoExif.shadowDirectionObserved}°`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-border/40 pb-1.5">
                  <dt className="text-muted-foreground font-mono">{k}</dt>
                  <dd className="data-num text-right font-medium text-foreground">{v}</dd>
                </div>
              ))}
            </dl>

            <div
              className={cn(
                "mt-4 rounded-xl border p-3 text-xs leading-relaxed",
                active.photoExif.plausibility === "implausible" &&
                  "border-rose-500/40 bg-rose-950/20 text-rose-300",
                active.photoExif.plausibility === "consistent" &&
                  "border-emerald-500/40 bg-emerald-950/20 text-emerald-300",
                active.photoExif.plausibility === "inconclusive" &&
                  "border-border bg-muted/60 text-muted-foreground"
              )}
            >
              <div className="font-bold font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sun className="size-3.5" />
                <span>Verdict: {active.photoExif.plausibility.toUpperCase()}</span>
              </div>
              <p>{active.photoExif.plausibilityNote}</p>
            </div>
          </Panel>
        </div>

        {/* Right Column: Split Map & Norms Breakdown */}
        <div className="space-y-4">
          <Panel
            title={`${activeApp.collegeName} — Footprint Discrepancy`}
            action={
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">Gap Index:</span>
                <span
                  className={cn(
                    "data-num rounded px-2.5 py-0.5 text-xs font-bold",
                    active.gapScore >= 70
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      : active.gapScore >= 45
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  )}
                >
                  {active.gapScore} / 100
                </span>
              </div>
            }
          >
            {/* Area Comparison Summary Pills */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-xs font-mono">
              <div className="p-3 rounded-xl border border-border bg-muted/40">
                <span className="text-muted-foreground block text-[11px]">Claimed Built-Up</span>
                <span className="text-foreground font-black text-base mt-0.5 block">
                  {active.claimedBuiltUpSqft.toLocaleString()} sq ft
                </span>
                <span className="text-muted-foreground text-[10px]">{active.floors} Floors Declared</span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/40">
                <span className="text-muted-foreground block text-[11px]">Observed Satellite</span>
                <span className="text-rose-400 font-black text-base mt-0.5 block">
                  {active.satelliteFootprintSqft.toLocaleString()} sq ft
                </span>
                <span className="text-muted-foreground text-[10px]">Sub-pixel Detection</span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/40">
                <span className="text-muted-foreground block text-[11px]">Polygon Overlap</span>
                <span className="text-amber-400 font-black text-base mt-0.5 block">
                  {active.overlapPct}%
                </span>
                <span className="text-muted-foreground text-[10px]">Spatial Concordance</span>
              </div>
            </div>

            <SplitMap caseData={active} />

            <div className="mt-4 p-3 rounded-xl border border-border/80 bg-muted/30 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
              <Layers className="size-4 text-primary shrink-0 mt-0.5" />
              <span>{active.note}</span>
            </div>
          </Panel>

          {/* Floor plan vs AICTE Statutory Norms Table */}
          <Panel
            title="Room Dimensions vs Statutory Norms (APH 2025-26)"
            action={<Ruler className="size-4 text-primary" />}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left uppercase font-mono tracking-wider text-muted-foreground">
                    <th className="py-2.5 pr-4">Room Classification</th>
                    <th className="py-2.5 pr-4">Claimed Area</th>
                    <th className="py-2.5 pr-4">AICTE Mandatory Norm</th>
                    <th className="py-2.5 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="data-num">
                  {active.rooms.map((r) => {
                    const dev = r.claimedSqft - r.normSqft;
                    return (
                      <tr key={r.name} className="border-b border-border/40 hover:bg-muted/40 transition">
                        <td className="py-2.5 pr-4 font-sans font-medium text-foreground">{r.name}</td>
                        <td className="py-2.5 pr-4 text-foreground">{r.claimedSqft.toLocaleString()} sq ft</td>
                        <td className="py-2.5 pr-4 text-muted-foreground">{r.normSqft.toLocaleString()} sq ft</td>
                        <td
                          className={cn(
                            "py-2.5 text-right font-bold",
                            dev < 0 ? "text-rose-400" : "text-emerald-400"
                          )}
                        >
                          {dev < 0 ? "" : "+"}
                          {dev.toLocaleString()} sq ft
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cumulative Shortfall Against Norms:</span>
              <span className="data-num font-mono font-bold text-rose-400">
                {deficit.toLocaleString()} sq ft deficit
              </span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
