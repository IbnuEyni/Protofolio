"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

// SSR-safe import — ForceGraph2D uses browser APIs
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// ── Types ─────────────────────────────────────────────────────────────────────

type GraphNode = {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  label: string;
  x?: number;
  y?: number;
};

type GraphLink = { source: string | GraphNode; target: string | GraphNode };
type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

type Tooltip = { node: GraphNode; x: number; y: number } | null;

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Language:      "#6366f1", // indigo
  Framework:     "#8b5cf6", // violet
  "AI/ML":       "#22d3ee", // cyan
  Database:      "#10b981", // emerald
  DevOps:        "#f59e0b", // amber
  Other:         "#6b7280", // gray
};

const PROFICIENCY_LABELS: Record<number, string> = {
  1: "Beginner", 2: "Elementary", 3: "Intermediate", 4: "Advanced", 5: "Expert",
};

function nodeColor(node: GraphNode): string {
  return CATEGORY_COLORS[node.category] ?? CATEGORY_COLORS.Other;
}

function nodeRadius(node: GraphNode): number {
  return 5 + node.proficiency * 2.5; // 7.5 – 17.5 px
}

// ── Custom canvas painter ─────────────────────────────────────────────────────

function paintNode(
  node: GraphNode,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  hovered: GraphNode | null
) {
  const r      = nodeRadius(node);
  const color  = nodeColor(node);
  const isHov  = hovered?.id === node.id;
  const x      = node.x ?? 0;
  const y      = node.y ?? 0;

  // glow on hover
  if (isHov) {
    ctx.save();
    ctx.shadowColor  = color;
    ctx.shadowBlur   = 20;
    ctx.beginPath();
    ctx.arc(x, y, r + 4, 0, 2 * Math.PI);
    ctx.fillStyle = color + "33";
    ctx.fill();
    ctx.restore();
  }

  // outer ring
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = isHov ? color : color + "cc";
  ctx.fill();

  // inner highlight
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.35, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fill();

  // label
  const fontSize = Math.max(10 / globalScale, isHov ? 13 / globalScale : 11 / globalScale);
  ctx.font        = `${isHov ? 600 : 400} ${fontSize}px Inter, sans-serif`;
  ctx.fillStyle   = isHov ? "#ffffff" : "rgba(255,255,255,0.75)";
  ctx.textAlign   = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(node.name, x, y + r + fontSize * 0.9);
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-1.5 bg-gray-900/80 backdrop-blur border border-gray-700/60 rounded-xl p-3">
      {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== "Other").map(([cat, color]) => (
        <div key={cat} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-xs text-gray-400">{cat}</span>
        </div>
      ))}
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function NodeTooltip({ tooltip }: { tooltip: Tooltip }) {
  if (!tooltip) return null;
  const { node, x, y } = tooltip;
  const color = nodeColor(node);
  return (
    <div
      className="pointer-events-none absolute z-20 px-3 py-2 rounded-xl border text-xs shadow-xl backdrop-blur-sm bg-gray-900/95"
      style={{ left: x + 14, top: y - 10, borderColor: color + "60" }}
    >
      <p className="font-semibold text-white">{node.label}</p>
      <p className="text-gray-400 mt-0.5">{node.category}</p>
      <div className="flex gap-0.5 mt-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-1.5 rounded-sm"
            style={{ backgroundColor: i < node.proficiency ? color : "#374151" }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SkillsNetwork() {
  const containerRef              = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 500 });
  const [graphData, setGraphData]   = useState<GraphData>({ nodes: [], links: [] });
  const [hovered, setHovered]       = useState<GraphNode | null>(null);
  const [tooltip, setTooltip]       = useState<Tooltip>(null);
  const [loading, setLoading]       = useState(true);

  // measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setDimensions({ w: el.clientWidth, h: el.clientHeight })
    );
    ro.observe(el);
    setDimensions({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // fetch graph data
  useEffect(() => {
    fetch("/api/skills/graph")
      .then((r) => r.json())
      .then((d) => { setGraphData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleNodeHover = useCallback(
    (node: GraphNode | null, prevNode: GraphNode | null) => {
      void prevNode;
      setHovered(node ?? null);
      if (!node) { setTooltip(null); return; }
      // canvas coords → DOM coords handled via onMouseMove below
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hovered) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({ node: hovered, x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [hovered]
  );

  const paintNodeCb = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) =>
      paintNode(node as GraphNode, ctx, globalScale, hovered),
    [hovered]
  );

  return (
    <section id="skills-network" className="max-w-5xl mx-auto px-6 py-24">
      <p className="text-sm font-medium text-cyan-400 tracking-widest uppercase mb-2">Visualised</p>
      <h2 className="text-3xl font-bold text-white mb-2">Skills Network</h2>
      <p className="text-gray-400 text-sm mb-8">
        How languages connect to frameworks, tools, and AI libraries. Hover a node to inspect proficiency.
      </p>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        className="relative w-full rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden"
        style={{ height: 520 }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && (
          <ForceGraph2D
            width={dimensions.w}
            height={dimensions.h}
            graphData={graphData}
            nodeId="id"
            nodeCanvasObject={paintNodeCb}
            nodeCanvasObjectMode={() => "replace"}
            nodePointerAreaPaint={(node, color, ctx) => {
              const n = node as GraphNode;
              ctx.beginPath();
              ctx.arc(n.x ?? 0, n.y ?? 0, nodeRadius(n) + 6, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            }}
            onNodeHover={handleNodeHover as (node: object | null) => void}
            linkColor={() => "rgba(99,102,241,0.25)"}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={1.5}
            linkDirectionalParticleColor={() => "#6366f1"}
            backgroundColor="transparent"
            cooldownTicks={120}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
          />
        )}

        <Legend />
        <NodeTooltip tooltip={tooltip} />
      </div>
    </section>
  );
}
