export default function KnowledgeLoading() {
  return (
    <div className="space-y-14 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-full bg-[var(--ink)]/[0.06]" />
        <div className="h-10 w-72 rounded-2xl bg-[var(--ink)]/[0.06]" />
        <div className="h-4 w-[480px] max-w-full rounded-full bg-[var(--ink)]/[0.04]" />
        <div className="mt-5 flex flex-wrap gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="panel h-16 w-32 rounded-[20px]" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="panel-elevated h-72 rounded-[28px]" />
        ))}
      </div>
    </div>
  );
}
