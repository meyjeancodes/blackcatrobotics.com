export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-full bg-[var(--ink)]/[0.06]" />
        <div className="h-10 w-64 rounded-2xl bg-[var(--ink)]/[0.06]" />
        <div className="h-4 w-96 rounded-full bg-[var(--ink)]/[0.04]" />
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel h-32 rounded-[28px]" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel-elevated lg:col-span-2 h-64 rounded-[28px]" />
        <div className="panel-elevated h-64 rounded-[28px]" />
      </div>
      <div className="panel-elevated h-48 rounded-[28px]" />
    </div>
  );
}
