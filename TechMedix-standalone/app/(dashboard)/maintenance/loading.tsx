export default function MaintenanceLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-28 rounded-full bg-[var(--ink)]/[0.06]" />
        <div className="h-10 w-72 rounded-2xl bg-[var(--ink)]/[0.06]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="panel h-24 rounded-[28px]" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="panel-elevated h-20 rounded-[28px]" />
        ))}
      </div>
    </div>
  );
}
