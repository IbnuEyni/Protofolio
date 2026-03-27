"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = { projects: number; experience: number; skills: number; certifications: number };

const CARDS = [
  { key: "projects", label: "Projects", href: "/admin/projects", color: "indigo" },
  { key: "experience", label: "Experience", href: "/admin/experience", color: "violet" },
  { key: "skills", label: "Skills", href: "/admin/skills", color: "sky" },
  { key: "certifications", label: "Certifications", href: "/admin/certifications", color: "emerald" },
] as const;

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-600/20 text-indigo-400 border-indigo-800",
  violet: "bg-violet-600/20 text-violet-400 border-violet-800",
  sky: "bg-sky-600/20 text-sky-400 border-sky-800",
  emerald: "bg-emerald-600/20 text-emerald-400 border-emerald-800",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/experience").then((r) => r.json()),
      fetch("/api/skills").then((r) => r.json()),
      fetch("/api/certifications").then((r) => r.json()),
    ]).then(([p, e, s, c]) =>
      setStats({ projects: p.length, experience: e.length, skills: s.length, certifications: c.length })
    );
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your portfolio content</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {CARDS.map((c) => (
          <Link
            key={c.key}
            href={c.href}
            className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 hover:border-gray-700 transition-colors group"
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{c.label}</p>
            <p className={`text-4xl font-bold ${colorMap[c.color].split(" ")[1]}`}>
              {stats ? stats[c.key] : "—"}
            </p>
            <p className="text-xs text-gray-600 mt-2 group-hover:text-gray-400 transition-colors">
              Manage →
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CARDS.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-700 hover:border-indigo-700 hover:bg-indigo-950/30 text-sm text-gray-400 hover:text-indigo-300 transition-colors"
            >
              + Add {c.label.slice(0, -1)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
