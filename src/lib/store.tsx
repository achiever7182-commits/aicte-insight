import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AuditEntry } from "@/data/types";

export type Role = "officer" | "admin" | "college";

const ROLE_LABEL: Record<Role, string> = {
  officer: "Review Officer",
  admin: "Administrator",
  college: "College User",
};

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  roleLabel: string;
  audit: AuditEntry[];
  loadingAudit: boolean;
  decisionFor: (appId: string) => AuditEntry | undefined;
  logDecision: (input: {
    applicationId: string;
    applicationLabel: string;
    action: AuditEntry["action"];
    detail?: Record<string, unknown>;
  }) => Promise<void>;
  dbAvailable: boolean;
}

const AppCtx = createContext<AppState | null>(null);

const LOCAL_KEY = "verifyai-audit-cache";

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    if (typeof window === "undefined") return "officer";
    return (window.localStorage.getItem("verifyai-role") as Role) || "officer";
  });
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [dbAvailable, setDbAvailable] = useState(true);

  useEffect(() => {
    window.localStorage.setItem("verifyai-role", role);
  }, [role]);

  const loadAudit = useCallback(async () => {
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      setDbAvailable(false);
      const cached = window.localStorage.getItem(LOCAL_KEY);
      if (cached) {
        try {
          setAudit(JSON.parse(cached) as AuditEntry[]);
        } catch {
          /* ignore */
        }
      }
    } else {
      setDbAvailable(true);
      setAudit((data ?? []) as unknown as AuditEntry[]);
    }
    setLoadingAudit(false);
  }, []);

  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  const logDecision = useCallback<AppState["logDecision"]>(
    async ({ applicationId, applicationLabel, action, detail }) => {
      const actor = role === "officer" ? "Officer R. Iyer" : role === "admin" ? "Admin (registry)" : "College User";
      const entry = {
        actor,
        role,
        action,
        application_id: applicationId,
        application_label: applicationLabel,
        detail: detail ?? {},
      };
      const { error } = await supabase.from("audit_log").insert(entry);
      if (error) {
        setDbAvailable(false);
        const local: AuditEntry = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...entry,
        };
        const cached = JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "[]") as AuditEntry[];
        const next = [local, ...cached];
        window.localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
        setAudit(next);
      } else {
        void loadAudit();
      }
    },
    [role, loadAudit],
  );

  const decisionFor = useCallback(
    (appId: string) =>
      audit.find(
        (e) => e.application_id === appId && (e.action === "approve" || e.action === "override" || e.action === "request_evidence"),
      ),
    [audit],
  );

  const value = useMemo(
    () => ({ role, setRole: setRoleState, roleLabel: ROLE_LABEL[role], audit, loadingAudit, decisionFor, logDecision, dbAvailable }),
    [role, audit, loadingAudit, decisionFor, logDecision, dbAvailable],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useAppState outside AppProvider");
  return ctx;
}
