import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPinned, Camera, Ruler, AlertTriangle, ListOrdered } from "lucide-react";
import { applications, realityCaseList } from "@/data/synthetic";
import { SplitMap } from "@/components/split-map";
import { Panel } from "@/components/bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reality-twin")({
  head: () => ({
    meta: [
      { title: "Reality Twin — AICTE VerifyAI" },
      { name: "description", content: "Claimed vs observed: EXIF and sun-angle checks, floor-plan norms, satellite footprints and inspection priorities." },
      { property: "og:title", content: "Reality Twin — AICTE VerifyAI" },
      { property: "og:description", content: "Claimed vs observed infrastructure evidence — discrepancy for inspection, not accusation." },
      { property: "og:type", content": "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RealityTwin,
});

function RealityTwin() {
  const [activeId, setActiveId] = useState(realityCaseList[0].collegeId);
  const active = realityCaseList.find((c) => c.collegeId === activeId)!;
  const activeApp = applications.find((a) => a.collegeId === active.collegeId)!;
  const deficit = active.rooms.reduce((s, r) => s + Math.max(0, r.normSqft - r.claimedSqft), 0);
  const sorted = [...realityCaseList].sort((a, b) => b.gapScore - a.gapScore);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold">Reality Twin — Claimed vs Reality</h1>
        <p className="text-sm text-muted-foreground">
          Photographic, geometric and norm-based evidence for inspection prioritisation. Outputs are{" "}
          <span className="text-warning">discrepancies for inspection</span> — not accusations.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <Panel title="Inspection priority list" action={<ListOrdered className="size-4 text-accent" />}>
            <ol className="space-y-2">
              {sorted.map((c, i) => {
                const college = applications.find((a) => a.collegeId === c.collegeId)!;
                const tone = c.gapScore >= 70 ? "destructive" : c.gapScore >= 45 ? "warning" : "success";
                return (
                  <li key={c.collegeId}>
                    <button
                      onClick={() => setActiveId(c.collegeId)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                        c.collegeId === activeId ? "border-primary/60 bg-primary/10" : "border-border bg-muted/40 hover:bg-muted",
                      )}
                    >
                      <span className="data-num w-5 text-sm text-muted-foreground">{i + 1}.</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{college.collegeName}</span>
                        <span className="block text-xs text-muted-foreground">{c.note.slice(0, 64)}…</span>
                      </span>
                      <span
                        className={cn(
                          "data-num rounded-lg px-2 py-1 text-sm font-bold",
                          tone === "destructive" && "bg-destructive/15 text-destructive",
                          tone === "warning" && "bg-warning/15 text-warning",
                          tone === "success" && "bg-success/15 text-success",
                        )}
                      >
                        {c.gapScore}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <Panel title="Photo forensics" action={<Camera className="size-4 text-primary" />}>
            <dl className="space-y-2 text-sm">
              {[
                ["File", active.photoExif.fileName],
                ["EXIF GPS", active.photoExif.gps],
                ["Captured", new Date(active.photoExif.capturedAt).toLocaleString()],
                ["Camera", active.photoExif.camera],
                ["Expected sun azimuth", `${active.photoExif.expectedSunAzimuth}°`],
                ["Shadow direction observed", `${active.photoExif.shadowDirectionObserved}°`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-border/40 pb-1.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="data-num text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <p
              className={cn(
                "mt-3 rounded-lg border p-2.5 text-xs",
                active.photoExif.plausibility === "implausible" && "border-destructive/40 bg-destructive/10 text-destructive",
                active.photoExif.plausibility === "consistent" && "border-success/40 bg-success/10 text-success",
                active.photoExif.plausibility === "inconclusive" && "border-border bg-muted/60 text-muted-foreground",
              )}
            >
              <AlertTriangle className="mr-1.5 inline size-3.5" />
              {active.photoExif.plausibilityNote}
            </p>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            title={`${activeApp.collegeName} — split map view`}
            action={
              <span className="data-num flex items-center gap-2 text-sm">
                <MapPinned className="size-4 text-primary" /> Reality Gap Score
                <span className={cn("rounded px-2 py-0.5 font-bold", active.gapScore >= 70 ? "bg-destructive/15 text-destructive" : active.gapScore >= 45 ? "bg-warning/15 text-warning" : "bg-success/15 text-success")}>
                  {active.gapScore}
                </span>
              </span>
            }
          >
            <SplitMap caseData={active} />
            <p className="mt-3 text-sm text-muted-foreground">{active.note}</p>
          </Panel>

          <Panel title="Floor plan vs AICTE-style norms" action={<Ruler className="size-4 text-primary" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4">Room</th>
                    <th className="py-2 pr-4">Claimed</th>
                    <th className="py-2 pr-4">Norm</th>
                    <th className="py-2">Deviation</th>
                  </tr>
                </thead>
                <tbody className="data-num">
                  {active.rooms.map((r) => {
                    const dev = r.claimedSqft - r.normSqft;
                    return (
                      <tr key={r.name} className="border-b border-border/40">
                        <td className="py-2 pr-4 font-sans">{r.name}</td>
                        <td className="py-2 pr-4">{r.claimedSqft} sq ft</td>
                        <td className="py-2 pr-4 text-muted-foreground">{r.normSqft} sq ft</td>
                        <td className={cn("py-2 font-medium", dev < 0 ? "text-destructive" : "text-success")}>
                          {dev < 0 ? "" : "+"}
                          {dev} sq ft
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Total shortfall against norms: <span className="data-num font-semibold text-destructive">{deficit.toLocaleString()} sq ft</span> · norms are
              configurable per programme and cycle in the engine configuration.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
