import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, UserCheck, Building2, ShieldAlert, ArrowRight, CheckCircle2, Lock, Sparkles, KeyRound } from "lucide-react";
import { useAppState, type Role, DEMO_PROFILES } from "@/lib/store";
import { cn } from "@/lib/utils";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: Role;
}

export function LoginModal({ isOpen, onClose, defaultRole = "officer" }: LoginModalProps) {
  const navigate = useNavigate();
  const { loginAs, user } = useAppState();
  const [activeTab, setActiveTab] = useState<Role>(defaultRole);

  // Form states for manual credential entry
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentDemo = DEMO_PROFILES[activeTab];

  const handleRoleSelect = (role: Role) => {
    setActiveTab(role);
    setEmail(DEMO_PROFILES[role].email);
    setPassword("••••••••••••");
  };

  const handleDemoQuickLogin = (role: Role) => {
    loginAs(role);
    onClose();
    navigate({ to: "/dashboard" });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      loginAs(activeTab, {
        email: email || currentDemo.email,
        isDemo: false,
      });
      setIsSubmitting(false);
      onClose();
      navigate({ to: "/dashboard" });
    }, 450);
  };

  const ROLE_CONFIG: Record<
    Role,
    {
      title: string;
      subtitle: string;
      icon: typeof UserCheck;
      accentBg: string;
      accentBorder: string;
      accentText: string;
      portalLabel: string;
      dossierAccess: string;
    }
  > = {
    officer: {
      title: "Review Officer Portal",
      subtitle: "AICTE Bureau of Approval & Scrutiny",
      icon: ShieldCheck,
      accentBg: "bg-[#FF9933]/15",
      accentBorder: "border-[#FF9933]/40",
      accentText: "text-[#FF9933]",
      portalLabel: "Officer Verification Gateway",
      dossierAccess: "Full access to 40 institution dossiers, deficiency drafting, and trust overrides.",
    },
    admin: {
      title: "HQ Administrator Portal",
      subtitle: "Apex System Governance & Oversight",
      icon: ShieldAlert,
      accentBg: "bg-amber-500/15",
      accentBorder: "border-amber-500/40",
      accentText: "text-amber-400",
      portalLabel: "AICTE Central Administration",
      dossierAccess: "Global registry oversight, cross-state fraud cluster analytics, and policy audit logs.",
    },
    college: {
      title: "Institutional / College Portal",
      subtitle: "AICTE Affiliated Institutions (EoA Intake)",
      icon: Building2,
      accentBg: "bg-emerald-500/15",
      accentBorder: "border-emerald-500/40",
      accentText: "text-emerald-400",
      portalLabel: "College Representative Self-Service",
      dossierAccess: "Direct view of institution's own EoA application, uploaded affidavits, and deficiency replies.",
    },
  };

  const config = ROLE_CONFIG[activeTab];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#3E3832] bg-[#141210] p-6 md:p-8 text-[#F5EFE6] shadow-2xl shadow-black/90 z-10 overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-20 -right-20 size-48 rounded-full bg-[#FF9933]/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#2C2723]">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#FF9933]/15 text-[#FF9933] border border-[#FF9933]/30">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold tracking-tight text-[#F5EFE6]">
                  AICTE VerifyAI Access Gateway
                </h2>
                <span className="rounded-full bg-[#FF9933]/20 border border-[#FF9933]/40 px-2 py-0.5 text-[10px] font-mono text-[#FF9933]">
                  SSO v2.4
                </span>
              </div>
              <p className="text-xs text-[#A89F91]">
                Select your designated role or launch instant 1-click Demo Persona
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#A89F91] hover:bg-[#231F1C] hover:text-[#F5EFE6] transition"
          >
            ✕
          </button>
        </div>

        {/* 3 Role Selection Tabs */}
        <div className="mt-5 grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#1D1A16] border border-[#2E2822]">
          {(["officer", "admin", "college"] as const).map((r) => {
            const item = ROLE_CONFIG[r];
            const ItemIcon = item.icon;
            const isSelected = activeTab === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleSelect(r)}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-xs font-semibold transition-all",
                  isSelected
                    ? "bg-[#29241F] text-[#F5EFE6] shadow-md border border-[#4A4036]"
                    : "text-[#A89F91] hover:text-[#D6CEBF] hover:bg-[#231F1C]"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <ItemIcon className={cn("size-4", isSelected ? item.accentText : "text-[#A89F91]")} />
                  <span className="capitalize">{r}</span>
                </div>
                <span className="text-[10px] font-normal opacity-70 truncate max-w-full">
                  {r === "officer" ? "Verification" : r === "admin" ? "Apex Oversight" : "Institution"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Role Banner */}
        <div className={cn("mt-4 rounded-xl border p-3.5 flex items-start gap-3", config.accentBg, config.accentBorder)}>
          <Icon className={cn("size-5 mt-0.5 shrink-0", config.accentText)} />
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F5EFE6]">{config.title}</span>
              <span className="text-[10px] text-[#A89F91]">({config.subtitle})</span>
            </div>
            <p className="text-[#D6CEBF] leading-relaxed">{config.dossierAccess}</p>
          </div>
        </div>

        {/* Instant Demo Option Card (Prominent Callout) */}
        <div className="mt-4 rounded-xl border border-[#FF9933]/40 bg-[#FF9933]/10 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#FF9933] text-black">
              <Sparkles className="size-5" />
            </span>
            <div>
              <div className="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
                <span>Demo Profile:</span>
                <span className="text-[#FF9933] underline decoration-[#FF9933]/50">
                  {currentDemo.name}
                </span>
              </div>
              <p className="text-[11px] text-[#D6CEBF]">
                {currentDemo.badge} · {currentDemo.institution}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDemoQuickLogin(activeTab)}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF9933] px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-[#FF9933]/90 hover:shadow-[0_0_16px_rgba(255,153,51,0.4)] transition"
          >
            <span>Instant Demo Login</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* Separator */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2C2723]" />
          </div>
          <div className="relative bg-[#141210] px-3 text-[11px] font-mono text-[#A89F91] uppercase tracking-wider">
            Or Sign In With Credentials
          </div>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#D6CEBF] mb-1">
              Official Email / AICTE ID
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email || currentDemo.email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={currentDemo.email}
                className="w-full rounded-lg border border-[#3E3832] bg-[#1B1815] px-3.5 py-2 text-xs text-[#F5EFE6] outline-none placeholder:text-[#6F675D] focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#D6CEBF]">
                Secure Password / Token
              </label>
              <span className="text-[10px] text-[#FF9933]/90 hover:underline cursor-pointer">
                Forgot token?
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password || "aicte2026demo"}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-[#3E3832] bg-[#1B1815] px-3.5 py-2 text-xs text-[#F5EFE6] outline-none placeholder:text-[#6F675D] focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#A89F91] pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#3E3832] text-[#FF9933] focus:ring-[#FF9933] bg-[#1B1815]"
              />
              <span>Remember station session</span>
            </label>
            <span className="flex items-center gap-1 font-mono text-[10px] text-[#A89F91]">
              <Lock className="size-3 text-[#FF9933]" /> 256-bit TLS Encrypted
            </span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[#FF9933] bg-[#FF9933] px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-[#FF9933]/90 transition disabled:opacity-50"
            >
              {isSubmitting ? "Authenticating..." : `Sign in as ${ROLE_LABEL_LOCAL[activeTab]}`}
              <KeyRound className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#3E3832] bg-[#1F1B18] px-4 py-2.5 text-xs font-medium text-[#D6CEBF] hover:bg-[#2A2420] transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ROLE_LABEL_LOCAL: Record<Role, string> = {
  officer: "Review Officer",
  admin: "Administrator",
  college: "College User",
};
