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
import { Panel } from "@/components/bits";
import { FileText, Send } from "lucide-react";

export const Route = createFileRoute("/copilot")({
  validateSearch: (search: Record<string, unknown>) => ({ app: (search.app as string) ?? DEMO_APP_ID }),
  head: () => ({
    meta: [
      { title: "Officer Copilot — AICTE VerifyAI" },
      { name: "description", content: "Chat grounded in application data with citations, and auto-drafted deficiency letters." },
      { property: "og:title", content: "Officer Copilot — AICTE VerifyAI" },
      { property: "og:description", content: "Grounded chat and deficiency letter drafting for EoA review." },
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

  const call = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/copilot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ applicationId: app.id, ...payload }),
    });
    const data = (await res.json()) as { answer?: string; citations?: string[]; error?: string };
    if (!res.ok || data.error) throw new Error(data.error ?? "The AI service is unavailable right now.");
    return data;
  };

  const ask = async (question: string) => {
    if (!question.trim() || status !== "ready") return;
    setError(null);
    setStatus("submitted");
    const userMsg: ChatMsg = { role: "user", content: question };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, userMsg, { role: "assistant", content: "" }]);
    try {
      setStatus("streaming");
      const data = await call({ question, history });
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = { role: "assistant", content: data.answer ?? "", citations: data.citations };
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
      const data = await call({ mode: "letter", history: messages.map((m) => ({ role: m.role, content: m.content })) });
      setLetter(data.answer ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not draft the letter.");
    } finally {
      setLetterLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Officer Copilot</h1>
          <p className="text-sm text-muted-foreground">
            Grounded in the dossier of the selected application · every answer cites its evidence · decision support only.
          </p>
        </div>
        <select
          value={app.id}
          onChange={(e) => navigate({ to: "/copilot", search: { app: e.target.value } })}
          className="max-w-72 rounded-lg border border-input bg-muted/60 px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {applications.map((a) => (
            <option key={a.id} value={a.id}>
              {a.id} — {a.collegeName}
            </option>
          ))}
        </select>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel className="flex h-[600px] flex-col p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              Dossier: <span className="font-medium text-foreground">{app.id} · {app.collegeName}</span>
            </span>
            <Link to="/applications/$id" params={{ id: app.id }} className="flex items-center gap-1 hover:text-primary">
              <FileText className="size-3.5" /> open application
            </Link>
          </div>
          <Conversation className="flex-1">
            <ConversationContent>
              {messages.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Ask about this application's documents, trust score or network signals.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => ask(q)}
                        className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs hover:border-primary/50 hover:text-primary"
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
                    {m.role === "user" ? <span>{m.content}</span> : <MessageResponse content={m.content || "…"} />}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.citations.map((c) => (
                          <span key={c} className="data-num rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                            [{c}]
                          </span>
                        ))}
                      </div>
                    )}
                  </MessageContent>
                </Message>
              ))}
              {status === "streaming" && messages[messages.length - 1]?.content === "" && (
                <p className="px-4 text-xs text-muted-foreground">Reviewing dossier…</p>
              )}
              <ConversationScrollButton />
            </ConversationContent>
          </Conversation>
          {error && <p className="px-4 pb-2 text-xs text-destructive">{error}</p>}
          <div className="border-t border-border p-3">
            <PromptInput
              onSubmit={(e) => {
                e.preventDefault();
                void ask(input);
              }}
            >
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this application…"
                disabled={status !== "ready"}
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit status={status === "ready" ? "ready" : "submitted"} disabled={status !== "ready" || !input.trim()} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Auto-drafted deficiency letter">
            <p className="text-sm text-muted-foreground">
              Drafts a formal deficiency letter from the application's flags — each deficiency cites its evidence. Review and edit before issuing; this is a
              request for information, not a decision.
            </p>
            <button
              onClick={draftLetter}
              disabled={letterLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="size-4" />
              {letterLoading ? "Drafting…" : "Draft deficiency letter"}
            </button>
            {letter && (
              <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-3 text-xs leading-relaxed">
                {letter}
              </pre>
            )}
          </Panel>
          <Panel title="Guardrail">
            <p className="text-xs text-muted-foreground">
              The copilot answers only from the application dossier and refuses conclusions of fraud. AI output is decision support; final decisions rest with
              the competent AICTE authority.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
