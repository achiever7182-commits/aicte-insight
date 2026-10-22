import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { SCENES, sceneAt } from '../config/cameraPath';
import { progress } from '../scroll/engine';
import { Link } from '@tanstack/react-router';

export function Overlay({ quality, setQuality, skip }: { quality: string; setQuality: () => void; skip: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    let r = 0;
    const f = () => {
      const n = sceneAt(progress.value).id;
      setI((c) => (c === n ? c : n));
      r = requestAnimationFrame(f);
    };
    f();
    return () => cancelAnimationFrame(r);
  }, []);

  const s = SCENES[i];

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-20 flex items-center justify-between px-6 md:px-12 py-4 bg-gradient-to-b from-[#0F0E0C]/90 via-[#0F0E0C]/60 to-transparent backdrop-blur-md border-b border-[#2C2723]">
        <Link to="/" className="font-display font-black text-xl text-[#F5EFE6] tracking-tight flex items-center gap-2">
          <span className="inline-block size-2.5 rounded-full bg-[#FF9933] shadow-[0_0_8px_#FF9933]"></span>
          AICTE <span className="text-[#FF9933]">VerifyAI</span>
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-[#D6CEBF]">
          <Link to="/constellation" className="hover:text-[#FF9933] transition-colors">
            Fraud Constellation
          </Link>
          <Link to="/reality-twin" className="hover:text-[#FF9933] transition-colors">
            Reality Twin
          </Link>
          <Link to="/copilot" className="hover:text-[#FF9933] transition-colors">
            Copilot
          </Link>
        </div>
        <Link
          to="/dashboard"
          className="border border-[#FF9933]/60 bg-[#FF9933] text-[#141210] font-bold px-4 py-2 text-sm rounded-lg shadow-[0_0_16px_rgba(255,153,51,0.35)] hover:shadow-[0_0_24px_#FF9933] hover:bg-[#FF9933]/90 transition"
        >
          Launch Dashboard &rarr;
        </Link>
      </nav>

      <div className="fixed left-6 md:left-12 bottom-12 z-10 max-w-xl pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#3E3832] bg-[#181512]/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/80"
          >
            {i > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FF9933]/15 border border-[#FF9933]/30 px-3 py-1 font-mono text-[#FF9933] text-xs font-bold mb-3">
                STEP 0{i} / 07
              </div>
            )}
            <h1 className={`font-display font-black leading-[1.08] text-[#F5EFE6] tracking-tight ${i === 0 ? "text-4xl md:text-5xl" : "text-2xl md:text-4xl"}`}>
              {s.title}
            </h1>
            <p className="mt-3 text-[#D6CEBF] font-normal text-base md:text-lg leading-relaxed">{s.line}</p>
            {i === 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 text-sm text-[#FF9933] font-semibold">
                  <span className="w-5 h-8 border border-[#FF9933] rounded-full relative inline-block">
                    <motion.i
                      className="absolute left-1/2 top-1.5 w-1 h-1.5 bg-[#FF9933] rounded -translate-x-1/2"
                      animate={{ y: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                    />
                  </span>
                  Scroll down to explore factory verification
                </div>
                <Link
                  to="/dashboard"
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-lg bg-[#FF9933] px-4 py-2 text-sm font-bold text-[#141210] shadow-lg hover:bg-[#FF9933]/90 transition"
                >
                  Open Dashboard &rarr;
                </Link>
              </div>
            )}
            {i > 0 && (
              <div className="mt-6 pointer-events-auto">
                <Link
                  to={i === 5 ? "/constellation" : i === 6 ? "/reality-twin" : "/dashboard"}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#FF9933]/40 bg-[#FF9933]/15 px-4 py-2 text-xs font-mono font-bold text-[#FF9933] hover:bg-[#FF9933]/25 transition"
                >
                  {i === 5
                    ? "Open Fraud Constellation Graph →"
                    : i === 6
                    ? "Open Reality Twin Discrepancy →"
                    : "Inspect in Validation Dashboard →"}
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ol aria-label="Progress" className="fixed right-5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {SCENES.map((x) => (
          <li
            key={x.id}
            title={x.key}
            className={`w-1.5 rounded-full transition-all ${
              x.id === i ? "h-8 bg-[#FF9933] shadow-[0_0_12px_#FF9933]" : "h-3 bg-[#443E38]"
            }`}
          />
        ))}
      </ol>

      <div className="fixed right-5 bottom-5 z-20 flex gap-2 text-xs font-mono">
        <button onClick={setQuality} className="border border-[#3E3832] bg-[#1C1917]/90 px-3 py-1.5 rounded-lg text-[#D6CEBF] hover:text-white hover:bg-[#2C2723] transition">
          Quality: {quality}
        </button>
        <button onClick={skip} className="border border-[#3E3832] bg-[#1C1917]/90 px-3 py-1.5 rounded-lg text-[#D6CEBF] hover:text-white hover:bg-[#2C2723] transition">
          Skip animation
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
      className={`fixed inset-0 z-50 grid place-items-center bg-[#0F0E0C] transition-opacity duration-700 pointer-events-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-[#FF9933] text-5xl font-black">{Math.round(p || 100)}%</span>
        <span className="font-mono text-xs text-[#A89F91] tracking-widest uppercase font-semibold">
          Loading 3D Verification Assembly Line
        </span>
      </div>
    </div>
  );
}
