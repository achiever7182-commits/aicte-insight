import { cn } from "@/lib/utils";
import type { TrustScore, VerificationStatus } from "@/data/types";

export const VERIFICATION_META: Record<VerificationStatus, { label: string; cls: string }> = {
  verified: { label: "Verified", cls: "text-success bg-success/10 border-success/30" },
  mismatch: { label: "Mismatch", cls: "text-destructive bg-destructive/10 border-destructive/30" },
  expired: { label: "Expired", cls: "text-destructive bg-destructive/10 border-destructive/30" },
  pending: { label: "Pending", cls: "text-warning bg-warning/10 border-warning/30" },
  source_unavailable: { label: "Source unavailable", cls: "text-muted-foreground bg-muted border-border" },
  manual_review: { label: "Manual review", cls: "text-accent bg-accent/10 border-accent/30" },
};

export function StatusPill({ status, className }: { status: VerificationStatus; className?: string }) {
  const m = VERIFICATION_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium", m.cls, className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}

export function TrustDial({ score, band, size = 132 }: { score: number; band: TrustScore["band"]; size?: number }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const color = band === "high" ? "var(--success)" : band === "medium" ? "var(--warning)" : "var(--destructive)";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={9} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ filter: "drop-shadow(0 0 6px color-mix(in oklab, currentColor 60%, transparent))" }}
      />
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fontSize={34} fontWeight={700} fill="var(--foreground)" style={{ fontFamily: "var(--font-mono)" }}>
        {score}
      </text>
      <text x={size / 2} y={size / 2 + 20} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)" style={{ fontFamily: "var(--font-mono)" }}>
        / 100 TRUST
      </text>
    </svg>
  );
}

export function SeverityBadge({ severity }: { severity: "high" | "medium" | "low" }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        severity === "high" && "bg-destructive/15 text-destructive",
        severity === "medium" && "bg-warning/15 text-warning",
        severity === "low" && "bg-primary/15 text-primary",
      )}
    >
      {severity}
    </span>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("panel p-5", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function bandColor(band: TrustScore["band"]) {
  return band === "high" ? "text-success" : band === "medium" ? "text-warning" : "text-destructive";
}
