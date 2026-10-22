import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AuditEntry } from "@/data/types";

export type Role = "officer" | "admin" | "college";

export interface UserSession {
  role: Role;
  name: string;
  email: string;
  institution?: string;
  badge?: string;
  avatarSeed?: string;
  isDemo?: boolean;
}

export const DEMO_PROFILES: Record<Role, UserSession> = {
  officer: {
    role: "officer",
    name: "Dr. R. Iyer",
    email: "r.iyer@aicte-india.org",
    badge: "Senior Verification Officer (Western Region)",
    institution: "AICTE Regional Office, Mumbai",
    avatarSeed: "iyer",
    isDemo: true,
  },
  admin: {
    role: "admin",
    name: "Dr. Sunita Deshmukh",
    email: "admin.approval@aicte-india.org",
    badge: "Chief Approval Bureau Admin",
    institution: "AICTE HQ, New Delhi",
    avatarSeed: "sunita",
    isDemo: true,
  },
  college: {
    role: "college",
    name: "Prof. Arvind Kulkarni",
    email: "principal@sanmati-tech.edu.in",
    badge: "Principal / Authorized Representative",
    institution: "Sanmati Institute of Technology & Management (C07)",
    avatarSeed: "arvind",
    isDemo: true,
  },
};

const ROLE_LABEL: Record<Role, string> = {
  officer: "Review Officer",
  admin: "Administrator",
  college: "College User",
};

interface AppState {
  role: Role;
  user: UserSession;
  setRole: (r: Role) => void;
  setUser: (u: UserSession) => void;
  loginAs: (role: Role, custom?: Partial<UserSession>) => void;
  logout: () => void;
  isAuthenticated: boolean;
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
const LOCAL_USER_KEY = "verifyai-user-session";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserSession>(() => {
    if (typeof window === "undefined") return DEMO_PROFILES.officer;
    try {
      const saved = window.localStorage.getItem(LOCAL_USER_KEY);
      if (saved) return JSON.parse(saved) as UserSession;
    } catch {
      /* ignore */
    }
    const savedRole = (window.localStorage.getItem("verifyai-role") as Role) || "officer";
    return DEMO_PROFILES[savedRole] ?? DEMO_PROFILES.officer;
  });

  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [dbAvailable, setDbAvailable] = useState(true);

  useEffect(() => {
    window.localStorage.setItem("verifyai-role", user.role);
    window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  }, [user]);

  const setRole = useCallback((newRole: Role) => {
    setUserState((prev) => {
      const profile = DEMO_PROFILES[newRole];
      return {
        ...profile,
        // preserve custom email/name if not a switch between different demo personas
        name: prev.role === newRole ? prev.name : profile.name,
        email: prev.role === newRole ? prev.email : profile.email,
      };
    });
  }, []);

  const loginAs = useCallback((targetRole: Role, custom?: Partial<UserSession>) => {
    const base = DEMO_PROFILES[targetRole];
    const finalSession: UserSession = {
      ...base,
      ...custom,
      role: targetRole,
    };
    setUserState(finalSession);
  }, []);

  const logout = useCallback(() => {
    setUserState(DEMO_PROFILES.officer);
  }, []);

  const loadAudit = useCallback(async () => {
    const { data, error } = await (supabase as any)
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
      const actor = `${user.name} (${ROLE_LABEL[user.role]})`;
      const entry = {
        actor,
        role: user.role,
        action,
        application_id: applicationId,
        application_label: applicationLabel,
        detail: detail ?? {},
      };
      const { error } = await (supabase as any).from("audit_log").insert(entry);
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
    [user, loadAudit],
  );

  const decisionFor = useCallback(
    (appId: string) =>
      audit.find(
        (e) => e.application_id === appId && (e.action === "approve" || e.action === "override" || e.action === "request_evidence"),
      ),
    [audit],
  );

  const value = useMemo(
    () => ({
      role: user.role,
      user,
      setRole,
      setUser: setUserState,
      loginAs,
      logout,
      isAuthenticated: true,
      roleLabel: ROLE_LABEL[user.role],
      audit,
      loadingAudit,
      decisionFor,
      logDecision,
      dbAvailable,
    }),
    [user, setRole, loginAs, logout, audit, loadingAudit, decisionFor, logDecision, dbAvailable],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useAppState outside AppProvider");
  return ctx;
}
