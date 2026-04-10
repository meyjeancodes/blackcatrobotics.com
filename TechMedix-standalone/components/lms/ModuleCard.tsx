import Link from "next/link";
import { ProgressBar } from "./ProgressBar";
import type { ModuleWithProgress } from "@/lib/techmedix/lms";

const statusLabel: Record<ModuleWithProgress["progress_status"], string> = {
  locked: "Locked",
  available: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

export function ModuleCard({ module }: { module: ModuleWithProgress }) {
  const isLocked = module.progress_status === "locked";
  const isComplete = module.progress_status === "completed";
  const pct =
    module.total_lessons > 0
      ? Math.round((module.completed_lessons / module.total_lessons) * 100)
      : 0;

  const card = (
    <div
      className={[
        "group relative rounded-2xl border p-5 transition-all duration-220",
        isLocked
          ? "border-white/[0.05] bg-white/[0.015] opacity-50 cursor-not-allowed"
          : isComplete
          ? "border-[#1db87a]/30 bg-[#1db87a]/[0.04] hover:border-[#1db87a]/50 hover:bg-[#1db87a]/[0.07]"
          : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.04]",
      ].join(" ")}
    >
      {/* Level badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-ui text-[0.58rem] uppercase tracking-[0.32em] px-2 py-0.5 rounded border border-white/10 text-white/35">
          Level {module.level_required}
        </span>
        <span
          className={[
            "font-ui text-[0.58rem] uppercase tracking-widest",
            isLocked
              ? "text-white/20"
              : isComplete
              ? "text-[#1db87a]"
              : module.progress_status === "in_progress"
              ? "text-ember"
              : "text-white/30",
          ].join(" ")}
        >
          {statusLabel[module.progress_status]}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-header text-lg leading-tight text-white mb-1 group-hover:text-white transition-colors">
        {module.title}
      </h3>
      {module.description && (
        <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-4">
          {module.description}
        </p>
      )}

      {/* Progress */}
      <div className="mt-auto">
        <ProgressBar
          value={pct}
          total={module.completed_lessons}
          max={module.total_lessons}
          showLabel
          size="sm"
        />
      </div>

      {/* Lock overlay icon */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
          <div className="font-ui text-xs text-white/20 uppercase tracking-widest">
            Requires Level {module.level_required}
          </div>
        </div>
      )}
    </div>
  );

  if (isLocked) return card;

  return (
    <Link href={`/knowledge/modules/${module.id}`} className="block">
      {card}
    </Link>
  );
}
