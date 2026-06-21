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
import { RobotModelViewer } from "./robot-model-viewer";
import { BlueprintExplorer } from "./blueprint-explorer";
import { SimLab } from "./sim-lab";
import { StaggerContainer } from "./animated-stat";
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
  datacenter: "Data Center",
};

const CAT_COLOR: Record<string, string> = {
  humanoid: "bg-violet-500/[0.10] text-violet-700 border-violet-500/20",
  drone: "bg-sky-500/[0.10] text-sky-700 border-sky-500/20",
  industrial: "bg-amber-500/[0.10] text-amber-700 border-amber-500/20",
  delivery: "bg-emerald-500/[0.10] text-emerald-700 border-emerald-500/20",
  micromobility: "bg-rose-500/[0.10] text-rose-700 border-rose-500/20",
  datacenter: "bg-slate-500/[0.10] text-slate-700 border-slate-500/20",
};

const SEV_COLOR: Record<string, string> = {
  critical: "text-red-600 bg-red-500/[0.10] border-red-500/20",
  warning: "text-amber-600 bg-amber-500/[0.10] border-amber-500/20",
  info: "text-sky-600 bg-sky-500/[0.10] border-sky-500/20",
};

const SEV_LABEL: Record<string, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

const SEV_ICON: Record<string, React.ReactNode> = {
  critical: <AlertCircle size={10} className="shrink-0" />,
  warning: <AlertTriangle size={10} className="shrink-0" />,
  info: <Info size={10} className="shrink-0" />,
};

// Health score color based on value
function getHealthColor(score: number): string {
  if (score >= 90) return "text-emerald-600 bg-emerald-500/[0.10]";
  if (score >= 75) return "text-amber-600 bg-amber-500/[0.10]";
  if (score >= 60) return "text-orange-600 bg-orange-500/[0.10]";
  return "text-red-600 bg-red-500/[0.10]";
}

// Component category icons
const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  actuator: <Zap size={12} />,
  sensor: <Radio size={12} />,
  compute: <Cpu size={12} />,
  battery: <Battery size={12} />,
  frame: <HardDrive size={12} />,
  drivetrain: <Settings size={12} />,
  cooling: <Thermometer size={12} />,
  comms: <Wifi size={12} />,
  "end-effector": <GitBranch size={12} />,
  safety: <Shield size={12} />,
};

// VIAM-style service icons
const SERVICE_ICONS: Record<string, React.ReactNode> = {
  navigation: <Globe size={12} />,
  vision: <Camera size={12} />,
  manipulation: <GitBranch size={12} />,
  perception: <Radio size={12} />,
  control: <Cpu size={12} />,
  telemetry: <Database size={12} />,
  voice: <Mic size={12} />,
};

export function KnowledgeHubClient({ initialPlatforms = [] }: Props) {
  const { platforms: supabasePlatforms, loading, error, source, refetch } = usePlatforms();
  const [modal, setModal] = useState<Modal>(null);
  const [closing, setClosing] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Combine initial (SSR) + supabase platforms, deduplicate by id
  const allPlatforms = useMemo(() => {
    const map = new Map<string, PlatformProfile>();
    initialPlatforms.forEach((p) => map.set(p.id, p));
    supabasePlatforms.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [initialPlatforms, supabasePlatforms]);

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

  // Calculate average health score per platform
  const getAvgHealth = (platform: PlatformProfile) => {
    const { healthScoreMin, healthScoreMax } = platform.tlmRanges;
    return Math.round((healthScoreMin + healthScoreMax) / 2);
  };

  // Get component breakdown for platform
  const getComponents = (platform: PlatformProfile) => {
    const dofSpec = platform.specs.find((s) => s.label.toLowerCase().includes("dof"));
    const dofCount = dofSpec ? parseInt(dofSpec.value) || 0 : 0;
    const hasCamera = platform.specs.some(
      (s) =>
        s.label.toLowerCase().includes("camera") ||
        s.label.toLowerCase().includes("lidar")
    );
    const components = [
      { category: "actuator", name: "Actuators", count: Math.max(dofCount, 1) },
      { category: "compute", name: "Compute", count: 1 },
      { category: "sensor", name: "Sensors", count: hasCamera ? 2 : 1 },
      { category: "battery", name: "Battery", count: 1 },
    ];
    return components.filter((c) => c.count > 0);
  };

  // Get VIAM-style services for platform
  const getServices = (platform: PlatformProfile) => {
    const services = [];
    if (platform.category === "humanoid" || platform.category === "industrial") {
      services.push("navigation", "vision", "manipulation", "perception", "control");
    } else if (platform.category === "drone") {
      services.push("navigation", "vision", "perception", "control");
    } else if (platform.category === "delivery") {
      services.push("navigation", "vision", "perception", "control");
    } else if (platform.category === "micromobility") {
      services.push("navigation", "perception", "control", "telemetry");
    }
    return services;
  };

  const renderFailureSignature = (sig: PlatformProfile["failureSignatures"][0]) => (
    <div
      key={sig.id}
      className={`flex items-start gap-2 rounded-lg px-3 py-2 transition hover:bg-[var(--ink)]/[0.03] ${SEV_COLOR[sig.severity]}`}
      title={`${SEV_LABEL[sig.severity]} • ${sig.description}`}
    >
      {SEV_ICON[sig.severity]}
      <div className="min-w-0 flex-1">
        <p className="text-[0.62rem] font-semibold text-[var(--ink)]/85 leading-snug">{sig.name}</p>
        <p className="text-[0.56rem] text-[var(--ink)]/50 leading-snug truncate">{sig.description}</p>
      </div>
    </div>
  );

  const renderPlatformCard = (platform: PlatformProfile) => {
    const avgHealth = getAvgHealth(platform);
    const healthColor = getHealthColor(avgHealth);
    const components = getComponents(platform);
    const services = getServices(platform);
    const criticalCount = platform.failureSignatures.filter((fs) => fs.severity === "critical").length;
    const warningCount = platform.failureSignatures.filter((fs) => fs.severity === "warning").length;

    return (
      <div
        key={platform.id}
        className={`
          cad-card-float panel-elevated flex flex-col gap-3 p-5 transition-all duration-300
          ${viewMode === "list" ? "flex-row items-start" : ""}
          border border-[var(--ink)]/[0.06]
        `}
        style={{
          width: '100%',
          maxWidth: '100%',
          flexShrink: 0,
flexGrow: 1,
          boxShadow: highlightedId === platform.id
            ? "0 0 0 2px rgba(56,189,248,0.35), 0 0 40px rgba(56,189,248,0.12)"
            : "",
          transform: highlightedId === platform.id ? "scale(1.012)" : "scale(1)",
        }}
      >
        {/* Image Preview */}
        <div className={viewMode === "list" ? "w-[160px] h-[120px] shrink-0" : "w-full"}>
          <RobotModelViewer
            platformId={platform.id}
            mode="preview"
            className={viewMode === "list" ? "h-full w-full" : "h-48 w-full cursor-pointer"}
            onClick={() => openBlueprint(platform.id)}
          />
        </div>

        {/* Card Content */}
        <div className={viewMode === "list" ? "flex-1 min-w-0" : "flex-1 flex flex-col"}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] font-semibold border ${CAT_COLOR[platform.category]}`}
                >
                  {CAT_LABEL[platform.category] ?? platform.category}
                </span>
                {platform.badge && (
                  <span className="inline-flex items-center rounded-full bg-amber-400/[0.14] px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] font-semibold text-amber-700 border border-amber-400/30">
                    {platform.badge}
                  </span>
                )}
              </div>
              <h3 className="mt-1.5 font-header text-base leading-tight text-[var(--ink)] truncate">
                {platform.name}
              </h3>
              <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-[var(--ink)]/40">
                {platform.manufacturer}
              </p>
            </div>

            {/* Health Score Badge */}
            <div className="shrink-0 flex flex-col items-end gap-1">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.65rem] font-semibold ${healthColor} border`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{avgHealth}%</span>
              </div>
              <span className="font-ui text-[0.48rem] uppercase tracking-[0.1em] text-[var(--ink)]/35">
                Fleet Health
              </span>
            </div>
          </div>

          {/* VIAM-style: Key Specs Row */}
          <div className="flex flex-wrap gap-2">
            {platform.specs.slice(0, 3).map((s) => (
              <div key={s.label} className="rounded-[10px] bg-[var(--ink)]/[0.025] px-2.5 py-1.5">
                <p className="font-ui text-[0.48rem] uppercase tracking-[0.1em] text-[var(--ink)]/35">
                  {s.label}
                </p>
                <p className="font-mono text-[0.62rem] font-semibold text-[var(--ink)]/75">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* VIAM-style: Component Breakdown */}
          <div className="flex flex-wrap gap-1.5">
            {components.slice(0, 4).map((comp) => (
              <div
                key={comp.category}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--ink)]/[0.03] px-2 py-1 border border-[var(--ink)]/[0.05]"
                title={`${comp.name}: ${comp.count} components`}
              >
                <span className="text-[var(--ink)]/45">{COMPONENT_ICONS[comp.category]}</span>
                <span className="font-ui text-[0.5rem] uppercase tracking-[0.08em] text-[var(--ink)]/60">
                  {comp.name}
                </span>
                <span className="font-mono text-[0.6rem] font-semibold text-[var(--ink)]/75">
                  {comp.count}
                </span>
              </div>
            ))}
          </div>

          {/* VIAM-style: Services */}
          <div className="flex flex-wrap gap-1">
            {services.slice(0, 4).map((svc) => (
              <span
                key={svc}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--ink)]/[0.02] px-2 py-0.5 border border-[var(--ink)]/[0.05]"
                title={svc.charAt(0).toUpperCase() + svc.slice(1)}
              >
                <span className="text-[var(--ink)]/40">{SERVICE_ICONS[svc]}</span>
                <span className="font-ui text-[0.48rem] uppercase tracking-[0.08em] text-[var(--ink)]/50">
                  {svc.slice(0, 3)}
                </span>
              </span>
            ))}
            {services.length > 4 && (
              <span className="inline-flex items-center rounded-full bg-[var(--ink)]/[0.02] px-2 py-0.5 border border-[var(--ink)]/[0.05]">
                <span className="font-ui text-[0.48rem] uppercase tracking-[0.08em] text-[var(--ink)]/40">
                  +{services.length - 4}
                </span>
              </span>
            )}
          </div>

          {/* Failure Signatures Summary */}
          <div className="flex items-center gap-3 pt-2 border-t border-[var(--ink)]/[0.05]">
            {criticalCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/[0.10] px-2 py-0.5 border border-red-500/20" title={`${criticalCount} critical failure signatures`}>
                <AlertCircle size={9} className="text-red-600" />
                <span className="font-ui text-[0.5rem] uppercase tracking-[0.1em] font-semibold text-red-600">
                  {criticalCount} Critical
                </span>
              </span>
            )}
            {warningCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/[0.10] px-2 py-0.5 border border-amber-500/20" title={`${warningCount} warning failure signatures`}>
                <AlertTriangle size={9} className="text-amber-600" />
                <span className="font-ui text-[0.5rem] uppercase tracking-[0.1em] font-semibold text-amber-600">
                  {warningCount} Warning
                </span>
              </span>
            )}
            <span className="font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)]/35 ml-auto">
              {platform.failureSignatures.length} Total Signatures
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-2 pt-2 flex flex-wrap items-center gap-1.5 border-t border-[var(--ink)]/[0.05]">
            {platform.manualUrl && (
              <a
                href={platform.manualUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-[var(--ink)]/[0.10] px-2.5 py-1 font-ui text-[0.5rem] uppercase tracking-[0.1em] font-semibold text-[var(--ink)]/45 transition hover:text-[var(--ink)] hover:border-[var(--ink)]/20"
                title="View official service manual"
              >
                <BookOpen size={10} /> Manual
              </a>
            )}
            <button
              type="button"
              onClick={() => openBlueprint(platform.id)}
              className="flex items-center gap-1 rounded-full border border-sky-500/[0.18] px-2.5 py-1 font-ui text-[0.5rem] uppercase tracking-[0.1em] font-semibold text-sky-600 transition hover:bg-sky-500/[0.06] hover:text-sky-700"
              title="Interactive technical blueprint — part-by-part reveal, explode view"
            >
              <Crosshair size={10} /> Blueprint
            </button>
            <button
              type="button"
              onClick={() => openModal({ kind: "sim", platformId: platform.id })}
              className="flex items-center gap-1 rounded-full border border-[var(--ink)]/[0.14] px-2.5 py-1 font-ui text-[0.5rem] uppercase tracking-[0.1em] font-semibold text-[var(--ink)]/55 transition hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]"
              title="Launch simulation environment with fault injection"
            >
              <Play size={10} /> Sim
            </button>
            <button
              type="button"
              onClick={() => {}}
              className="flex items-center gap-1 rounded-full border border-[var(--ink)]/[0.10] px-2.5 py-1 font-ui text-[0.5rem] uppercase tracking-[0.1em] font-semibold text-[var(--ink)]/40 transition hover:bg-[var(--ink)]/[0.03]"
              title="Export platform data for offline use"
            >
              <Download size={10} /> Offline
            </button>
          </div>
        </div>

        {/* Failure Signatures Expandable Section (List View) */}
        {viewMode === "list" && platform.failureSignatures.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--ink)]/[0.05] w-full">
            <p className="font-ui text-[0.55rem] uppercase tracking-[0.16em] text-[var(--ink)]/35 flex items-center gap-1.5 mb-2">
              <AlertTriangle size={10} /> Known Failure Signatures
            </p>
            <div className="space-y-1.5">
              {platform.failureSignatures.slice(0, 5).map(renderFailureSignature)}
              {platform.failureSignatures.length > 5 && (
                <button
                  type="button"
                  className="w-full text-left text-[0.6rem] text-sky-600 hover:text-sky-700 font-ui uppercase tracking-[0.1em]"
                >
                  +{platform.failureSignatures.length - 5} more signatures
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

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

        {/* Category Section Headers + Grid */}
        <StaggerContainer
          className={viewMode === "grid" ? "space-y-10" : "space-y-3"}
        >
          {Object.entries(byCategory).map(([cat, list]) => {
            const filteredList = list.filter((p) =>
              filteredPlatforms.some((fp) => fp.id === p.id)
            );
            if (filteredList.length === 0) return null;

            return (
              <div key={cat} className={viewMode === "grid" ? "mb-8" : ""}>
                <p className="mb-3 font-ui text-[0.6rem] uppercase tracking-[0.26em] text-[var(--ink)]/38 font-medium">
                  {CAT_LABEL[cat] ?? cat} <span className="font-mono text-[var(--ink)]/30">{filteredList.length}</span>
                </p>
                {viewMode === "grid" ? (
                  <div className="flex flex-col gap-5">
                    {filteredList.map(renderPlatformCard)}
                  </div>
                ) : (
                  filteredList.map(renderPlatformCard)
                )}
              </div>
            );
          })}
        </StaggerContainer>
      </div>

      {/* TechMedix Sandbox launcher */}
      <div className="mt-10 rounded-[20px] border border-ember/[0.18] bg-gradient-to-br from-ember/[0.06] to-transparent p-6">
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