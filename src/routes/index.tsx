import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, Suspense, lazy } from "react";
import { Overlay, Loader } from "@/landing/ui/Overlay";
import { startScroll } from "@/landing/scroll/engine";

const World = lazy(() => import("@/landing/scenes/World"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AICTE VerifyAI — Intelligent Extension of Approval Validation" },
      {
        name: "description",
        content: "Every document verified before it reaches a desk. AICTE VerifyAI validates EoA applications with 3D verification journeys, fraud constellation, and Reality Twin.",
      },
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

  const skip = () => (window as any).__lenis?.scrollTo(document.body.scrollHeight);

  return (
    <main className="relative min-h-screen bg-[#0F0E0C] text-[#F5EFE6] overflow-x-hidden selection:bg-[#FF9933] selection:text-[#141210]">
      <div className="fixed inset-0 z-0">
        {mounted ? (
          <Suspense fallback={<div className="w-full h-full bg-[#0F0E0C]" />}>
            <World quality={q} />
          </Suspense>
        ) : (
          <div className="w-full h-full bg-[#0F0E0C]" />
        )}
      </div>

      <Loader />

      <Overlay
        quality={q}
        setQuality={() => setQ((prev) => (prev === "high" ? "low" : "high"))}
        skip={skip}
      />

      <div id="scroll" style={{ height: "1000vh" }} aria-hidden />
    </main>
  );
}
