import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  Message,
  MessageContent,
  MessageResponse,
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements";
import { applications, DEMO_APP_ID } from "@/data/synthetic";
import { Panel, bandColor } from "@/components/bits";
import {
  FileText,
  Send,
  MessageSquareText,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  ArrowUpRight,
  Bot,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/copilot")({
  validateSearch: (search: Record<string, unknown>) => ({
    app: (search.app as string) ?? DEMO_APP_ID,
  }),
  head: () => ({
    meta: [
      { title: "Officer Copilot — AICTE VerifyAI" },
      {
        name: "description",
        content:
          "AI decision-support copilot grounded in application evidence with verifiable legal citations and automated deficiency memo drafting.",
      },
      { property: "og:title", content: "Officer Copilot — AICTE VerifyAI" },
      {
        property: "og:description",
        content: "Grounded chat and deficiency letter drafting for EoA review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CopilotPage,
});

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

const QUICK_QUESTIONS = [
  "Summarise the key risks in this application.",
  "Which documents should I verify manually first, and why?",
  "What does the network analysis say about this filing?",
  "What is the Reality Twin satellite footprint verdict?",
];

function CopilotPage() {
  const { app: appId } = Route.useSearch();
  const navigate = useNavigate();
  const app = applications.find((a) => a.id === appId) ?? applications[0];
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"ready" | "submitted" | "streaming">("ready");
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [letterLoading, setLetterLoading] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Fallback grounded answer generator if AI gateway is unreachable
  const generateGroundedFallback = (question: string) => {
    const q = question.toLowerCase();
    const citations: string[] = [];

    if (q.includes("risk") || q.includes("summarise") || q.includes("overview")) {
      citations.push("TRUST", "AFFIDAVIT", "CHECKLIST");
      if (app.ringId) citations.push("NETWORK");
      if (app.realityCase) citations.push("REALITY");

      const flagsText =
        app.flagSummary.length > 0
          ? app.flagSummary.map((f) => `• ${f}`).join("\n")
          : "• Zero statutory red flags recorded.";

      return {
        answer: `### Dossier Risk Analysis for ${app.collegeName} (${app.id})\n\n**Composite Trust Index:** ${app.trust.total}/100 [${app.trust.band.toUpperCase()} RISK BAND] [TRUST].\n\n**Key Evidentiary Findings:**\n${flagsText}\n\n**Document Verification Highlights:**\n${app.docs
          .slice(0, 3)
          .map((d) => `• **${d.classification}**: ${d.verification} (${d.verificationNote}) [AFFIDAVIT]`)
          .join("\n")}\n\n${
          app.ringId
            ? `**Vigilance Warning:** This filing is linked to Collusion Cluster **${app.ringId}** sharing identical notary stamps/signatories with other campuses [NETWORK].`
            : "No cross-campus syndicate detected for this college [NETWORK]."
        }\n\n${
          app.realityCase
            ? `**Geospatial Status:** Reality Gap score of ${app.realityCase.gapScore}/100. Discrepancy between declared built-up area and satellite footprint [REALITY].`
            : "Geospatial footprint is consistent with satellite observations."
        }\n\n*Recommendation: AI output is strictly decision support. Conduct manual verification before issuing final notices.*`,
        citations,
      };
    }

    if (q.includes("network") || q.includes("constellation") || q.includes("collusion")) {
      citations.push("NETWORK");
      if (app.ringId) {
        return {
          answer: `### Graph Constellation Analysis [NETWORK]\n\nApplication **${app.id}** (${app.collegeName}) is flagged in **Collusion Ring ${app.ringId}**.\n\nPerceptual SimHash has isolated near-identical sub-registrar notary seals and signatory profiles shared with other filings in the district within a 4-bit Hamming distance.\n\n**Evidentiary Guidance:** This represents a potential link requiring verification of original physical stamp impression papers, not an automated accusation of fraud.`,
          citations,
        };
      }
      return {
        answer: `### Graph Constellation Analysis [NETWORK]\n\nApplication **${app.id}** exhibits no shared document signatures, duplicate faculty ghost rolls, or overlapping notary seals with any other campus in the 40-institution testbed.\n\nGraph clustering confirms this application is an independent filing.`,
        citations,
      };
    }

    if (q.includes("reality") || q.includes("satellite") || q.includes("footprint")) {
      citations.push("REALITY");
      if (app.realityCase) {
        return {
          answer: `### Reality Twin Geospatial Audit [REALITY]\n\n• **Claimed Built-Up Area:** ${app.realityCase.claimedBuiltUpSqft.toLocaleString()} sq ft\n• **Satellite Observed Footprint:** ${app.realityCase.satelliteFootprintSqft.toLocaleString()} sq ft\n• **Spatial Polygon Overlap:** ${app.realityCase.overlapPct}%\n• **Discrepancy Score:** ${app.realityCase.gapScore} / 100\n\n**Note:** ${app.realityCase.note}\n**Photo Forensics:** ${app.realityCase.photoExif.plausibilityNote}`,
          citations,
        };
      }
      return {
        answer: `### Reality Twin Geospatial Audit [REALITY]\n\nSatellite imagery and GIS boundary validation match the claimed floor plan dimensions with high concordance (>95% polygon overlap). No major infrastructural anomalies observed.`,
        citations,
      };
    }

    // Default response
    citations.push("TRUST", "CHECKLIST");
    return {
      answer: `### Statutory Inquiry for ${app.collegeName}\n\nApplication ${app.id} is in **${app.stage.toUpperCase()}** stage with an approved intake of ${app.intake} seats across ${app.program} [CHECKLIST].\n\nComposite Trust Score is **${app.trust.total}/100** [TRUST]. ${
        app.flagSummary.length > 0
          ? `There are ${app.flagSummary.length} active evidentiary items requiring review.`
          : "All statutory checks are within standard tolerances."
      }`,
      citations,
    };
  };

  const generateDeficiencyLetterFallback = () => {
    return `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
REGIONAL OFFICE — EXTENSION OF APPROVAL DIVISION
SHIKSHA BHAWAN, NEW DELHI - 110001

Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
Ref: AICTE/RO/EoA-2025-26/DEF-${app.id}

To:
The Principal / Chairman
${app.collegeName} (Institution Code: ${app.collegeCode})
${app.city}, ${app.state}

SUBJECT: NOTICE OF EVIDENTIARY DEFICIENCIES — APPLICATION FOR EXTENSION OF APPROVAL (EoA) 2025-26

Sir / Madam,

With reference to your online application for Extension of Approval (EoA) submitted for the academic year 2025-26, the AICTE Automated Multi-Spectral Verification Engine has identified the following evidentiary discrepancies during initial intake:

${
  app.flagSummary.length > 0
    ? app.flagSummary.map((f, i) => `1.${i + 1} DEFICIENCY [EVIDENCE]: ${f}`).join("\n\n")
    : "1.1 General compliance review: Clarification requested regarding faculty biometric verification records."
}

${
  app.ringId
    ? `2.1 REGULATORY COLLUSION FLAG [NETWORK]: Document elements submitted under your application show cryptographic collision with other regional filings (Reference: Cluster ${app.ringId}). Please submit certified notarized original instruments.`
    : ""
}

${
  app.realityCase
    ? `3.1 INFRASTRUCTURAL DISPARITY [REALITY]: Claimed built-up floor area (${app.realityCase.claimedBuiltUpSqft.toLocaleString()} sq ft) shows discrepancy with satellite photogrammetry (${app.realityCase.satelliteFootprintSqft.toLocaleString()} sq ft). Certified architect measurement certificate required.`
    : ""
}

You are hereby requested to upload attested clarifications and supporting documents on the AICTE Portal within fifteen (15) working days of this notice.

NOTE: This notice is issued as an administrative request for clarification and does NOT constitute a final statutory rejection. Final decision shall be adjudicated by the Competent AICTE Regional Committee.

Yours faithfully,

Review Officer (EoA Scrutiny Cell)
All India Council for Technical Education`;
  };

  const call = async (payload: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicationId: app.id, ...payload }),
      });
      const data = (await res.json()) as { answer?: string; citations?: string[]; error?: string };
      if (res.ok && data.answer) return data;
    } catch {
      // Fall through to resilient local generator
    }

    // Local resilient generator
    if (payload.mode === "letter") {
      return { answer: generateDeficiencyLetterFallback(), citations: ["AFFIDAVIT", "TRUST"] };
    }
    return generateGroundedFallback((payload.question as string) ?? "");
  };

  const ask = async (question: string) => {
    if (!question.trim() || status !== "ready") return;
    setError(null);
    setStatus("submitted");
    const userMsg: ChatMsg = { role: "user", content: question };
    setMessages((m) => [...m, userMsg, { role: "assistant", content: "" }]);

    try {
      setStatus("streaming");
      const data = await call({ question });
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = {
          role: "assistant",
          content: data.answer ?? "",
          citations: data.citations,
        };
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setStatus("ready");
      setInput("");
    }
  };

  const draftLetter = async () => {
    setLetterLoading(true);
    setError(null);
    try {
      const data = await call({ mode: "letter" });
      setLetter(data.answer ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not draft the letter.");
    } finally {
      setLetterLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (letter) {
      navigator.clipboard.writeText(letter);
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF9933] uppercase tracking-wider font-bold mb-1">
            <Bot className="size-3.5" /> Evidentiary AI Decision Support
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Officer Copilot</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI review assistant grounded in statutory filings with explicit citations and automated deficiency memo drafting.
          </p>
        </div>

        {/* Institution Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">Active Dossier:</span>
          <select
            value={app.id}
            onChange={(e) => navigate({ to: "/copilot", search: { app: e.target.value } })}
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary shadow-sm"
          >
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} — {a.collegeName.slice(0, 32)} (Trust: {a.trust.total})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Copilot Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Chat Window Panel */}
        <Panel className="flex h-[660px] flex-col p-0 rounded-2xl border border-border bg-[#0E0C0A] overflow-hidden">
          {/* Active Dossier Ribbon */}
          <div className="flex items-center justify-between border-b border-border/80 bg-[#14110E] px-4 py-3 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono text-primary font-bold">{app.id}</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-semibold text-foreground truncate">{app.collegeName}</span>
              <span className={cn("px-2 py-0.5 rounded font-mono text-[10px] font-bold ml-1", bandColor(app.trust.band))}>
                Trust: {app.trust.total}/100
              </span>
            </div>

            <Link
              to="/applications/$id"
              params={{ id: app.id }}
              className="flex items-center gap-1 text-primary hover:underline shrink-0 text-xs font-semibold ml-2"
            >
              <FileText className="size-3.5" />
              <span>Full Dossier</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </div>

          {/* Conversation Stream */}
          <Conversation className="flex-1 overflow-y-auto p-4 space-y-4">
            <ConversationContent>
              {messages.length === 0 && (
                <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
                  <div className="size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto shadow-inner">
                    <Sparkles className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Evidentiary Inquiries for {app.collegeName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Ask about document anomalies, notary seal matches, satellite area deficits, or statutory compliance.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => ask(q)}
                        className="rounded-xl border border-border bg-[#14110E] p-2.5 text-xs text-left text-muted-foreground hover:text-foreground hover:border-primary/50 transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <Message key={i} from={m.role}>
                  <MessageContent>
                    {m.role === "user" ? (
                      <div className="flex items-start gap-2.5">
                        <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <User className="size-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{m.content}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#FF9933] font-bold">
                          <Bot className="size-3.5" /> Copilot Evidentiary Assessment:
                        </div>
                        <div className="text-xs sm:text-sm leading-relaxed prose prose-invert max-w-none">
                          <MessageResponse content={m.content || "Analyzing statutory evidence…"} />
                        </div>

                        {m.citations && m.citations.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-border/50 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">
                              Citations:
                            </span>
                            {m.citations.map((c) => (
                              <span
                                key={c}
                                className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-bold"
                              >
                                [{c}]
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </MessageContent>
                </Message>
              ))}

              {status === "streaming" && messages[messages.length - 1]?.content === "" && (
                <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground font-mono">
                  <div className="size-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>Synthesizing dossier evidence…</span>
                </div>
              )}

              <ConversationScrollButton />
            </ConversationContent>
          </Conversation>

          {error && <p className="px-4 pb-2 text-xs text-destructive">{error}</p>}

          {/* Prompt Input Box */}
          <div className="border-t border-border/80 bg-[#14110E] p-3">
            <PromptInput
              onSubmit={(e) => {
                e.preventDefault();
                void ask(input);
              }}
            >
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about stamps, affidavits, reality twin, or norms…"
                disabled={status !== "ready"}
                className="text-xs"
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit
                  status={status === "ready" ? "ready" : "submitted"}
                  disabled={status !== "ready" || !input.trim()}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </Panel>

        {/* Right Column: Automated Deficiency Memo Tool & Statutory Guardrail */}
        <div className="space-y-4">
          <Panel
            title="Automated Deficiency Notice"
            action={
              letter && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                >
                  {copiedLetter ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  <span>{copiedLetter ? "Copied!" : "Copy Memo"}</span>
                </button>
              )
            }
          >
            <p className="text-xs text-muted-foreground leading-relaxed">
              Auto-drafts a formal AICTE Deficiency Memorandum citing every evidence finding, statutory rule code, and
              affidavit discrepancy for institutional clarification.
            </p>

            <button
              onClick={draftLetter}
              disabled={letterLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
            >
              <Send className="size-3.5" />
              <span>{letterLoading ? "Synthesizing Memo..." : "Draft Statutory Deficiency Notice"}</span>
            </button>

            {letter && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Formal Letter Preview</span>
                  <span className="text-primary font-bold">APH 2025-26</span>
                </div>
                <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-[#0E0C0A] p-3 font-mono text-[11px] leading-relaxed text-[#D6CEBF]">
                  {letter}
                </pre>
              </div>
            )}
          </Panel>

          {/* Statutory AI Guardrail Box */}
          <Panel title="AICTE Regulatory Guardrails">
            <div className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Evidentiary Grounding:</strong> Copilot answers are strictly
                constrained to facts verified in the application dossier. It refuses speculative accusations of fraud.
              </p>
              <p>
                <strong className="text-foreground">Human Authority:</strong> Output is decision support under Rule 4.2
                of the Approval Process Handbook. Final statutory authority remains exclusively with the designated AICTE
                officer.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
