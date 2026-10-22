import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  FileSearch,
  Network,
  MapPinned,
  MessageSquareText,
  Gauge,
  History,
  ShieldCheck,
  Menu,
  X,
  Radio,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppProvider, useAppState } from "@/lib/store";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

import { useRouterState } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Landing Experience", icon: ShieldCheck, badge: "3D" },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: "40" },
  { to: "/constellation", label: "Fraud Constellation", icon: Network, badge: "3 Rings", alert: true },
  { to: "/reality-twin", label: "Reality Twin", icon: MapPinned, badge: "5 Gaps", warning: true },
  { to: "/copilot", label: "Officer Copilot", icon: MessageSquareText, badge: "AI" },
  { to: "/benchmark", label: "Engine Benchmark", icon: Gauge },
  { to: "/audit", label: "Audit Trail", icon: History },
];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold font-display text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Record or Route Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested inspection dossier or route is not available in the current statutory cycle.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Inspection Subsystem Interrupted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An error occurred while rendering the statutory review module.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Retry Execution
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AICTE VerifyAI — EoA Decision Support" },
      {
        name: "description",
        content:
          "AI-powered validation of Extension of Approval applications with trust scoring, fraud constellation graph, Reality Twin and officer copilot.",
      },
      { name: "author", content: "AICTE VerifyAI Engineering Team" },
      { property: "og:title", content: "AICTE VerifyAI" },
      { property: "og:description", content: "Decision-support platform for AICTE Extension of Approval validation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FF9933' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3Cpath d='m9 12 2 2 4-4'/%3E%3C/svg%3E",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen antialiased bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RoleSwitcher() {
  const { role, setRole } = useAppState();
  return (
    <div className="flex rounded-xl border border-border/80 bg-muted/60 p-1 text-xs">
      {(["officer", "admin", "college"] as const).map((r) => (
        <button
          key={r}
          onClick={() => setRole(r)}
          className={cn(
            "flex-1 rounded-lg py-1 font-medium capitalize transition-all text-center",
            role === r
              ? "bg-primary text-primary-foreground font-bold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function AppFrame({ children }: { children: ReactNode }) {
  const { roleLabel } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck className="size-4" />
          </span>
          <span className="font-display font-bold text-sm tracking-tight">AICTE VerifyAI</span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-[#100E0C]/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Banner */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-5 py-5 border-b border-border/70 group"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(255,153,51,0.25)] group-hover:scale-105 transition-transform">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <span className="block font-display text-base font-bold leading-tight text-foreground tracking-tight">
              AICTE <span className="text-primary">Insight</span>
            </span>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
              EoA Cycle 2025-26
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="mt-3 flex-1 space-y-1 px-3 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, badge, alert, warning }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              activeOptions={{ exact: to === "/" }}
              activeProps={{
                className:
                  "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all bg-primary/15 text-primary border border-primary/25 shadow-sm",
              }}
              inactiveProps={{
                className:
                  "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-colors text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              }}
            >
              <div className="flex items-center gap-3">
                <Icon className="size-4 shrink-0" />
                <span>{label}</span>
              </div>

              {badge && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                    alert
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : warning
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-muted text-muted-foreground border border-border"
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Role Switcher & System Telemetry */}
        <div className="space-y-3 border-t border-border/80 p-4 bg-[#0D0B0A]/70">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
            <span>Viewing As</span>
            <span className="text-primary font-bold">{roleLabel}</span>
          </div>
          <RoleSwitcher />

          <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Core: Online
            </span>
            <span>v2.4.8 (APH)</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64 flex min-h-screen flex-col">
        {/* Top Sticky Institutional Banner */}
        <div className="sticky top-0 z-30 border-b border-border/80 bg-background/90 px-4 sm:px-8 py-2.5 backdrop-blur-md flex items-center justify-between gap-4 text-xs">
          <p className="text-muted-foreground text-[11px] flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-primary shrink-0" />
            <span>
              <strong className="text-foreground">Official Advisory:</strong> AI output provides statutory decision
              support. Final approval rests with the competent AICTE regional committee.
            </span>
          </p>

          <div className="hidden md:flex items-center gap-4 text-[11px] font-mono text-muted-foreground">
            <span>Server: IN-DEL-01</span>
            <span>·</span>
            <span className="text-primary">APH 2025-26</span>
          </div>
        </div>

        {/* Route Page Container */}
        <main className="flex-1 px-4 sm:px-8 py-6">{children}</main>

        {/* Global Footer */}
        <footer className="border-t border-border/70 px-4 sm:px-8 py-4 text-xs font-mono text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AICTE VerifyAI Decision-Support System · All India Council for Technical Education
          </div>
          <div>
            Synthetic Demo Testbed · No Personal Data Stored
          </div>
        </footer>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });
  const isLanding = pathname === "/";

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {isLanding ? (
          <Outlet />
        ) : (
          <AppFrame>
            <Outlet />
          </AppFrame>
        )}
      </AppProvider>
    </QueryClientProvider>
  );
}
