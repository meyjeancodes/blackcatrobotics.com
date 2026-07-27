"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Crosshair,
  Expand,
  Play,
  Wrench,
  X,
  Search,
  Filter,
  XCircle,
  Zap,
  Cpu,
  Bot,
  Radio,
  Globe,
  Shield,
  Wifi,
  Database,
  HardDrive,
  Mic,
  Camera,
  Thermometer,
  Battery,
  GitBranch,
  LayoutGrid,
  Settings,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  Tag,
  User,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Menu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PlatformCard } from "./platform-card";
import { BlueprintExplorer } from "./blueprint-explorer";
import { SimLab } from "./sim-lab";
import { usePlatforms } from "@/lib/knowledge/supabase-platforms";
import type { PlatformProfile } from "@/lib/platforms/index";

type Modal =
  | { kind: "explorer"; platformId: string }
  | { kind: "blueprint"; platformId: string }
  | { kind: "sim"; platformId: string }
  | null;

interface Props {
  // Static platforms passed as fallback (for SSR)
  initialPlatforms?: PlatformProfile[];
}

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

export function KnowledgeHubClient({ initialPlatforms = [] }: Props) {
  const { platforms: supabasePlatforms, loading, error, source, refetch } = usePlatforms();
  const [modal, setModal] = useState<Modal>(null);
  const [closing, setClosing] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // SSR already resolves platforms via the service-role Supabase client.
  // Only let the client hook REPLACE that data when it genuinely succeeded
  // (source === "supabase"). Previously the hook's *static fallback* was
  // merged over the good SSR rows, which wiped real `image_url` values and
  // left every card pointing at a non-existent `/images/platforms/<id>.png`
  // — that 404 is what produced the tall empty white blocks.
  const allPlatforms = useMemo(() => {
    if (source === "supabase" && supabasePlatforms.length > 0) {
      const map = new Map<string, PlatformProfile>();
      initialPlatforms.forEach((p) => map.set(p.id, p));
      supabasePlatforms.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    }
    // Client fetch failed or fell back to static — trust the SSR payload.
    return initialPlatforms.length > 0 ? initialPlatforms : supabasePlatforms;
  }, [initialPlatforms, supabasePlatforms, source]);

  // Filter state
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [showOnlyWithBlueprints, setShowOnlyWithBlueprints] = useState(false);
  const [showOnlyWithSim, setShowOnlyWithSim] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => setMounted(true), []);

  const byCategory = useMemo(() => {
    return allPlatforms.reduce<Record<string, PlatformProfile[]>>((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {});
  }, [allPlatforms]);

  const manufacturers = useMemo(() => {
    const set = new Set<string>();
    allPlatforms.forEach((p) => set.add(p.manufacturer));
    return Array.from(set).sort();
  }, [allPlatforms]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const filteredPlatforms = useMemo(() => {
    let list = allPlatforms;

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

    if (selectedManufacturer) {
      list = list.filter((p) => p.manufacturer === selectedManufacturer);
    }

    if (selectedSeverity) {
      list = list.filter((p) =>
        p.failureSignatures.some((fs) => fs.severity === selectedSeverity)
      );
    }

    if (showOnlyWithBlueprints) {
      list = list.filter((p) => p.diagramUrl);
    }

    if (showOnlyWithSim) {
      list = list.filter((p) => p.tlmRanges);
    }

    return list;
  }, [
    allPlatforms,
    query,
    selectedCategory,
    selectedManufacturer,
    selectedSeverity,
    showOnlyWithBlueprints,
    showOnlyWithSim,
  ]);

  const visibleCategories = useMemo(() => {
    const seen = new Set<string>();
    allPlatforms.forEach((p) => seen.add(p.category));
    return Object.entries(CAT_COLOR).filter(([cat]) => seen.has(cat));
  }, [allPlatforms]);

  const handleCategoryClick = (cat: string) => {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(cat);
      scrollToSection("platform-catalog");
    }
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory(null);
    setSelectedManufacturer(null);
    setSelectedSeverity(null);
    setShowOnlyWithBlueprints(false);
    setShowOnlyWithSim(false);
  };

  const hasActiveFilters =
    query ||
    selectedCategory ||
    selectedManufacturer ||
    selectedSeverity ||
    showOnlyWithBlueprints ||
    showOnlyWithSim;

  const openModal = (m: Modal) => {
    setClosing(false);
    setModal(m);
  };

  const openBlueprint = (platformId: string) => {
    setHighlightedId(platformId);
    setTimeout(() => setHighlightedId(null), 500);
    openModal({ kind: "blueprint", platformId });
  };

  const closeModal = () => {
    setClosing(true);
    setTimeout(() => {
      setModal(null);
      setClosing(false);
    }, 150);
  };

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal]);

  useEffect(() => {
    if (modal) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [modal]);

  if (!mounted) {
    return (
      <div className="space-y-8" aria-busy="true">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="panel-elevated h-64 animate-pulse bg-[var(--ink)]/[0.03]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Platform catalog by category */}
      <div id="platform-catalog" className="mb-8">
        <div className="mb-6">
          <p className="kicker">Layer 1 — Physical</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-[var(--ink)]">Robot Platform Catalog</h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            Specs, failure signatures, and interactive diagrams for every supported platform.
            {source === "supabase" && <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 text-xs">● Live from Supabase</span>}
            {source === "static" && <span className="ml-2 inline-flex items-center gap-1 text-amber-600 text-xs">○ Static fallback</span>}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-4">
          {/* Main Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink)]/30" size={16} />
            <input
              type="text"
              placeholder="Search platforms, manufacturers, categories, components…"
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

          {/* Filter Chips Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-full border border-[var(--ink)]/[0.10] bg-[var(--ink)]/[0.03] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-ui text-[0.5rem] uppercase tracking-[0.1em] transition ${
                  viewMode === "grid"
                    ? "bg-white text-[var(--ink)] shadow-sm"
                    : "text-[var(--ink)]/50 hover:text-[var(--ink)]"
                }`}
                title="Grid view"
              >
                <LayoutGrid size={13} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-ui text-[0.5rem] uppercase tracking-[0.1em] transition ${
                  viewMode === "list"
                    ? "bg-white text-[var(--ink)] shadow-sm"
                    : "text-[var(--ink)]/50 hover:text-[var(--ink)]"
                }`}
                title="List view"
              >
                <Menu size={13} />
              </button>
            </div>

            {/* Category Filter */}
            <div className="inline-flex items-center gap-1.5">
              <span className="font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)]/35 shrink-0">Category:</span>
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="rounded-full border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 py-1.5 font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]/25"
              >
                <option value="">All Categories</option>
                {visibleCategories.map(([cat]) => (
                  <option key={cat} value={cat}>
                    {CAT_LABEL[cat]} ({allPlatforms.filter((p) => p.category === cat).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Manufacturer Filter */}
            <div className="inline-flex items-center gap-1.5">
              <span className="font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)]/35 shrink-0">Manufacturer:</span>
              <select
                value={selectedManufacturer || ""}
                onChange={(e) => setSelectedManufacturer(e.target.value || null)}
                className="rounded-full border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 py-1.5 font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]/25 max-w-[180px]"
              >
                <option value="">All Manufacturers</option>
                {manufacturers.map((m) => (
                  <option key={m} value={m}>
                    {m} ({allPlatforms.filter((p) => p.manufacturer === m).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div className="inline-flex items-center gap-1.5">
              <span className="font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)]/35 shrink-0">Severity:</span>
              <select
                value={selectedSeverity || ""}
                onChange={(e) => setSelectedSeverity(e.target.value || null)}
                className="rounded-full border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 py-1.5 font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]/25"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical Only</option>
                <option value="warning">Warnings</option>
                <option value="info">Info</option>
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-ui text-[0.5rem] uppercase tracking-[0.1em] transition ${
                showAdvancedFilters
                  ? "border-ember/50 bg-ember/[0.08] text-ember"
                  : "border-[var(--ink)]/[0.08] text-[var(--ink)]/50 hover:border-[var(--ink)]/20"
              }`}
            >
              <Filter size={12} />
              Advanced
              <ChevronDown size={12} className={showAdvancedFilters ? "rotate-180" : ""} />
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--ink)]/[0.10] px-3 py-1.5 font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)]/50 transition hover:border-[var(--ink)]/25 hover:text-[var(--ink)]"
              >
                <XCircle size={12} /> Clear
              </button>
            )}

            {/* Results Count */}
            <span className="font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)]/35 ml-auto shrink-0">
              {filteredPlatforms.length} of {allPlatforms.length} platforms
            </span>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="rounded-[14px] border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.02] p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-ui text-[0.55rem] uppercase tracking-[0.12em] text-[var(--ink)]/40 shrink-0">Capabilities:</span>
                <label className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink)]/[0.10] px-3 py-1 font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)]/50 cursor-pointer hover:bg-[var(--ink)]/[0.03]">
                  <input
                    type="checkbox"
                    checked={showOnlyWithBlueprints}
                    onChange={(e) => setShowOnlyWithBlueprints(e.target.checked)}
                    className="rounded border-[var(--ink)]/30 text-sky-600 focus:ring-sky-500"
                  />
                  Has Blueprint
                </label>
                <label className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink)]/[0.10] px-3 py-1 font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)]/50 cursor-pointer hover:bg-[var(--ink)]/[0.03]">
                  <input
                    type="checkbox"
                    checked={showOnlyWithSim}
                    onChange={(e) => setShowOnlyWithSim(e.target.checked)}
                    className="rounded border-[var(--ink)]/30 text-sky-600 focus:ring-sky-500"
                  />
                  Has Simulation
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-ui text-[0.55rem] uppercase tracking-[0.12em] text-[var(--ink)]/40 shrink-0">Certification:</span>
                <select
                  className="rounded-full border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 py-1.5 font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]/25"
                >
                  <option value="">All Levels</option>
                  <option value="L1">L1 — Operator</option>
                  <option value="L2">L2 — Technician</option>
                  <option value="L3">L3 — Senior Tech</option>
                  <option value="L4">L4 — Systems Engineer</option>
                  <option value="L5">L5 — Architect</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-ui text-[0.55rem] uppercase tracking-[0.12em] text-[var(--ink)]/40 shrink-0">AI Layer:</span>
                <select
                  className="rounded-full border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 py-1.5 font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]/25"
                >
                  <option value="">All Layers</option>
                  <option value="world-model">World Models</option>
                  <option value="vla">VLA Models</option>
                  <option value="reward">Reward Models</option>
                  <option value="sim2real">Sim → Reality</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Category Section Headers + Grid.
            NOTE: plain div, NOT StaggerContainer — that component gates
            visibility on a window-root IntersectionObserver, which never
            fires inside the dashboard's overflow-y-auto <main>, leaving the
            whole catalog invisible (the "white space" bug's second head). */}
        <div className={viewMode === "grid" ? "space-y-6" : "space-y-3"}>
          {Object.entries(byCategory).map(([cat, list]) => {
            const filteredList = list.filter((p) =>
              filteredPlatforms.some((fp) => fp.id === p.id)
            );
            if (filteredList.length === 0) return null;

            return (
              <div key={cat} className={viewMode === "grid" ? "mb-4" : ""}>
                <p className="mb-2 font-ui text-[0.6rem] uppercase tracking-[0.26em] text-[var(--ink)]/38 font-medium">
                  {CAT_LABEL[cat] ?? cat} <span className="font-mono text-[var(--ink)]/30">{filteredList.length}</span>
                </p>
                {viewMode === "grid" ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredList.map((p) => (
                      <PlatformCard
                        key={p.id}
                        platform={p}
                        onBlueprint={openBlueprint}
                        onSim={(id) => openModal({ kind: "sim", platformId: id })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredList.map((p) => (
                      <PlatformCard
                        key={p.id}
                        platform={p}
                        onBlueprint={openBlueprint}
                        onSim={(id) => openModal({ kind: "sim", platformId: id })}
                        compact
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TechMedix Sandbox launcher */}
      <div className="mt-3 rounded-[20px] border border-ember/[0.18] bg-gradient-to-br from-ember/[0.06] to-transparent p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="kicker">TechMedix Sandbox</p>
            <h3 className="mt-1 font-header text-xl leading-tight text-[var(--ink)]">
              Launch the Integrated Sim Environment
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink)]/55">
              A self-contained, CAD-style environment that bundles every monitored
              platform. Orbit the model, dissect by component, inject faults, or
              walk a guided teardown — all without real hardware.
              Certification-aligned.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                "Orbit · Zoom",
                "Exploded View",
                "Wireframe",
                "Fault Injection",
                "Guided Teardown",
              ].map((cap) => (
                <span
                  key={cap}
                  className="rounded-full border border-[var(--ink)]/[0.10] px-2.5 py-0.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/55"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => openModal({ kind: "sim", platformId: "unitree-g1" })}
            className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:opacity-90"
          >
            <Play size={12} /> Launch Sim Lab
          </button>
        </div>
      </div>

      {/* Refresh button when using static fallback */}
      {source === "static" && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/[0.15] px-4 py-2 font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/50 transition hover:border-[var(--ink)]/30 hover:text-[var(--ink)] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Retry Supabase Connection
          </button>
        </div>
      )}

      {/* Error Toast */}
      {error && source === "static" && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/[0.05] p-3 text-sm text-amber-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>Using static fallback data. {error}</span>
          </div>
        </div>
      )}

      {/* Modal (portal to document.body) */}
      {mounted && modal && createPortal(
        <div
          className={`t-modal-backdrop fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm ${closing ? "is-closing" : "is-open"}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className={`t-modal relative h-full max-h-[92vh] w-full max-w-[1400px] overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0b0b10] ${closing ? "is-closing" : "is-open"}`}>
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-3 top-3 z-[210] rounded-full border border-white/[0.12] bg-black/50 p-2 text-white/70 backdrop-blur transition hover:bg-black/70 hover:text-white"
              aria-label="Close"
            >
              <X size={14} />
            </button>
            <div className="h-full">
              {modal.kind === "explorer" || modal.kind === "blueprint" ? (
                <BlueprintExplorer
                  platformId={modal.platformId}
                  onClose={closeModal}
                />
              ) : (
                <SimLab initialPlatformId={modal.platformId} />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}