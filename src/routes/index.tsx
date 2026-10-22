import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, Suspense, lazy } from "react";
import { Overlay, Loader } from "@/landing/ui/Overlay";
import { ExecutivePortal } from "@/landing/ui/ExecutivePortal";
import { startScroll } from "@/landing/scroll/engine";

const World = lazy(() => import("@/landing/scenes/World"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AICTE Insight — Intelligent Extension of Approval Validation" },
      {
        name: "description",
        content:
          "Institutional integrity verified at machine speed. AICTE VerifyAI validates EoA applications with 3D verification journeys, fraud constellation, and Reality Twin.",
      },
      { property: "og:title", content: "AICTE Insight — Intelligent EoA Validation" },
      {
        property: "og:description",
        content:
          "Decision-support platform for AICTE Extension of Approval validation with fraud ring detection and reality gap analysis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState<"high" | "low">("high");

  useEffect(() => {
    setMounted(true);
    const mobile =
      typeof window !== "undefined" &&
      (window.matchMedia("(max-width:768px)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (mobile) setQ("low");

    const s = startScroll("#scroll");
    (window as any).__lenis = s.lenis;
    return () => {
      s.stop();
    };
  }, []);

  const skip = () => {
    const lenis = (window as any).__lenis;
    const portalEl = document.getElementById("portal-overview");
    if (portalEl && lenis) {
      lenis.scrollTo(portalEl, { duration: 1.4 });
    } else if (portalEl) {
      portalEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative min-h-screen bg-[#0B0A09] text-[#F5EFE6] overflow-x-hidden selection:bg-[#FF9933] selection:text-[#0F0D0A]">
      {/* Kaif's 3D Assembly World fixed in background */}
      <div className="fixed inset-0 z-0">
        {mounted ? (
          <Suspense fallback={<div className="w-full h-full bg-[#0B0A09]" />}>
            <World quality={q} />
          </Suspense>
        ) : (
          <div className="w-full h-full bg-[#0B0A09]" />
        )}
      </div>

      <Loader />

      {/* 3D Telemetry HUD & Navigation Overlay */}
      <Overlay
        quality={q}
        setQuality={() => setQ((prev) => (prev === "high" ? "low" : "high"))}
        skip={skip}
      />

      {/* 3D Scroll Track (Drives Kaif's conveyor and camera rig) */}
      <div id="scroll" style={{ height: "750vh" }} aria-hidden />

      {/* Seamless Transition into Monumental Executive Portal */}
      <div className="relative z-10 bg-[#0B0A09] shadow-[0_-20px_50px_rgba(11,10,9,1)]">
        <ExecutivePortal />
      </div>
    </main>
  );
}
