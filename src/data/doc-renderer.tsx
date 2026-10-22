// SVG renderer for synthetic "scanned" documents and stamp/seal fingerprints.
// Coordinates follow the canonical layout in src/data/doc-layout.ts.

import { PAGE_H, PAGE_W, HEADER, FIELD_START_Y, FIELD_ROW_H, FIELD_LABEL_X, FIELD_VALUE_X, STAMP, QR, SIGN, PHOTO, fieldRowY, TABLE_Y } from "@/data/doc-layout";
import type { AppDoc, EvidenceBox, Fingerprint } from "@/data/types";

function qrCells(seed: string): boolean[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  let a = h || 12345;
  for (let i = 0; i < 81; i++) {
    a = (a * 1664525 + 1013904223) >>> 0;
    cells.push(((a >>> 16) & 1) === 1);
  }
  return cells;
}

function qrPattern(x: number, y: number, size: number, seed: string) {
  const n = 9;
  const cell = size / n;
  const on = qrCells(seed);
  // corner finder patterns
  const finder = (fx: number, fy: number) => (
    <g key={`f${fx}${fy}`}>
      <rect x={x + fx * cell} y={y + fy * cell} width={cell * 3} height={cell * 3} fill="var(--paper-ink)" />
      <rect x={x + (fx + 1) * cell} y={y + (fy + 1) * cell} width={cell} height={cell} fill="var(--paper)" />
    </g>
  );
  return (
    <g>
      {finder(0, 0)}
      {finder(6, 0)}
      {finder(0, 6)}
      {on.map((o, i) => {
        const cx = i % n;
        const cy = Math.floor(i / n);
        const inFinder = (cx < 4 && cy < 4) || (cx > 4 && cy < 4) || (cx < 4 && cy > 4);
        if (!o || inFinder) return null;
        return <rect key={i} x={x + cx * cell} y={y + cy * cell} width={cell} height={cell} fill="var(--paper-ink)" />;
      })}
    </g>
  );
}

function InkLines({ x, y, w, count, gap = 14 }: { x: number; y: number; w: number; count: number; gap?: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <rect key={i} x={x} y={y + i * gap} width={w - (i === count - 1 ? w * 0.35 : 0)} height={6} rx={3} fill="var(--paper-muted)" opacity={0.28} />
      ))}
    </g>
  );
}

export function StampSeal({ fp, size = 130 }: { fp: Fingerprint; size?: number }) {
  const meta = safeMeta(fp.meta);
  const hue = Number(meta.hue ?? 12);
  const color = fp.kind === "stamp" ? `oklch(0.55 0.16 ${hue})` : "var(--stamp-red)";
  const r = size / 2;
  const bits = BigInt("0x" + fp.hash);
  const ticks = Array.from({ length: 64 }, (_, i) => (bits >> BigInt(i)) & 1n);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <g transform={`rotate(-8 ${r} ${r})`}>
        <circle cx={r} cy={r} r={r - 3} fill="none" stroke={color} strokeWidth={4} opacity={0.85} />
        <circle cx={r} cy={r} r={r - 12} fill="none" stroke={color} strokeWidth={1.5} opacity={0.7} />
        {/* hash-derived tick ring: near-identical hashes look near-identical */}
        {ticks.map((t, i) => {
          const a = (i / 64) * Math.PI * 2;
          const x1 = r + Math.sin(a) * (r - 12);
          const y1 = r - Math.cos(a) * (r - 12);
          const x2 = r + Math.sin(a) * (r - (t ? 18 : 21));
          const y2 = r - Math.cos(a) * (r - (t ? 18 : 21));
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.4} opacity={0.75} />;
        })}
        <text x={r} y={r - 8} textAnchor="middle" fontSize={9.5} fill={color} style={{ fontFamily: "var(--font-mono)" }}>
          {String(meta.serial ?? "").slice(0, 12)}
        </text>
        <text x={r} y={r + 6} textAnchor="middle" fontSize={8} fill={color} opacity={0.9}>
          {String(meta.docIssuer ?? "ISSUER").toUpperCase().slice(0, 22)}
        </text>
        <text x={r} y={r + 18} textAnchor="middle" fontSize={7} fill={color} opacity={0.75} style={{ fontFamily: "var(--font-mono)" }}>
          {fp.hash.slice(0, 8)}
        </text>
      </g>
    </svg>
  );
}

function safeMeta(meta: string): Record<string, unknown> {
  try {
    return JSON.parse(meta) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function DocumentScan({
  doc,
  activeEvidenceId,
  onEvidenceClick,
}: {
  doc: AppDoc;
  activeEvidenceId?: string;
  onEvidenceClick?: (ev: EvidenceBox) => void;
}) {
  const isPhoto = doc.type === "site_photo";
  const showStamp = doc.type !== "site_photo";
  const title = doc.fields[0]?.value ?? doc.fileName;
  return (
    <svg viewBox={`0 0 ${PAGE_W} ${PAGE_H}`} className="w-full h-auto rounded-lg" role="img" aria-label={`Scanned ${doc.classification}`}>
      <rect width={PAGE_W} height={PAGE_H} fill="var(--paper)" />
      {/* scan noise */}
      <rect width={PAGE_W} height={PAGE_H} fill="var(--paper-line)" opacity={0.18} />
      {/* header */}
      <text x={PAGE_W / 2} y={HEADER.y} textAnchor="middle" fontSize={17} fontWeight={700} fill="var(--paper-ink)" style={{ fontFamily: "var(--font-display)" }}>
        {doc.classification.toUpperCase()}
      </text>
      <line x1={80} y1={HEADER.y + 12} x2={PAGE_W - 80} y2={HEADER.y + 12} stroke="var(--paper-ink)" strokeWidth={1.5} opacity={0.6} />
      <text x={PAGE_W / 2} y={HEADER.subY} textAnchor="middle" fontSize={10} fill="var(--paper-muted)">
        {doc.issuer} · Ref {doc.fields.find((f) => f.label === "Document No.")?.value ?? "—"}
      </text>
      {/* fields */}
      {doc.fields.slice(0, 7).map((f, i) => (
        <g key={f.label}>
          <text x={FIELD_LABEL_X} y={fieldRowY(i)} fontSize={10.5} fill="var(--paper-muted)">
            {f.label}
          </text>
          <text x={FIELD_VALUE_X} y={fieldRowY(i)} fontSize={11.5} fill="var(--paper-ink)" style={{ fontFamily: "var(--font-mono)" }}>
            {f.value}
          </text>
        </g>
      ))}
      {/* body paragraph */}
      <InkLines x={FIELD_LABEL_X} y={TABLE_Y + 40} w={PAGE_W - 120} count={7} />
      {/* photo or table */}
      {isPhoto ? (
        <g>
          <rect x={PHOTO.x} y={PHOTO.y} width={PHOTO.w} height={PHOTO.h} fill="var(--paper-line)" stroke="var(--paper-ink)" strokeWidth={1} />
          {/* simple building silhouette */}
          <rect x={PHOTO.x + 40} y={PHOTO.y + 120} width={110} height={PHOTO.h - 120} fill="var(--paper-muted)" opacity={0.5} />
          <rect x={PHOTO.x + 150} y={PHOTO.y + 170} width={70} height={PHOTO.h - 170} fill="var(--paper-muted)" opacity={0.38} />
          <polygon points={`${PHOTO.x + 30},${PHOTO.y + 120} ${PHOTO.x + 95},${PHOTO.y + 80} ${PHOTO.x + 160},${PHOTO.y + 120}`} fill="var(--paper-muted)" opacity={0.6} />
          <text x={PHOTO.x + PHOTO.w / 2} y={PHOTO.y + PHOTO.h + 20} textAnchor="middle" fontSize={9.5} fill="var(--paper-muted)">
            Site photograph — front elevation
          </text>
        </g>
      ) : (
        <InkLines x={FIELD_LABEL_X} y={FIELD_START_Y + FIELD_ROW_H * 7 + 20} w={PAGE_W - 120} count={4} />
      )}
      {/* declaration */}
      <text x={FIELD_LABEL_X} y={590} fontSize={9} fill="var(--paper-muted)">
        I hereby declare that the information furnished above is true to the best of my knowledge.
      </text>
      {/* QR */}
      {qrPattern(QR.x, QR.y, QR.w, doc.id)}
      <text x={QR.x + QR.w / 2} y={QR.y + QR.h + 16} textAnchor="middle" fontSize={8} fill="var(--paper-muted)">
        Issuer verification QR
      </text>
      {/* signature */}
      <path
        d={`M ${SIGN.x} ${SIGN.y + 28} q 18 -34 40 -10 q 16 18 34 -6 q 14 -20 36 2 q 20 22 44 -12 q 12 -14 26 2`}
        fill="none"
        stroke="var(--stamp-blue)"
        strokeWidth={2}
        opacity={0.85}
      />
      <line x1={SIGN.x} y1={SIGN.y + 38} x2={SIGN.x + SIGN.w} y2={SIGN.y + 38} stroke="var(--paper-ink)" strokeWidth={1} />
      <text x={SIGN.x} y={SIGN.y + 52} fontSize={8.5} fill="var(--paper-muted)">
        Authorised signatory
      </text>
      {/* stamp */}
      {showStamp && (
        <g transform={`translate(${STAMP.x + STAMP.w / 2 - 62}, ${STAMP.y + STAMP.h / 2 - 62})`}>
          <StampSealSvg doc={doc} size={124} />
        </g>
      )}
      {/* evidence boxes */}
      {doc.evidence.map((ev) => {
        const active = ev.id === activeEvidenceId;
        const color = ev.severity === "high" ? "var(--destructive)" : ev.severity === "medium" ? "var(--warning)" : "var(--primary)";
        return (
          <g key={ev.id} onClick={() => onEvidenceClick?.(ev)} style={{ cursor: "pointer" }}>
            <rect
              x={ev.x}
              y={ev.y}
              width={ev.w}
              height={ev.h}
              fill={color}
              fillOpacity={active ? 0.22 : 0.1}
              stroke={color}
              strokeWidth={active ? 3 : 1.6}
              rx={3}
            />
            <circle cx={ev.x + 2} cy={ev.y + 2} r={11} fill={color} />
            <text x={ev.x + 2} y={ev.y + 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--paper)">
              !
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StampSealSvg({ doc, size }: { doc: AppDoc; size: number }) {
  const fpKind = doc.type === "affidavit" ? "notary" : "stamp";
  const synthetic: Fingerprint = {
    id: doc.id,
    kind: fpKind,
    label: doc.issuer,
    hash: stubHash(doc.id),
    meta: JSON.stringify({ docIssuer: doc.issuer, serial: doc.fields.find((f) => f.label === "Document No.")?.value, hue: fpKind === "notary" ? 12 : 260 }),
    collegeIds: [],
    docIds: [doc.id],
  };
  return <StampSeal fp={synthetic} size={size} />;
}

function stubHash(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let h2 = Math.imul(h, 0x85ebca6b) >>> 0;
  return (h.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0"));
}
