"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, XCircle } from "lucide-react";
import type { PlatformProfile } from "@/lib/platforms/index";

const CAT_LABEL: Record<string, string> = {
  humanoid: "Humanoid",
  drone: "Drone",
  industrial: "Industrial",
  delivery: "Delivery",
  micromobility: "Micromobility",
  medical: "Medical",
  datacenter: "Data Center",
};

const CAT_COLOR: Record<string, string> = {
  humanoid: "bg-violet-500/[0.10] text-violet-700 border-violet-500/20",
  drone: "bg-sky-500/[0.10] text-sky-700 border-sky-500/20",
  industrial: "bg-amber-500/[0.10] text-amber-700 border-amber-500/20",
  delivery: "bg-emerald-500/[0.10] text-emerald-700 border-emerald-500/20",
  micromobility: "bg-rose-500/[0.10] text-rose-700 border-rose-500/20",
  medical: "bg-teal-500/[0.10] text-teal-700 border-teal-500/20",
  datacenter: "bg-slate-500/[0.10] text-slate-700 border-slate-500/20",
};

export function PlatformSearch({ platforms }: { platforms: PlatformProfile[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    platforms.forEach((p) => seen.add(p.category));
    return Array.from(seen).sort();
  }, [platforms]);

  const filtered = useMemo(() => {
    let list = platforms;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }
    return list;
  }, [platforms, query, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink)]/30" size={16} />
        <input
          type="text"
          placeholder="Search platforms, manufacturers, categories…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-[14px] border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] pl-11 pr-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink)]/35 focus:outline-none focus:border-[var(--ink)]/25 focus:ring-1 focus:ring-[var(--ink)]/15 transition"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink)]/30 hover:text-[var(--ink)]/60"
            aria-label="Clear search"
          >
            <XCircle size={16} />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full border px-3 py-1.5 font-ui text-[0.50rem] uppercase tracking-[0.12em] transition ${
            !selectedCategory
              ? "border-ember/50 bg-ember/[0.08] text-ember"
              : "border-[var(--ink)]/[0.08] text-[var(--ink)]/50 hover:border-[var(--ink)]/20"
          }`}
        >
          All ({platforms.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`rounded-full border px-3 py-1.5 font-ui text-[0.50rem] uppercase tracking-[0.12em] transition ${
              selectedCategory === cat
                ? "border-ember/50 bg-ember/[0.08] text-ember"
                : "border-[var(--ink)]/[0.08] text-[var(--ink)]/50 hover:border-[var(--ink)]/20"
            }`}
          >
            {CAT_LABEL[cat] ?? cat} ({platforms.filter((p) => p.category === cat).length})
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="font-ui text-[0.50rem] uppercase tracking-[0.12em] text-[var(--ink)]/30">
        {filtered.length} of {platforms.length} platforms
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-[14px] border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.02] p-8 text-center">
          <p className="text-sm text-[var(--ink)]/40">No platforms match your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/knowledge/${p.id}`}
              className="group panel-elevated flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-header text-base leading-tight text-[var(--ink)] group-hover:text-ember transition truncate">
                    {p.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--ink)]/40">{p.manufacturer}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 font-ui text-[0.46rem] uppercase tracking-[0.10em] ${CAT_COLOR[p.category] ?? "border-[var(--ink)]/[0.08] text-[var(--ink)]/50"}`}
                >
                  {CAT_LABEL[p.category] ?? p.category}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--ink)]/45 line-clamp-2">
                {p.description || "No description available."}
              </p>
              <div className="mt-auto flex items-center justify-between pt-2 border-t border-[var(--ink)]/[0.04]">
                <span className="font-ui text-[0.50rem] uppercase tracking-[0.12em] text-[var(--ink)]/30">
                  {p.failureSignatures.length} failure modes
                </span>
                <span className="font-ui text-[0.50rem] uppercase tracking-[0.12em] text-ember opacity-0 group-hover:opacity-100 transition">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
