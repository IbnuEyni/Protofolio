"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";

// ── Particle system ──────────────────────────────────────────────────────────

interface Particle {
  x: number; y: number;        // base position (0-1 normalised)
  z: number;                   // depth layer 0.2 – 1.0
  size: number;
  opacity: number;
  vx: number; vy: number;      // drift velocity
  color: string;
}

const COLORS = [
  "rgba(148,163,184,",   // slate-300
  "rgba(100,116,139,",   // slate-500
  "rgba(99,102,241,",    // indigo
  "rgba(139,92,246,",    // violet
  "rgba(226,232,240,",   // slate-200
];

function makeParticle(W: number, H: number): Particle {
  const z = 0.2 + Math.random() * 0.8;
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    z,
    size: z * (0.6 + Math.random() * 1.4),
    opacity: z * (0.25 + Math.random() * 0.45),
    vx: (Math.random() - 0.5) * 0.18 * z,
    vy: (Math.random() - 0.5) * 0.18 * z,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

const COUNT = 160;

function ParticleCanvas({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  // keep mouse ref in sync without re-rendering
  useEffect(() => { mouse.current = { x: mouseX, y: mouseY }; }, [mouseX, mouseY]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles.current = Array.from({ length: COUNT }, () =>
        makeParticle(canvas.width, canvas.height)
      );
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      const mx = mouse.current.x;   // 0-1
      const my = mouse.current.y;

      for (const p of particles.current) {
        // parallax offset — deeper particles move less
        const px = p.x + (mx - 0.5) * 60 * p.z;
        const py = p.y + (my - 0.5) * 40 * p.z;

        // drift
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        // draw dot
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();

        // subtle connection lines between close particles in same depth band
        for (const q of particles.current) {
          if (q === p || Math.abs(q.z - p.z) > 0.15) continue;
          const qx = q.x + (mx - 0.5) * 60 * q.z;
          const qy = q.y + (my - 0.5) * 40 * q.z;
          const dx = px - qx, dy = py - qy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(qx, qy);
            ctx.strokeStyle = `rgba(148,163,184,${0.04 * (1 - dist / 80) * p.z})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}

// ── Text animations ──────────────────────────────────────────────────────────

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  show:   { opacity: 1, filter: "blur(0px)", transition: { duration: 1.1, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] } },
};

// ── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);

  // spring-smooth the mouse values
  const springX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 60, damping: 20 });

  // subtle text parallax
  const textX = useTransform(springX, [0, 1], [-6, 6]);
  const textY = useTransform(springY, [0, 1], [-4, 4]);

  const handleMouse = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width);
    rawY.set((e.clientY - r.top)  / r.height);
  }, [rawX, rawY]);

  // expose spring values as plain numbers for canvas (avoids subscribing canvas to React re-renders)
  const mouseXRef = useRef(0.5);
  const mouseYRef = useRef(0.5);
  useEffect(() => {
    const unX = springX.on("change", v => { mouseXRef.current = v; });
    const unY = springY.on("change", v => { mouseYRef.current = v; });
    return () => { unX(); unY(); };
  }, [springX, springY]);

  // We pass a proxy object that the canvas reads via ref — no re-renders
  const proxyX = useRef(0.5);
  const proxyY = useRef(0.5);
  useEffect(() => {
    const unX = springX.on("change", v => { proxyX.current = v; });
    const unY = springY.on("change", v => { proxyY.current = v; });
    return () => { unX(); unY(); };
  }, [springX, springY]);

  return (
    <section
      onMouseMove={handleMouse}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#080c14]"
    >
      {/* ── Radial vignette overlays ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(99,102,241,0.07),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,rgba(15,23,42,0.7),transparent)]" />
      {/* bottom fade into page */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#080c14] to-transparent" />

      {/* ── Particle canvas ── */}
      <CanvasLayer springX={springX} springY={springY} />

      {/* ── Content ── */}
      <motion.div
        style={{ x: textX, y: textY }}
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center px-6 select-none"
      >
        {/* eyebrow */}
        <motion.span
          variants={fadeIn}
          className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-slate-700/60 bg-slate-900/50 backdrop-blur-sm text-xs font-medium tracking-[0.2em] uppercase text-slate-400"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Available for opportunities
        </motion.span>

        {/* name */}
        <motion.h1
          variants={fadeUp}
          className="font-bold tracking-[-0.03em] leading-none text-white hero-name"
          style={{ fontSize: "clamp(3.5rem, 10vw, 8.5rem)" }}
        >
          Amir
        </motion.h1>

        {/* last name / accent line */}
        <motion.div variants={fadeUp} className="mt-1 overflow-hidden">
          <span
            className="block font-bold tracking-[-0.02em] leading-none bg-gradient-to-r from-slate-300 via-indigo-300 to-violet-400 bg-clip-text text-transparent"
            style={{ fontSize: "clamp(2rem, 5.5vw, 4.8rem)" }}
          >
            Ahmedin
          </span>
        </motion.div>

        {/* divider */}
        <motion.div
          variants={fadeIn}
          className="mt-8 mb-8 flex items-center gap-4 w-full max-w-xs"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
          <span className="text-slate-600 text-xs tracking-widest">◆</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
        </motion.div>

        {/* subtitle */}
        <motion.p
          variants={fadeIn}
          className="text-slate-400 font-light tracking-wide max-w-lg"
          style={{ fontSize: "clamp(0.85rem, 2vw, 1.05rem)" }}
        >
          Software &amp; AI Engineer
          <span className="mx-2 text-slate-600">|</span>
          3+ Years Architecting Scalable Solutions
        </motion.p>

        {/* CTA row */}
        <motion.div variants={fadeUp} className="mt-12 flex gap-4 flex-wrap justify-center">
          <a
            href="#projects"
            className="group relative px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium tracking-wide transition-all duration-300 shadow-[0_0_24px_rgba(99,102,241,0.35)] hover:shadow-[0_0_36px_rgba(99,102,241,0.55)]"
          >
            View Projects
          </a>
          <a
            href="#experience"
            className="px-7 py-3 rounded-full border border-slate-700 hover:border-slate-500 bg-slate-900/40 backdrop-blur-sm text-slate-300 hover:text-white text-sm font-medium tracking-wide transition-all duration-300"
          >
            Work Experience
          </a>
        </motion.div>

        {/* stat strip */}
        <motion.div
          variants={fadeIn}
          className="mt-20 flex gap-12 flex-wrap justify-center"
        >
          {[
            { value: "4+",  label: "Years experience" },
            { value: "2k+", label: "Users impacted" },
            { value: "5",   label: "Companies" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1 tracking-widest uppercase">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase text-slate-600">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent"
        />
      </motion.div>
    </section>
  );
}

// ── Canvas wrapper (reads spring values via subscription, never re-renders) ──

function CanvasLayer({
  springX,
  springY,
}: {
  springX: ReturnType<typeof useSpring>;
  springY: ReturnType<typeof useSpring>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef    = useRef<number>(0);
  const mouse     = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const unX = springX.on("change", v => { mouse.current.x = v; });
    const unY = springY.on("change", v => { mouse.current.y = v; });
    return () => { unX(); unY(); };
  }, [springX, springY]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles.current = Array.from({ length: COUNT }, () =>
        makeParticle(canvas.width, canvas.height)
      );
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let i = 0; i < particles.current.length; i++) {
        const p  = particles.current[i];
        const px = p.x + (mx - 0.5) * 55 * p.z;
        const py = p.y + (my - 0.5) * 38 * p.z;

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();

        // connection lines — only check forward to avoid double-drawing
        for (let j = i + 1; j < particles.current.length; j++) {
          const q = particles.current[j];
          if (Math.abs(q.z - p.z) > 0.18) continue;
          const qx  = q.x + (mx - 0.5) * 55 * q.z;
          const qy  = q.y + (my - 0.5) * 38 * q.z;
          const dx  = px - qx, dy = py - qy;
          const d2  = dx * dx + dy * dy;
          if (d2 < 6400) { // 80px²
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(qx, qy);
            ctx.strokeStyle = `rgba(148,163,184,${0.045 * (1 - Math.sqrt(d2) / 80) * p.z})`;
            ctx.lineWidth   = 0.4;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
