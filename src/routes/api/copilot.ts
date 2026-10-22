// POST /api/copilot — grounded officer copilot + deficiency letter drafting.
// App-internal AI feature: consumes the gateway stream server-side and returns
// the final answer with the citations it used.

import { createFileRoute } from "@tanstack/react-router";
import { createResponsesCall } from "@/lib/ai-gateway.server";
import { getApplication, getFingerprint } from "@/data/synthetic";
import { DOC_TYPE_LABEL } from "@/data/types";
import type { ModelMessage } from "ai";

export const Route = createFileRoute("/api/copilot")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          applicationId?: string;
          mode?: "answer" | "letter";
          question?: string;
          history?: { role: "user" | "assistant"; content: string }[];
        };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }
        const { applicationId, mode = "answer", question, history = [] } = body;
        const app = applicationId ? getApplication(applicationId) : undefined;
        if (!app) return Response.json({ error: "Unknown application." }, { status: 404 });

        const dossier = buildDossier(app);
        const instructions = [
          "You are the Officer Copilot inside AICTE VerifyAI, a decision-support system for AICTE Extension of Approval (EoA) applications.",
          "You help a human AICTE officer review one application. You NEVER make final decisions and never state conclusions of wrongdoing or fraud.",
          "Every factual claim must cite the dossier with bracketed markers like [AFFIDAVIT], [NOC], [CHECKLIST], [TRUST], [NETWORK], [REALITY], [AUDIT]. Only cite markers that exist in the dossier.",
          "Use cautious language: 'potential link, needs human verification', 'discrepancy for inspection'.",
          "Be concise and structured: short paragraphs or bullet lists, no markdown tables.",
          mode === "letter"
            ? "Draft a formal deficiency letter from the AICTE regional office to the institution: subject line, numbered deficiencies each citing the evidence marker, a request for clarifications within 15 working days, and a closing note that the letter is a request for information, not a final decision. Plain text with line breaks."
            : "Answer the officer's question about this application only from the dossier. If something is not in the dossier, say so.",
        ].join("\n");

        const messages: ModelMessage[] = [
          ...history.slice(-6).map((m) => ({ role: m.role, content: m.content }) as ModelMessage),
          {
            role: "user",
            content:
              mode === "letter"
                ? "Draft the deficiency letter for this application now."
                : (question ?? "Summarise the key risks in this application."),
          },
        ];

        try {
          const result = createResponsesCall(request, messages, `${instructions}\n\n${dossier}`);
          const answer = await result.text;
          if (!answer.trim()) {
            return Response.json({ error: "The AI service returned an empty response." }, { status: 502 });
          }
          const allowed = ["AFFIDAVIT", "NOC", "CHECKLIST", "TRUST", "NETWORK", "REALITY", "AUDIT"];
          const citations = [...new Set(answer.match(/\[([A-Z_]+)\]/g) ?? [])]
            .map((m) => m.slice(1, -1))
            .filter((c) => allowed.includes(c));
          return Response.json({ answer, citations });
        } catch (error) {
          const message = error instanceof Error ? error.message : "AI request failed.";
          console.error("copilot error:", message);
          return Response.json({ error: message }, { status: 502 });
        }
      },
    },
  },
});

function buildDossier(app: NonNullable<ReturnType<typeof getApplication>>): string {
  const lines: string[] = [];
  lines.push(`APPLICATION DOSSIER — ${app.id} — ${app.collegeName} (${app.collegeCode})`);
  lines.push(`Category: ${app.category} · Programme: ${app.program} · Intake: ${app.intake} · Submitted: ${app.submittedAt} · Stage: ${app.stage}`);
  lines.push(`Location: ${app.city}, ${app.state}`);

  lines.push("\n[TRUST] Trust score breakdown (0-100, weighted):");
  for (const f of app.trust.factors) lines.push(`- ${f.label}: ${f.score}/100 (weight ${f.weight}%) — ${f.note}`);
  lines.push(`Total: ${app.trust.total} (${app.trust.band} confidence band).`);

  lines.push("\n[AUDIT] Officer audit trail:");
  lines.push("- Decisions are recorded by officers in the VerifyAI audit trail (approve / request evidence / override).");

  lines.push("\n[CHECKLIST] Category checklist:");
  for (const c of app.checklist) lines.push(`- ${c.label}: ${c.status}${c.note ? ` — ${c.note}` : ""}`);

  for (const d of app.docs) {
    const tag = d.type === "affidavit" ? "AFFIDAVIT" : d.type === "noc" ? "NOC" : d.type.toUpperCase().slice(0, 12);
    lines.push(`\n[${tag}] ${DOC_TYPE_LABEL[d.type]} (${d.fileName}) — issued ${d.issuedOn}${d.expiresOn ? `, valid until ${d.expiresOn}` : ""} by ${d.issuer}.`);
    lines.push(`Verification: ${d.verification} — ${d.verificationNote} OCR confidence ${d.ocrConfidence}%.`);
    for (const f of d.fields) lines.push(`  field ${f.label}: ${f.value}`);
    for (const ev of d.evidence) lines.push(`  FLAG (severity ${ev.severity}): ${ev.reason}`);
  }

  lines.push("\n[NETWORK] Constellation signals:");
  const shared = app.docs.flatMap((d) => d.fingerprintIds).map((fid) => getFingerprint(fid)).filter((f) => f && f.collegeIds.length > 1);
  if (shared.length === 0) lines.push("- No shared elements with other filings.");
  for (const f of shared) lines.push(`- ${f!.kind}: ${f!.label} — shared with ${f!.collegeIds.length - 1} other filing(s). Potential link, needs human verification.`);

  lines.push("\n[REALITY] Reality Twin:");
  if (app.realityCase) {
    const rc = app.realityCase;
    lines.push(`- Claimed built-up: ${rc.claimedBuiltUpSqft} sq ft vs observed ${rc.satelliteFootprintSqft} sq ft (overlap ${rc.overlapPct}%). Gap score ${rc.gapScore}/100.`);
    lines.push(`- Photo EXIF: GPS ${rc.photoExif.gps}, captured ${rc.photoExif.capturedAt}. ${rc.photoExif.plausibilityNote}`);
    const deficit = rc.rooms.filter((r) => r.claimedSqft < r.normSqft);
    lines.push(`- Rooms below norm: ${deficit.map((r) => `${r.name} ${r.claimedSqft}/${r.normSqft} sqft`).join("; ") || "none"}.`);
    lines.push(`- Assessment: ${rc.note}`);
  } else {
    lines.push("- No footprint discrepancy flagged for this institution.");
  }
  return lines.join("\n");
}
