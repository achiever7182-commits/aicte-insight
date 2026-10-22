import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Network,
  MapPinned,
  MessageSquareText,
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Cpu,
  Fingerprint,
  Building2,
  Sparkles,
  Search,
  Scale,
  FileText,
  Layers,
  ChevronRight,
  History,
  Activity,
  Award,
  Zap,
} from "lucide-react";
import { applications, constellation, realityCaseList, colleges } from "@/data/synthetic";
import { TrustDial, SeverityBadge, StatusPill, bandColor } from "@/components/bits";
import { cn } from "@/lib/utils";

export function ExecutivePortal() {
  // Demo simulation state
  const demoCases = [
    {
      app: applications.find((a) => a.collegeId === "C06") ?? applications[0],
      tag: "NOTARY COLLUSION RING (RING A)",
      accent: "destructive",
      summary:
        "Sub-registrar seal FNV-1a hash matches 3 other institutions in different districts within 4-bit Hamming distance.",
    },
    {
      app: applications.find((a) => a.collegeId === "C04") ?? applications[1],
      tag: "GEOSPATIAL REALITY GAP",
      accent: "warning",
      summary:
        "Satellite polygon reveals a 24,800 sq ft deficit compared to claimed built-up area; photo EXIF shadow is sun-inconsistent.",
    },
    {
      app: applications.find((a) => a.collegeId === "C01") ?? applications[2],
      tag: "HIGH-TRUST CLEAN DOSSIER",
      accent: "success",
      summary:
        "All 8 statutory deeds verified against state land registry and university affiliation portals. Clean compliance.",
    },
  ];

  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [simulatedAction, setSimulatedAction] = useState<string | null>(null);

  const activeCase = demoCases[activeCaseIdx];
  const activeApp = activeCase.app;

  const handleSimulate = (action: string) => {
    setSimulatedAction(action);
    setTimeout(() => setSimulatedAction(null), 3000);
  };

  return (
    <section id="portal-overview" className="relative z-10 bg-[#0B0A09] text-[#F5EFE6] pt-16 pb-28 border-t border-[#26211C]">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#FF9933]/10 via-[#FF9933]/3 to-transparent pointer-events-none blur-3xl" />
      <div className="absolute top-1/3 -right-48 size-96 rounded-full bg-[#FF9933]/5 pointer-events-none blur-3xl" />
      <div className="absolute top-2/3 -left-48 size-96 rounded-full bg-[#F5C542]/5 pointer-events-none blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* SECTION 1: MONUMENTAL EXECUTIVE HERO & PURPOSE */}
        {/* ========================================================================= */}
        <div className="text-center max-w-4xl mx-auto pt-6 pb-12">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#FF9933]/35 bg-[#FF9933]/10 px-4 py-1.5 mb-6 text-xs font-mono font-medium text-[#FF9933] shadow-[0_0_15px_rgba(255,153,51,0.15)]">
            <span className="size-2 rounded-full bg-[#FF9933] animate-pulse"></span>
            ALL INDIA COUNCIL FOR TECHNICAL EDUCATION · EOA ASSURANCE
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F5EFE6] leading-[1.08]">
            Institutional Integrity.
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD79E] via-[#FF9933] to-[#E6821F]">
              Verified at Machine Speed.
            </span>
            <span className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#C8BFB2] block mt-1.5">
              Decided by Human Wisdom.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#C8BFB2] max-w-3xl mx-auto leading-relaxed">
            AICTE Insight transforms the annual Extension of Approval (EoA) into an autonomous, forensic surveillance
            architecture. Every affidavit, notary seal, faculty roll, and campus footprint is cross-examined against state
            registries, satellite observations, and multi-campus collusion graphs before a single file reaches an officer&apos;s
            desk.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#FF9933] px-6 py-3.5 text-sm font-bold text-[#0F0D0A] shadow-[0_0_24px_rgba(255,153,51,0.35)] hover:bg-[#FFB05C] hover:shadow-[0_0_32px_#FF9933] transition"
            >
              <LayoutDashboard className="size-4" />
              <span>Launch Command Dashboard</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              to="/constellation"
              className="inline-flex items-center gap-2 rounded-xl border border-[#3E3832] bg-[#161310] px-5 py-3.5 text-sm font-semibold text-[#F5EFE6] hover:border-[#FF9933]/60 hover:bg-[#1E1A16] transition"
            >
              <Network className="size-4 text-[#FF9933]" />
              <span>Explore Fraud Constellation</span>
            </Link>

            <Link
              to="/reality-twin"
              className="inline-flex items-center gap-2 rounded-xl border border-[#3E3832] bg-[#161310] px-5 py-3.5 text-sm font-semibold text-[#F5EFE6] hover:border-[#FF9933]/60 hover:bg-[#1E1A16] transition"
            >
              <MapPinned className="size-4 text-[#FF9933]" />
              <span>Inspect Reality Twin</span>
            </Link>

            <Link
              to="/copilot"
              className="inline-flex items-center gap-2 rounded-xl border border-[#3E3832] bg-[#161310] px-5 py-3.5 text-sm font-semibold text-[#F5EFE6] hover:border-[#FF9933]/60 hover:bg-[#1E1A16] transition"
            >
              <MessageSquareText className="size-4 text-[#FF9933]" />
              <span>Officer AI Copilot</span>
            </Link>
          </div>
        </div>

        {/* Live Regulatory Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-2xl border border-[#2E2822] bg-[#14110E]/80 backdrop-blur-md shadow-2xl mb-20">
          <div className="p-3 border-r border-[#26211C] last:border-0">
            <div className="font-mono text-2xl font-black text-[#F5EFE6]">{applications.length}</div>
            <div className="text-[11px] text-[#A89F91] uppercase tracking-wider font-semibold mt-0.5">Institutions Active</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-400"></span> 100% Ingested
            </div>
          </div>

          <div className="p-3 border-r border-[#26211C] last:border-0">
            <div className="font-mono text-2xl font-black text-[#F5EFE6]">320</div>
            <div className="text-[11px] text-[#A89F91] uppercase tracking-wider font-semibold mt-0.5">Statutory Deeds</div>
            <div className="text-[10px] text-[#C8BFB2] font-mono mt-1">OCR & Hash Verified</div>
          </div>

          <div className="p-3 border-r border-[#26211C] last:border-0">
            <div className="font-mono text-2xl font-black text-rose-400">{constellation.clusters.length}</div>
            <div className="text-[11px] text-[#A89F91] uppercase tracking-wider font-semibold mt-0.5">Fraud Rings Caught</div>
            <div className="text-[10px] text-rose-400/90 font-mono mt-1">Cross-Campus Collusion</div>
          </div>

          <div className="p-3 border-r border-[#26211C] last:border-0">
            <div className="font-mono text-2xl font-black text-amber-400">{realityCaseList.length}</div>
            <div className="text-[11px] text-[#A89F91] uppercase tracking-wider font-semibold mt-0.5">Reality Gaps</div>
            <div className="text-[10px] text-amber-400/90 font-mono mt-1">Satellite Area Deficit</div>
          </div>

          <div className="p-3 border-r border-[#26211C] last:border-0">
            <div className="font-mono text-2xl font-black text-[#FF9933]">98.4%</div>
            <div className="text-[11px] text-[#A89F91] uppercase tracking-wider font-semibold mt-0.5">Forensic Confidence</div>
            <div className="text-[10px] text-[#C8BFB2] font-mono mt-1">FNV-1a / SimHash SWAR</div>
          </div>

          <div className="p-3">
            <div className="font-mono text-2xl font-black text-[#F5EFE6]">14.2s</div>
            <div className="text-[11px] text-[#A89F91] uppercase tracking-wider font-semibold mt-0.5">Audit Cycle Speed</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">vs 21 Days Manual</div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: INTERACTIVE LIVE DECISION SIMULATOR (REAL DATA) */}
        {/* ========================================================================= */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF9933] uppercase tracking-wider font-bold mb-1.5">
                <Sparkles className="size-3.5" /> Interactive Forensic Station
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#F5EFE6]">
                Live Decision Adjudication Simulator
              </h2>
              <p className="mt-1 text-sm text-[#A89F91]">
                Test the engine on real synthetic cases. Observe how multi-spectral forensic signals guide officer decisions.
              </p>
            </div>

            {/* Case selector tabs */}
            <div className="flex rounded-xl border border-[#2E2822] bg-[#14110E] p-1 text-xs">
              {demoCases.map((c, idx) => (
                <button
                  key={c.app.id}
                  onClick={() => setActiveCaseIdx(idx)}
                  className={cn(
                    "rounded-lg px-3.5 py-2 font-medium transition-all text-xs",
                    activeCaseIdx === idx
                      ? "bg-[#FF9933] text-[#0F0D0A] font-bold shadow-md"
                      : "text-[#A89F91] hover:text-[#F5EFE6] hover:bg-[#1E1A16]"
                  )}
                >
                  Case 0{idx + 1}: {c.app.collegeName.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Active Case Card Showcase */}
          <div className="rounded-2xl border border-[#332C24] bg-gradient-to-br from-[#161310] to-[#12100D] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
            {/* Background subtle watermark */}
            <div className="absolute right-0 bottom-0 text-[180px] font-mono font-black text-white/[0.015] pointer-events-none select-none">
              {activeApp.collegeCode}
            </div>

            <div className="grid lg:grid-cols-[1.2fr_1.8fr] gap-8 items-center">
              {/* Left Column: Dossier info & Trust Dial */}
              <div className="space-y-6">
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-bold border",
                      activeCase.accent === "destructive" && "bg-rose-500/15 border-rose-500/30 text-rose-400",
                      activeCase.accent === "warning" && "bg-amber-500/15 border-amber-500/30 text-amber-400",
                      activeCase.accent === "success" && "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current"></span>
                    {activeCase.tag}
                  </span>

                  <h3 className="font-display text-2xl font-bold text-[#F5EFE6] mt-3">
                    {activeApp.collegeName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#A89F91] font-mono">
                    <span>ID: {activeApp.id}</span>
                    <span>·</span>
                    <span>CODE: {activeApp.collegeCode}</span>
                    <span>·</span>
                    <span>{activeApp.city}, {activeApp.state}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#2E2822] bg-[#100E0C]/90 text-sm leading-relaxed text-[#C8BFB2]">
                  {activeCase.summary}
                </div>

                {/* Trust Score Breakdown */}
                <div className="flex items-center gap-6 p-4 rounded-xl border border-[#2E2822] bg-[#120F0D]">
                  <TrustDial score={activeApp.trust.total} band={activeApp.trust.band} size={110} />
                  <div className="flex-1 space-y-1.5">
                    <div className="text-xs font-mono uppercase text-[#A89F91] font-bold tracking-wider">
                      Composite Trust Score
                    </div>
                    <div className={cn("text-base font-bold", bandColor(activeApp.trust.band))}>
                      {activeApp.trust.band.toUpperCase()} RISK TIER
                    </div>
                    <div className="text-xs text-[#A89F91]">
                      {activeApp.flagSummary.length === 0
                        ? "Zero statutory flags. Automatic approval clearance recommended."
                        : `${activeApp.flagSummary.length} forensic discrepancies requiring human officer scrutiny.`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Forensic Indicators & Interactive Actions */}
              <div className="space-y-5">
                <div className="rounded-xl border border-[#2C2721] bg-[#100E0C] p-4">
                  <div className="text-xs font-mono uppercase text-[#A89F91] font-bold tracking-wider mb-3 flex items-center justify-between">
                    <span>Statutory Inspection Matrix</span>
                    <span className="text-[#FF9933]">{activeApp.docs.length} Documents Assessed</span>
                  </div>

                  <div className="space-y-2.5">
                    {activeApp.docs.slice(0, 4).map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-[#221E19] bg-[#161310]/70 text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="font-medium text-[#F5EFE6] truncate">{d.classification}</div>
                          <div className="text-[11px] text-[#A89F91] truncate font-mono mt-0.5">
                            Issuer: {d.issuer} · OCR: {Math.round(d.ocrConfidence * 100)}%
                          </div>
                        </div>
                        <StatusPill status={d.verification} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flags alert list */}
                {activeApp.flagSummary.length > 0 && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-3.5 space-y-2 text-xs">
                    <div className="font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" /> Active Discrepancy Signals ({activeApp.flagSummary.length})
                    </div>
                    <ul className="space-y-1 list-disc list-inside text-[#D6CEBF]">
                      {activeApp.flagSummary.map((f, i) => (
                        <li key={i} className="leading-snug">{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Simulated Officer Actions */}
                <div className="pt-2">
                  <div className="text-xs font-mono uppercase text-[#A89F91] font-bold tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Officer Adjudication Sandbox</span>
                    {simulatedAction && (
                      <span className="text-[#FF9933] animate-pulse">
                        Logged: &quot;{simulatedAction}&quot; in audit trail
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => handleSimulate("Statutory Approval Granted")}
                      className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="size-3.5" /> Approve EoA
                    </button>

                    <button
                      onClick={() => handleSimulate("Deficiency Notice Issued")}
                      className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1.5"
                    >
                      <AlertTriangle className="size-3.5" /> Request Evidence
                    </button>

                    <button
                      onClick={() => handleSimulate("Referred to Vigilance")}
                      className="px-4 py-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30 transition flex items-center gap-1.5"
                    >
                      <Scale className="size-3.5" /> Refer to Vigilance
                    </button>

                    <Link
                      to="/applications/$id"
                      params={{ id: activeApp.id }}
                      className="px-3.5 py-2 rounded-lg border border-[#3E3832] bg-[#1C1814] text-xs font-medium text-[#F5EFE6] hover:text-[#FF9933] hover:border-[#FF9933]/50 transition flex items-center gap-1.5 ml-auto"
                    >
                      <span>Full Case Dossier</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: THE TRI-FORENSIC INTELLIGENCE PILLARS */}
        {/* ========================================================================= */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF9933] uppercase tracking-wider font-bold mb-2">
              <Layers className="size-3.5" /> Multi-Layered Assurance
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#F5EFE6]">
              The Three Core Forensic Engines
            </h2>
            <p className="mt-2 text-sm text-[#A89F91] leading-relaxed">
              Designed specifically to dismantle systemic institutional fraud patterns that bypass traditional physical inspection.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Pillar 1: Cryptographic SimHash & Notary Cartel */}
            <div className="rounded-2xl border border-[#2E2822] bg-[#14110E] p-6 flex flex-col justify-between hover:border-[#FF9933]/40 transition group">
              <div>
                <div className="size-12 rounded-xl bg-[#FF9933]/15 text-[#FF9933] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Fingerprint className="size-6" />
                </div>
                <div className="font-mono text-xs uppercase tracking-wider text-[#FF9933] font-bold">PILLAR 01</div>
                <h3 className="font-display text-xl font-bold text-[#F5EFE6] mt-1 mb-3">
                  Perceptual Hash &amp; Seal Forensics
                </h3>
                <p className="text-xs sm:text-sm text-[#A89F91] leading-relaxed">
                  Generates deterministic 64-bit FNV-1a SimHash fingerprints for every official rubber stamp, sub-registrar seal,
                  and notary watermark. Calculates SWAR popcount Hamming distances to flag duplicate or recycled legal instruments
                  across independent college filings.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#221E19] flex items-center justify-between text-xs font-mono text-[#FF9933]">
                <span>Popcount Distance &le; 4 bits</span>
                <span className="text-[#A89F91]">64-Bit SWAR</span>
              </div>
            </div>

            {/* Pillar 2: Fraud Constellation Graph Core */}
            <div className="rounded-2xl border border-[#2E2822] bg-[#14110E] p-6 flex flex-col justify-between hover:border-[#FF9933]/40 transition group">
              <div>
                <div className="size-12 rounded-xl bg-[#FF9933]/15 text-[#FF9933] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Network className="size-6" />
                </div>
                <div className="font-mono text-xs uppercase tracking-wider text-[#FF9933] font-bold">PILLAR 02</div>
                <h3 className="font-display text-xl font-bold text-[#F5EFE6] mt-1 mb-3">
                  Fraud Constellation Graph Core
                </h3>
                <p className="text-xs sm:text-sm text-[#A89F91] leading-relaxed">
                  Builds a multi-modal knowledge graph connecting institutions via shared signatories, duplicate faculty ghost rolls,
                  co-working registered addresses, and identical notary serials. Runs community detection algorithms to unmask
                  clandestine shell syndicates.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#221E19] flex items-center justify-between text-xs font-mono text-[#FF9933]">
                <span>D3 / C++ Graph Algorithm</span>
                <Link to="/constellation" className="hover:underline flex items-center gap-1">
                  View Graph <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Reality Twin Geospatial Audit */}
            <div className="rounded-2xl border border-[#2E2822] bg-[#14110E] p-6 flex flex-col justify-between hover:border-[#FF9933]/40 transition group">
              <div>
                <div className="size-12 rounded-xl bg-[#FF9933]/15 text-[#FF9933] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <MapPinned className="size-6" />
                </div>
                <div className="font-mono text-xs uppercase tracking-wider text-[#FF9933] font-bold">PILLAR 03</div>
                <h3 className="font-display text-xl font-bold text-[#F5EFE6] mt-1 mb-3">
                  Reality Twin Geospatial &amp; Solar Audit
                </h3>
                <p className="text-xs sm:text-sm text-[#A89F91] leading-relaxed">
                  Cross-references claimed architectural blueprints against sub-pixel satellite building footprints. Audits submitted site
                  inspection photographs using camera sensor EXIF metadata and solar azimuth trigonometry to detect forged campus photos
                  and impossible shadow angles.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#221E19] flex items-center justify-between text-xs font-mono text-[#FF9933]">
                <span>Satellite Overlap &lt; 70%</span>
                <Link to="/reality-twin" className="hover:underline flex items-center gap-1">
                  Audit Twin <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: 7-STAGE EXTENSION OF APPROVAL (EOA) VERIFICATION PIPELINE */}
        {/* ========================================================================= */}
        <div className="mb-24 rounded-2xl border border-[#2E2822] bg-[#120F0D] p-6 sm:p-10">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF9933] uppercase tracking-wider font-bold mb-2">
              <Zap className="size-3.5" /> End-to-End Workflow
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F5EFE6]">
              The 7-Stage Autonomous EoA Journey
            </h2>
            <p className="mt-2 text-sm text-[#A89F91]">
              Every application flows through an orchestrated assembly line from raw submission to human adjudication.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Digital Intake & Hash Ingestion",
                desc: "Uploaded deeds, affidavits, and NOCs receive cryptographic SHA-256 stamps and immutable timestamps.",
              },
              {
                step: "02",
                title: "Multi-Spectral OCR & Classification",
                desc: "Layout-aware AI models extract structured tables, names, land coordinates, and statutory resolutions.",
              },
              {
                step: "03",
                title: "Rule Engine & Norms Validation",
                desc: "Automated verification against AICTE Approval Process Handbook (APH 2025-26) ratios, FSI, and faculty quotas.",
              },
              {
                step: "04",
                title: "Authority Issuer & Seal Check",
                desc: "SimHash perceptual matching of notary stamps, digital signatures, and direct registry API validation.",
              },
              {
                step: "05",
                title: "Cross-Campus Graph Collision",
                desc: "Constellation engine queries 100,000+ national fingerprints to isolate multi-institution syndicates.",
              },
              {
                step: "06",
                title: "Reality Twin Geospatial Audit",
                desc: "Automated satellite footprint overlap verification and photo EXIF solar shadow angle calculation.",
              },
              {
                step: "07",
                title: "Human Officer Decision Dossier",
                desc: "AI produces an explainable, cited decision-support briefing. Officer retains full statutory authority.",
              },
              {
                step: "08",
                title: "Immutable Statutory Audit Log",
                desc: "Every approval, override, or deficiency notice is cryptographically logged for vigilance oversight.",
              },
            ].map((p) => (
              <div key={p.step} className="rounded-xl border border-[#26211C] bg-[#171410] p-4 relative group hover:border-[#FF9933]/50 transition">
                <div className="font-mono text-xs font-bold text-[#FF9933] mb-1.5 flex items-center justify-between">
                  <span>STAGE {p.step}</span>
                  <span className="size-1.5 rounded-full bg-[#FF9933]/60 group-hover:bg-[#FF9933] transition-colors" />
                </div>
                <h4 className="font-display text-sm font-bold text-[#F5EFE6] mb-1.5">{p.title}</h4>
                <p className="text-xs text-[#A89F91] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: NATIONAL REGULATORY COVERAGE & METRICS */}
        {/* ========================================================================= */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF9933] uppercase tracking-wider font-bold mb-1.5">
                <Building2 className="size-3.5" /> Pan-India Jurisdictional Coverage
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F5EFE6]">
                Institutional Network Analytics
              </h2>
              <p className="mt-1 text-sm text-[#A89F91]">
                Real-time regional telemetry from the 40 active synthetic test-bed institutions across 12 states.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="text-xs font-mono text-[#FF9933] hover:underline flex items-center gap-1"
            >
              Open Full Applications Registry ({applications.length}) &rarr;
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { region: "Western Region", hubs: "Pune, Nagpur, Nashik", count: 12, trust: 78, alert: "Ring A Active" },
              { region: "Central Region", hubs: "Bhopal, Indore", count: 8, trust: 84, alert: "Reality Gap Detected" },
              { region: "Northern Region", hubs: "Lucknow, Jaipur", count: 9, trust: 81, alert: "1 Pending Review" },
              { region: "Southern Region", hubs: "Hyderabad, Bengaluru, Coimbatore", count: 11, trust: 92, alert: "Clean Record" },
            ].map((reg) => (
              <div key={reg.region} className="rounded-xl border border-[#2C2721] bg-[#14110E] p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-base font-bold text-[#F5EFE6]">{reg.region}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#FF9933]/15 text-[#FF9933] font-bold">
                    {reg.count} Inst.
                  </span>
                </div>
                <div className="text-xs text-[#A89F91] mb-4">{reg.hubs}</div>
                <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-[#221E19]">
                  <span className="text-[#A89F91]">Mean Trust Score</span>
                  <span className="font-bold text-[#F5EFE6]">{reg.trust} / 100</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono pt-1.5">
                  <span className="text-[#A89F91]">Vigilance Status</span>
                  <span className="text-amber-400 font-semibold">{reg.alert}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 6: STATUTORY COMPLIANCE & HUMAN-IN-THE-LOOP GOVERNANCE */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-[#3E3832] bg-gradient-to-b from-[#181512] via-[#12100E] to-[#0D0B0A] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono text-emerald-300 font-bold">
              <ShieldCheck className="size-4" /> STATUTORY GOVERNANCE GUARANTEE
            </div>

            <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-[#F5EFE6] tracking-tight">
              &quot;AI Provides Decision Support. Human Officers Retain Final Authority.&quot;
            </h3>

            <p className="text-sm sm:text-base text-[#C8BFB2] leading-relaxed">
              In accordance with AICTE Approval Process Handbook (APH 2025-26) and national AI governance standards,
              AICTE Insight never automatically rejects or revokes approval. Every finding is surfaced as an explainable,
              evidentiary dossier with tamper-proof audit trails for administrative review.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF9933] px-7 py-3.5 text-sm font-bold text-[#0F0D0A] shadow-[0_0_24px_rgba(255,153,51,0.4)] hover:bg-[#FFB05C] transition"
              >
                <span>Enter Regulatory Dashboard</span>
                <ChevronRight className="size-4" />
              </Link>

              <Link
                to="/copilot"
                className="inline-flex items-center gap-2 rounded-xl border border-[#3E3832] bg-[#1C1814] px-6 py-3.5 text-sm font-semibold text-[#F5EFE6] hover:text-[#FF9933] hover:border-[#FF9933]/50 transition"
              >
                <MessageSquareText className="size-4 text-[#FF9933]" />
                <span>Consult Officer Copilot</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-20 pt-8 border-t border-[#221E19] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8C8274]">
          <div>
            AICTE VerifyAI · Intelligent Extension of Approval Validation Engine · Cycle 2025-26
          </div>
          <div>
            Synthetic Demo Data · No Actual Institutional Records Stored
          </div>
        </footer>
      </div>
    </section>
  );
}
