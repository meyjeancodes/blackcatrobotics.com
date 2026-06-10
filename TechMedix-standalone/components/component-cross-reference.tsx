"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search, Tag, Zap, Cpu, Battery, Radio, Settings, HardDrive, Wrench, Globe, Crosshair, AlertTriangle } from "lucide-react";
import { getAllPlatforms } from "@/lib/platforms/index";
import type { PlatformProfile } from "@/lib/platforms/index";

const COMPONENT_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  actuator: <Zap size={14} />,
  sensor: <Radio size={14} />,
  compute: <Cpu size={14} />,
  battery: <Battery size={14} />,
  frame: <HardDrive size={14} />,
  drivetrain: <Settings size={14} />,
  cooling: <Globe size={14} />,
  comms: <Crosshair size={14} />,
};

const COMPONENT_CATEGORY_COLORS: Record<string, string> = {
  actuator: "text-orange-400 bg-orange-500/[0.10]",
  sensor: "text-sky-400 bg-sky-500/[0.10]",
  compute: "text-violet-400 bg-violet-500/[0.10]",
  battery: "text-emerald-400 bg-emerald-500/[0.10]",
  frame: "text-slate-400 bg-slate-500/[0.10]",
  drivetrain: "text-amber-400 bg-amber-500/[0.10]",
  cooling: "text-cyan-400 bg-cyan-500/[0.10]",
  comms: "text-blue-400 bg-blue-500/[0.10]",
};

interface ComponentReference {
  id: string;
  name: string;
  category: string;
  platforms: string[];
  platformCount: number;
  failureSignatures: { id: string; name: string; severity: string }[];
  sharedFailureCount: number;
}

export function ComponentCrossReference() {
  const allPlatforms = useMemo(() => getAllPlatforms().filter((p) => p.category !== "datacenter"), []);
  
  // Build component reference map
  const componentMap = useMemo(() => {
    const map = new Map<string, ComponentReference>();
    
    allPlatforms.forEach((platform) => {
      // Extract component types from specs
      const specs = platform.specs.map(s => s.label.toLowerCase());
      const category = platform.category;
      
      // Determine components based on platform type and specs
      const components: { id: string; name: string; category: string }[] = [];
      
      // Actuators
      if (specs.some(s => s.includes("dof") || s.includes("actuator") || s.includes("motor"))) {
        components.push({ id: "actuators", name: "Actuators (BLDC + Harmonic Reducer)", category: "actuator" });
      }
      if (specs.some(s => s.includes("humanoid") || category === "humanoid")) {
        components.push({ id: "hip-actuators", name: "Hip Actuators", category: "actuator" });
        components.push({ id: "knee-actuators", name: "Knee Actuators", category: "actuator" });
        components.push({ id: "ankle-actuators", name: "Ankle Actuators", category: "actuator" });
        components.push({ id: "shoulder-actuators", name: "Shoulder Actuators", category: "actuator" });
        components.push({ id: "elbow-actuators", name: "Elbow Actuators", category: "actuator" });
        components.push({ id: "wrist-ft", name: "Wrist F/T Sensors", category: "sensor" });
      }
      if (category === "industrial" || specs.some(s => s.includes("leg") || s.includes("quadruped"))) {
        components.push({ id: "hip-actuators", name: "Hip Actuators", category: "actuator" });
        components.push({ id: "knee-actuators", name: "Knee Actuators", category: "actuator" });
        components.push({ id: "ankle-actuators", name: "Ankle Actuators", category: "actuator" });
      }
      
      // Compute
      if (specs.some(s => s.includes("compute") || s.includes("jetson") || s.includes("gpu") || s.includes("ai"))) {
        components.push({ id: "on-robot-compute", name: "On-Robot Compute (Jetson/Thor)", category: "compute" });
      }
      
      // Sensors
      if (specs.some(s => s.includes("camera") || s.includes("lidar") || s.includes("depth"))) {
        components.push({ id: "camera-suite", name: "Camera Suite (Stereo/Depth)", category: "sensor" });
      }
      if (specs.some(s => s.includes("imu"))) {
        components.push({ id: "imu", name: "IMU Cluster", category: "sensor" });
      }
      
      // Battery
      if (specs.some(s => s.includes("battery") || s.includes("kwh") || s.includes("wh"))) {
        components.push({ id: "battery-pack", name: "Battery Pack + BMS", category: "battery" });
      }
      
      // Frame
      components.push({ id: "torso-frame", name: "Structural Frame/Spine", category: "frame" });
      
      // Deduplicate
      const uniqueComponents = components.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
      
      // Add to map
      uniqueComponents.forEach((comp) => {
        if (!map.has(comp.id)) {
          map.set(comp.id, {
            id: comp.id,
            name: comp.name,
            category: comp.category,
            platforms: [],
            platformCount: 0,
            failureSignatures: [],
            sharedFailureCount: 0,
          });
        }
        const ref = map.get(comp.id)!;
        ref.platforms.push(platform.id);
        ref.platformCount = ref.platforms.length;
        // Collect failure signatures related to this component
        platform.failureSignatures.forEach((fs) => {
          if (fs.name.toLowerCase().includes(comp.id.toLowerCase()) || 
              fs.name.toLowerCase().includes(comp.name.toLowerCase())) {
            ref.failureSignatures.push(fs);
          }
        });
        ref.sharedFailureCount = ref.failureSignatures.length;
      });
    });
    
    return Array.from(map.values()).sort((a, b) => b.platformCount - a.platformCount);
  }, [allPlatforms]);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const cats = new Set<string>();
    componentMap.forEach(c => cats.add(c.category));
    return Array.from(cats).sort();
  }, [componentMap]);

  const filteredComponents = useMemo(() => {
    return componentMap.filter((comp) => {
      const matchesQuery = !query || 
        comp.name.toLowerCase().includes(query.toLowerCase()) ||
        comp.platforms.some(p => p.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = !selectedCategory || comp.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [componentMap, query, selectedCategory]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-header text-2xl leading-tight text-[var(--ink)]">Component Cross-Reference</h2>
        <p className="mt-1 text-sm text-[var(--ink)]/50 max-w-2xl">
          Find shared components across platforms — identify common failure signatures, interchangeable parts, and supply bottlenecks.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink)]/30" size={16} />
          <input
            type="text"
            placeholder="Search components, platforms, failure modes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-[12px] border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] pl-10 pr-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink)]/35 focus:outline-none focus:border-[var(--ink)]/25"
          />
        </div>
        <select
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="rounded-[12px] border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-4 py-2.5 font-ui text-[0.55rem] uppercase tracking-[0.1em] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]/25 min-w-[160px]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)} ({componentMap.filter(c => c.category === cat).length})
            </option>
          ))}
        </select>
      </div>

      {/* Component List */}
      <div className="space-y-3">
        {filteredComponents.map((comp) => {
          const isExpanded = expandedIds.has(comp.id);
          const colorClass = COMPONENT_CATEGORY_COLORS[comp.category] || "text-white/50 bg-white/[0.05]";
          const Icon = COMPONENT_CATEGORY_ICONS[comp.category] || <Tag size={14} />;
          
          // Get unique failure signatures
          const uniqueFailures = comp.failureSignatures.filter(
            (fs, i, arr) => arr.findIndex(f => f.id === fs.id) === i
          ).slice(0, 5) as PlatformProfile["failureSignatures"];

          return (
            <div
              key={comp.id}
              className="panel-elevated border border-[var(--ink)]/[0.06] overflow-hidden"
            >
              {/* Summary Row - always visible */}
              <button
                type="button"
                onClick={() => toggleExpanded(comp.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-[var(--ink)]/[0.02] transition"
              >
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                  {Icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-header text-base leading-tight text-[var(--ink)] truncate">{comp.name}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.46rem] uppercase tracking-[0.1em] font-semibold ${colorClass}`}>
                      {comp.category}
                    </span>
                    <span className="font-mono text-[0.55rem] text-[var(--ink)]/40">· {comp.platformCount} platforms</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--ink)]/45 truncate">
                    Platforms: {comp.platforms.slice(0, 5).join(", ")}{comp.platforms.length > 5 ? ` +${comp.platforms.length - 5}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {uniqueFailures.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/[0.05] px-2 py-0.5 font-ui text-[0.5rem] uppercase tracking-[0.1em] text-amber-600">
                      <AlertTriangle size={9} /> {uniqueFailures.length} shared failures
                    </span>
                  )}
                  <ChevronRight size={16} className={`text-[var(--ink)]/30 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-[var(--ink)]/[0.05] bg-[var(--ink)]/[0.02] p-4 animate-in slide-in-from-top-2">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Platforms */}
                    <div>
                      <p className="font-ui text-[0.55rem] uppercase tracking-[0.12em] text-[var(--ink)]/40 mb-2">
                        Platforms Using This Component ({comp.platformCount})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {comp.platforms.map((pid) => {
                          const platform = allPlatforms.find(p => p.id === pid);
                          return (
                            <span
                              key={pid}
                              className="inline-flex items-center gap-1 rounded-full border border-[var(--ink)]/[0.10] bg-[var(--ink)]/[0.03] px-2.5 py-1 font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)]/55"
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "" }} />
                              {platform?.name ?? pid}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shared Failure Signatures */}
                    <div>
                      <p className="font-ui text-[0.55rem] uppercase tracking-[0.12em] text-[var(--ink)]/40 mb-2">
                        Shared Failure Signatures ({uniqueFailures.length})
                      </p>
                      {uniqueFailures.length > 0 ? (
                        <div className="space-y-2">
                          {uniqueFailures.map((fs) => {
                            const severityColor = fs.severity === "critical" ? "text-red-600 border-red-500/20 bg-red-500/[0.05]" : 
                                                  fs.severity === "warning" ? "text-amber-600 border-amber-500/20 bg-amber-500/[0.05]" :
                                                  "text-sky-600 border-sky-500/20 bg-sky-500/[0.05]";
                            return (
                              <div key={fs.id} className={`rounded-lg border p-3 ${severityColor}`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="font-mono text-[0.5rem] uppercase tracking-[0.1em] font-semibold">
                                        {fs.severity === "critical" ? "●" : "○"} {fs.severity.toUpperCase()}
                                      </span>
                                      <p className="font-mono text-[0.62rem] text-[var(--ink)]/80 truncate">{fs.name}</p>
                                    </div>
                                    <p className="text-[0.55rem] leading-relaxed text-[var(--ink)]/50 truncate">{fs.description}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--ink)]/40">No shared failure signatures tracked yet</p>
                      )}
                    </div>
                  </div>

                  {/* BOM / Interchangeability Note */}
                  <div className="mt-4 rounded-lg border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] p-3">
                    <p className="font-ui text-[0.5rem] uppercase tracking-[0.1em] text-[var(--ink)]/40 mb-2 flex items-center gap-1.5">
                      <Tag size={10} /> Interchangeability & BOM
                    </p>
                    <p className="text-sm text-[var(--ink)]/55">
                      {comp.platformCount > 1 
                        ? `This component is shared across ${comp.platformCount} platforms. Check manufacturer part numbers for direct interchangeability. Harmonic Drive reducers (36% of actuator cost) are the primary bottleneck — Harmonic Drive holds 20-25% global market share.`
                        : "Component currently unique to one platform. Monitor for future cross-platform adoption."
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-12 text-[var(--ink)]/40">
          <Tag size={48} className="mx-auto mb-4 text-[var(--ink)]/20" />
          <p className="font-header text-lg">No components match your filters</p>
          <p className="text-sm mt-1">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  );
}