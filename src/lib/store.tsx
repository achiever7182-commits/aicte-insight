import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AuditEntry, Application } from "@/data/types";
import { applications as initialApplications } from "@/data/synthetic";

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
  applications: Application[];
  addCollegeApplication: (newApp: Partial<Application> & { collegeName: string; city: string; state: string; program: string; intake: number }) => Application;
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
const LOCAL_APPS_KEY = "verifyai-custom-apps";

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

  const [apps, setApps] = useState<Application[]>(() => {
    if (typeof window === "undefined") return initialApplications;
    try {
      const saved = window.localStorage.getItem(LOCAL_APPS_KEY);
      if (saved) {
        const custom = JSON.parse(saved) as Application[];
        // Merge custom applications at top of the list
        return [...custom, ...initialApplications];
      }
    } catch {
      /* ignore */
    }
    return initialApplications;
  });

  const addCollegeApplication = useCallback(
    (input: Partial<Application> & { collegeName: string; city: string; state: string; program: string; intake: number }) => {
      const nextNum = Math.floor(100 + Math.random() * 900);
      const collegeId = `C${nextNum}`;
      const appId = `A${nextNum}`;
      const collegeCode = `1-${2000 + nextNum}`;

      const createdApp: Application = {
        id: appId,
        collegeId,
        collegeName: input.collegeName,
        collegeCode: input.collegeCode || collegeCode,
        city: input.city,
        state: input.state,
        category: input.category || "New EoA",
        program: input.program,
        intake: input.intake || 120,
        submittedAt: new Date().toISOString().split("T")[0],
        stage: "intake",
        docs: [
          {
            id: `D-${collegeId}-affidavit`,
            type: "affidavit",
            fileName: "compliance_affidavit_2025.pdf",
            issuer: "First Class Judicial Magistrate",
            issuedOn: new Date().toISOString().split("T")[0],
            ocrConfidence: 98,
            classification: "Compliant Legal Instrument",
            verification: "verified",
            notes: "Verified against State Judicial Notary Registry.",
            evidence: [],
            fields: [
              { label: "Institution", value: input.collegeName },
              { label: "AICTE Code", value: collegeCode },
              { label: "Jurisdiction", value: `${input.city}, ${input.state}` },
            ],
            fingerprintIds: [],
          },
          {
            id: `D-${collegeId}-noc`,
            type: "noc",
            fileName: "state_government_noc.pdf",
            issuer: `Directorate of Technical Education (${input.state})`,
            issuedOn: new Date().toISOString().split("T")[0],
            ocrConfidence: 96,
            classification: "State Clearance",
            verification: "verified",
            notes: "Valid State Technical Directorate approval.",
            evidence: [],
            fields: [
              { label: "Department", value: "Higher & Technical Education" },
              { label: "Valid Until", value: "2028-06-30" },
            ],
            fingerprintIds: [],
          },
        ],
        checklist: [
          { id: `CK-${collegeId}-1`, label: "Affidavit of Compliance (AICTE Stamp)", required: true, status: "submitted" },
          { id: `CK-${collegeId}-2`, label: "State Government NOC", required: true, status: "submitted" },
          { id: `CK-${collegeId}-3`, label: "Land Ownership & Approved Building Plan", required: true, status: "submitted" },
          { id: `CK-${collegeId}-4`, label: "Faculty Cadre-Ratio Declaration", required: true, status: "submitted" },
        ],
        trust: {
          total: 88,
          band: "high",
          factors: [
            { label: "Document authenticity", weight: 30, score: 92, note: "All primary certificates verified directly" },
            { label: "Data consistency", weight: 20, score: 90, note: "Extracted fields match intake registry" },
            { label: "Issuer / registry verification", weight: 20, score: 86, note: "State NOC verified" },
            { label: "Evidence plausibility", weight: 15, score: 85, note: "Campus documentation consistent" },
            { label: "Network signals", weight: 15, score: 87, note: "No conflicting signatory or notary linkages" },
          ],
        },
        flagSummary: [],
        ...input,
      };

      setApps((prev) => {
        const next = [createdApp, ...prev];
        try {
          const customOnly = next.filter((a) => !initialApplications.some((init) => init.id === a.id));
          window.localStorage.setItem(LOCAL_APPS_KEY, JSON.stringify(customOnly));
        } catch {
          /* ignore */
        }
        return next;
      });

      return createdApp;
    },
    [],
  );

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

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out error", e);
    }
    setUserState(DEMO_PROFILES.officer);
  }, []);

  // Sync Supabase Auth state if user logged in via live Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const assignedRole: Role = (meta.role as Role) || "officer";
        setUserState({
          role: assignedRole,
          name: meta.full_name || meta.name || session.user.email?.split("@")[0] || "Authorized User",
          email: session.user.email || "",
          badge: meta.badge || (assignedRole === "admin" ? "Central Admin" : assignedRole === "college" ? "Institutional Representative" : "Scrutiny Officer"),
          institution: meta.institution || "AICTE Verification Portal",
          isDemo: false,
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const assignedRole: Role = (meta.role as Role) || "officer";
        setUserState({
          role: assignedRole,
          name: meta.full_name || meta.name || session.user.email?.split("@")[0] || "Authorized User",
          email: session.user.email || "",
          badge: meta.badge || (assignedRole === "admin" ? "Central Admin" : assignedRole === "college" ? "Institutional Representative" : "Scrutiny Officer"),
          institution: meta.institution || "AICTE Verification Portal",
          isDemo: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
      applications: apps,
      addCollegeApplication,
      audit,
      loadingAudit,
      decisionFor,
      logDecision,
      dbAvailable,
    }),
    [user, setRole, loginAs, logout, apps, addCollegeApplication, audit, loadingAudit, decisionFor, logDecision, dbAvailable],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useAppState outside AppProvider");
  return ctx;
}
