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
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppProvider, useAppState, type Role } from "@/lib/store";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

import { useRouterState } from "@tanstack/react-router";
import { ElevenLabsVoiceWidget } from "@/components/ElevenLabsVoiceWidget";
import { LoginModal } from "@/components/LoginModal";

const NAV = [
  { to: "/", label: "Landing Experience", icon: ShieldCheck },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/constellation", label: "Fraud Constellation", icon: Network },
  { to: "/reality-twin", label: "Reality Twin", icon: MapPinned },
  { to: "/copilot", label: "Officer Copilot", icon: MessageSquareText },
  { to: "/benchmark", label: "Engine Benchmark", icon: Gauge },
  { to: "/audit", label: "Audit Trail", icon: History },
];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
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
      { name: "description", content: "AI-powered validation of Extension of Approval applications with trust scoring, fraud constellation graph, Reality Twin and officer copilot." },
      { name: "author", content: "VerifyAI Team" },
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
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
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
      <body className="min-h-screen antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RoleSwitcher() {
  const { role, setRole } = useAppState();
  return (
    <div className="flex rounded-lg border border-border bg-muted/60 p-0.5 text-xs">
      {(["officer", "admin", "college"] as const).map((r) => (
        <button
          key={r}
          onClick={() => setRole(r)}
          className={cn(
            "rounded-md px-2.5 py-1 font-medium capitalize transition-colors",
            role === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function AppFrame({ children }: { children: ReactNode }) {
  const { user, role, roleLabel } = useAppState();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border bg-surface/80 backdrop-blur">
        <Link to="/" className="flex items-center gap-3 px-5 py-5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <span>
            <span className="block font-display text-sm font-bold leading-tight">AICTE VerifyAI</span>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">EoA decision support</span>
          </span>
        </Link>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{
                className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors bg-primary/12 text-primary",
              }}
              inactiveProps={{
                className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User Persona & Role Switcher */}
        <div className="space-y-3 border-t border-border p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Active Session</div>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <LogIn className="size-3" /> Switch
            </button>
          </div>

          <div className="rounded-lg border border-border bg-card/60 p-2.5 space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                {user.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground truncate">{user.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{user.badge ?? roleLabel}</div>
              </div>
            </div>
            {user.institution && (
              <div className="text-[9px] text-muted-foreground/90 truncate border-t border-border/60 pt-1 mt-1 font-mono">
                {user.institution}
              </div>
            )}
          </div>

          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Quick Role Switch:</div>
            <RoleSwitcher />
          </div>
        </div>
      </aside>

      <div className="ml-60 flex min-h-screen w-[calc(100%-15rem)] flex-col">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 px-6 py-2 backdrop-blur">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary" />
            AI output is decision support. Final decisions rest with the competent AICTE authority.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <User className="size-3 text-primary" />
              <span className="font-medium text-foreground">{user.name}</span>
              <span className="rounded bg-primary/15 px-1 py-0.2 text-[10px] font-mono text-primary uppercase">
                {role}
              </span>
            </button>
          </div>
        </div>
        <main className="flex-1 px-6 py-6">{children}</main>
        <footer className="border-t border-border px-6 py-3 text-[11px] text-muted-foreground">
          AICTE VerifyAI · Prototype · All institutions, documents and persons shown are synthetic demo data.
        </footer>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        defaultRole={role}
      />
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
        <ElevenLabsVoiceWidget />
      </AppProvider>
    </QueryClientProvider>
  );
}
