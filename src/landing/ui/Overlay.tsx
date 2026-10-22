import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { SCENES, sceneAt } from '../config/cameraPath';
import { progress } from '../scroll/engine';
import { Link } from '@tanstack/react-router';
import { ShieldCheck, ArrowDown, ChevronRight, Sparkles, SlidersHorizontal, Eye } from 'lucide-react';

export function Overlay({
  quality,
  setQuality,
  skip,
}: {
  quality: string;
  setQuality: () => void;
  skip: () => void;
}) {
  const [i, setI] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isPast3D, setIsPast3D] = useState(false);

  useEffect(() => {
    let r = 0;
    const f = () => {
      const p = progress.value;
      setCurrentProgress(p);
      const n = sceneAt(p).id;
      setI((c) => (c === n ? c : n));
      setIsPast3D(p >= 0.98);
      r = requestAnimationFrame(f);
    };
    f();
    return () => cancelAnimationFrame(r);
  }, []);

  const s = SCENES[i];

  const scrollToScene = (sceneIndex: number) => {
    const targetScene = SCENES[sceneIndex];
    if (!targetScene) return;
    const lenis = (window as any).__lenis;
    if (lenis) {
      const scrollEl = document.getElementById('scroll');
      if (scrollEl) {
        const totalHeight = scrollEl.offsetHeight;
        const targetScroll = totalHeight * (targetScene.range[0] + 0.02);
        lenis.scrollTo(targetScroll, { duration: 1.2 });
      }
    }
  };

  const scrollToPortal = () => {
    const lenis = (window as any).__lenis;
    const portalEl = document.getElementById('portal-overview');
    if (portalEl && lenis) {
      lenis.scrollTo(portalEl, { duration: 1.4 });
    } else if (portalEl) {
      portalEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 sm:px-8 md:px-12 py-3.5 bg-gradient-to-b from-[#0B0A09]/95 via-[#0B0A09]/75 to-transparent backdrop-blur-md border-b border-[#2C2721]/80">
        <Link
          to="/"
          className="font-display font-black text-lg sm:text-xl text-[#F5EFE6] tracking-tight flex items-center gap-2.5 group"
        >
          <span className="relative flex size-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9933] opacity-75"></span>
            <span className="relative inline-flex rounded-full size-3 bg-[#FF9933] shadow-[0_0_10px_#FF9933]"></span>
          </span>
          <span className="flex items-center gap-1.5">
            AICTE <span className="text-[#FF9933] font-bold">Insight</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest text-[#9E9485] border border-[#2C2721] px-1.5 py-0.5 rounded ml-1 bg-[#161411]">
              EoA 2025-26
            </span>
          </span>
        </Link>

        {/* Center route links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#C8BFB2]">
          <button
            onClick={() => scrollToScene(0)}
            className="hover:text-[#FF9933] transition-colors flex items-center gap-1"
          >
            3D Assembly Line
          </button>
          <button
            onClick={scrollToPortal}
            className="hover:text-[#FF9933] transition-colors flex items-center gap-1 text-[#FF9933]/90"
          >
            Executive Overview
          </button>
          <Link to="/constellation" className="hover:text-[#FF9933] transition-colors">
            Fraud Constellation
          </Link>
          <Link to="/reality-twin" className="hover:text-[#FF9933] transition-colors">
            Reality Twin
          </Link>
          <Link to="/copilot" className="hover:text-[#FF9933] transition-colors">
            Officer Copilot
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={scrollToPortal}
            className="hidden sm:inline-flex items-center gap-1.5 border border-[#3E3832] bg-[#1A1714]/80 text-[#E6DEC8] hover:text-white hover:border-[#FF9933]/50 px-3 py-1.5 text-xs rounded-lg transition"
          >
            <ArrowDown className="size-3 text-[#FF9933]" />
            Deep Dive
          </button>
          <Link
            to="/dashboard"
            className="border border-[#FF9933]/80 bg-[#FF9933] text-[#0F0D0A] font-bold px-3.5 py-1.5 text-xs sm:text-sm rounded-lg shadow-[0_0_18px_rgba(255,153,51,0.35)] hover:shadow-[0_0_26px_#FF9933] hover:bg-[#FFB05C] transition flex items-center gap-1.5"
          >
            <span>Launch Dashboard</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* Floating 3D Telemetry HUD Card (Visible primarily during 3D scroll) */}
      <div
        className={`fixed left-4 sm:left-8 md:left-12 bottom-8 sm:bottom-12 z-20 max-w-xl pointer-events-none transition-all duration-500 ${
          isPast3D ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="rounded-2xl border border-[#3A332B] bg-[#14120F]/90 p-5 sm:p-7 backdrop-blur-xl shadow-2xl shadow-black/90 pointer-events-auto relative overflow-hidden"
          >
            {/* Top ambient line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF9933]/70 to-transparent" />

            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FF9933]/15 border border-[#FF9933]/30 px-3 py-1 font-mono text-[#FF9933] text-[11px] font-bold">
                <span className="size-1.5 rounded-full bg-[#FF9933] animate-pulse"></span>
                STAGE 0{i + 1} / 08 · {s.key.toUpperCase()}
              </div>

              <div className="font-mono text-[10px] text-[#A89F91] tracking-wider uppercase hidden sm:block">
                CONVEYOR: {Math.round(currentProgress * 100)}%
              </div>
            </div>

            <h1
              className={`font-display font-black leading-[1.1] text-[#F5EFE6] tracking-tight ${
                i === 0 ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-3xl'
              }`}
            >
              {s.title}
            </h1>

            <p className="mt-2.5 text-[#C8BFB2] font-normal text-sm sm:text-base leading-relaxed">
              {s.line}
            </p>

            {/* Stage Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {i === 0 ? (
                <>
                  <div className="flex items-center gap-2.5 text-xs text-[#FF9933] font-semibold bg-[#FF9933]/10 border border-[#FF9933]/20 px-3 py-1.5 rounded-lg">
                    <span className="w-3.5 h-6 border border-[#FF9933] rounded-full relative inline-block">
                      <motion.i
                        className="absolute left-1/2 top-1 w-0.5 h-1.5 bg-[#FF9933] rounded -translate-x-1/2"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    </span>
                    Scroll down through 3D conveyor
                  </div>
                  <button
                    onClick={scrollToPortal}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#3E3832] bg-[#1E1A16] px-3.5 py-1.5 text-xs font-semibold text-[#E6DEC8] hover:text-white hover:border-[#FF9933]/60 transition"
                  >
                    <span>Jump to Overview</span>
                    <ArrowDown className="size-3 text-[#FF9933]" />
                  </button>
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={i === 5 ? '/constellation' : i === 6 ? '/reality-twin' : '/dashboard'}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#FF9933]/40 bg-[#FF9933]/15 px-3.5 py-2 text-xs font-mono font-bold text-[#FF9933] hover:bg-[#FF9933]/25 transition"
                  >
                    {i === 5
                      ? 'Open Fraud Constellation Graph →'
                      : i === 6
                      ? 'Inspect Reality Twin Discrepancy →'
                      : 'Inspect In Validation Dashboard →'}
                  </Link>

                  <button
                    onClick={scrollToPortal}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A332B] bg-[#1C1814] px-3 py-2 text-xs font-semibold text-[#A89F91] hover:text-[#F5EFE6] hover:border-[#FF9933]/40 transition"
                  >
                    Skip to Overview ↓
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive Right-side Scene Stepper */}
      <ol
        aria-label="3D Stages"
        className={`fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5 transition-opacity duration-300 ${
          isPast3D ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {SCENES.map((x) => (
          <li key={x.id} className="relative group flex items-center justify-end">
            <span className="pointer-events-none absolute right-6 font-mono text-[10px] text-[#C8BFB2] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#181512] px-2 py-0.5 rounded border border-[#3A332B] shadow-lg">
              0{x.id + 1}. {x.key}
            </span>
            <button
              onClick={() => scrollToScene(x.id)}
              aria-label={`Jump to stage ${x.id + 1}: ${x.key}`}
              className={`rounded-full transition-all duration-300 ${
                x.id === i
                  ? 'w-2 h-7 bg-[#FF9933] shadow-[0_0_12px_#FF9933]'
                  : 'w-2 h-2.5 bg-[#423A32] hover:bg-[#A89F91]'
              }`}
            />
          </li>
        ))}
      </ol>

      {/* Bottom right HUD controls */}
      <div
        className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-20 flex items-center gap-2 text-xs font-mono transition-opacity duration-300 ${
          isPast3D ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          onClick={setQuality}
          className="border border-[#383129] bg-[#161310]/90 px-3 py-1.5 rounded-lg text-[#C8BFB2] hover:text-white hover:border-[#FF9933]/40 transition flex items-center gap-1.5 shadow-md"
        >
          <SlidersHorizontal className="size-3 text-[#FF9933]" />
          3D: {quality.toUpperCase()}
        </button>

        <button
          onClick={scrollToPortal}
          className="border border-[#383129] bg-[#161310]/90 px-3 py-1.5 rounded-lg text-[#C8BFB2] hover:text-white hover:border-[#FF9933]/40 transition flex items-center gap-1.5 shadow-md"
        >
          <Eye className="size-3 text-[#FF9933]" />
          Skip 3D
        </button>
      </div>
    </>
  );
}

export function Loader() {
  const { progress: p, active } = useProgress();
  const [forceHide, setForceHide] = useState(false);

  useEffect(() => {
    if (!active || p >= 100) {
      const timer = setTimeout(() => setForceHide(true), 300);
      return () => clearTimeout(timer);
    }
    const fallback = setTimeout(() => setForceHide(true), 1500);
    return () => clearTimeout(fallback);
  }, [active, p]);

  const visible = !forceHide && (active || p < 100);

  return (
    <div
      className={`fixed inset-0 z-50 grid place-items-center bg-[#0B0A09] transition-opacity duration-700 pointer-events-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative size-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-[#2C2721]"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-[#FF9933] animate-spin"></div>
          <ShieldCheck className="size-7 text-[#FF9933]" />
        </div>
        <div className="text-center">
          <span className="font-mono text-[#FF9933] text-3xl font-black">{Math.round(p || 100)}%</span>
          <span className="block font-mono text-[11px] text-[#A89F91] tracking-widest uppercase font-semibold mt-1">
            INITIALIZING 3D VERIFICATION ASSEMBLY
          </span>
        </div>
      </div>
    </div>
  );
}
