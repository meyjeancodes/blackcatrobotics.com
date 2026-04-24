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
          ? "border-theme-5 bg-theme-2 opacity-50 cursor-not-allowed"
          : isComplete
          ? "border-moss/30 bg-moss/[0.04] hover:border-moss/50 hover:bg-moss/[0.07]"
          : "border-theme-10 bg-theme-2 hover:border-theme-15 hover:bg-theme-4",
      ].join(" ")}
    >
      {/* Level badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-ui text-[0.58rem] uppercase tracking-[0.32em] px-2 py-0.5 rounded border border-theme-10 text-theme-35">
          Level {module.level_required}
        </span>
        <span
          className={[
            "font-ui text-[0.58rem] uppercase tracking-widest",
            isLocked
              ? "text-theme-20"
              : isComplete
              ? "text-moss"
              : module.progress_status === "in_progress"
              ? "text-ember"
              : "text-theme-30",
          ].join(" ")}
        >
          {statusLabel[module.progress_status]}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-header text-lg leading-tight text-theme-primary mb-1 group-hover:text-theme-primary transition-colors">
        {module.title}
      </h3>
      {module.description && (
        <p className="text-theme-40 text-xs leading-relaxed line-clamp-2 mb-4">
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
          <div className="font-ui text-xs text-theme-20 uppercase tracking-widest">
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
