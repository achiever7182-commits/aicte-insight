import { useEffect, useRef, useState } from "react";
import type { RealityCase } from "@/data/types";
import { claimedPolygons, applications } from "@/data/synthetic";

// Leaflet is loaded dynamically (browser-only) inside useEffect.
export function SplitMap({ caseData }: { caseData: RealityCase }) {
  const claimedRef = useRef<HTMLDivElement>(null);
  const satelliteRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const claimed = claimedPolygons.get(caseData.collegeId) ?? [];
  const observed = caseData.footprintPolygon;

  useEffect(() => {
    let maps: { remove(): void }[] = [];
    let cancelled = false;
    (async () => {
      try {
        const L = await import("leaflet");
        await import("leaflet/dist/leaflet.css");
        if (cancelled || !claimedRef.current || !satelliteRef.current) return;
        const center: [number, number] = [caseData.claimCoordinates.lat, caseData.claimCoordinates.lng];

        const make = (
          el: HTMLDivElement,
          poly: [number, number][],
          color: string,
          tiles: string,
          attribution: string,
        ) => {
          const map = L.map(el, { scrollWheelZoom: false, attributionControl: true });
          L.tileLayer(tiles, { maxZoom: 19, attribution }).addTo(map);
          const layer = L.polygon(poly, { color, weight: 2, fillColor: color, fillOpacity: 0.25 }).addTo(map);
          map.fitBounds(layer.getBounds().pad(0.35));
          return map;
        };

        const m1 = make(
          claimedRef.current,
          claimed,
          "var(--primary)",
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "© OpenStreetMap",
        );
        const m2 = make(
          satelliteRef.current,
          observed,
          "var(--destructive)",
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          "Esri World Imagery",
        );
        maps = [m1 as unknown as { remove(): void }, m2 as unknown as { remove(): void }];
        setTimeout(() => {
          m1.invalidateSize();
          m2.invalidateSize();
        }, 150);
      } catch (e) {
        setError("Map tiles could not be loaded in this environment.");
      }
    })();
    return () => {
      cancelled = true;
      maps.forEach((m) => m.remove());
    };
  }, [caseData.collegeId]);

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-warning">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <figure>
          <div ref={claimedRef} className="h-72 w-full rounded-xl border border-primary/40" />
          <figcaption className="mt-1.5 text-xs text-muted-foreground">
            Claimed footprint — per application · {caseData.claimedBuiltUpSqft.toLocaleString()} sq ft across {caseData.floors} floors
          </figcaption>
        </figure>
        <figure>
          <div ref={satelliteRef} className="h-72 w-full rounded-xl border border-destructive/40" />
          <figcaption className="mt-1.5 text-xs text-muted-foreground">
            Observed footprint — satellite/OSM · {caseData.satelliteFootprintSqft.toLocaleString()} sq ft estimated · overlap {caseData.overlapPct}%
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

function polygonFor(center: { lat: number; lng: number }, targetAreaSqft: number, seed: number, jitter: number): [number, number][] {
  const a = seed * 2654435761;
  let s = a >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const SQFT_PER_DEG_LAT = 364000;
  const latR = Math.sqrt(targetAreaSqft / Math.PI) / SQFT_PER_DEG_LAT;
  const lngR = latR / Math.cos((center.lat * Math.PI) / 180);
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2;
    const w = 1 + (rnd() - 0.5) * jitter;
    pts.push([center.lat + Math.sin(ang) * latR * w, center.lng + Math.cos(ang) * lngR * w]);
  }
  return pts;
}
