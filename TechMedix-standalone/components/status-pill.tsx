import clsx from "clsx";

const toneMap: Record<string, string> = {
  online: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  service: "bg-rose-100 text-rose-800",
  offline: "bg-zinc-200 text-zinc-700",
  active: "bg-emerald-100 text-emerald-800",
  resolved: "bg-zinc-200 text-zinc-700",
  critical: "bg-rose-100 text-rose-800",
  info: "bg-sky-100 text-sky-800",
  assigned: "bg-amber-100 text-amber-800",
  open: "bg-zinc-200 text-zinc-700",
  // maintenance statuses
  in_progress: "bg-blue-100 text-blue-800",
  deferred: "bg-zinc-200 text-zinc-700",
  maintenance: "bg-rose-100 text-rose-800",
  idle: "bg-sky-100 text-sky-800",
  // priority
  high: "bg-amber-100 text-amber-800",
  medium: "bg-sky-100 text-sky-800",
  low: "bg-zinc-200 text-zinc-700",
  // work order statuses
  pending: "bg-zinc-200 text-zinc-700",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-zinc-200 text-zinc-700",
  // roles
  admin: "bg-violet-100 text-violet-800",
  technician: "bg-blue-100 text-blue-800",
  viewer: "bg-zinc-200 text-zinc-700",
  // availability
  available: "bg-emerald-100 text-emerald-800",
  busy: "bg-amber-100 text-amber-800",
};

export function StatusPill({ label }: { label: string }) {
  const key = label.toLowerCase();

  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 font-ui text-[11px] font-semibold uppercase tracking-[0.16em]",
        toneMap[key] ?? "bg-theme-5 text-theme-70"
      )}
    >
      {label}
    </span>
  );
}
