import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { getModuleLessons } from "@/lib/techmedix/lms";
import { LessonList } from "@/components/lms/LessonList";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase?.auth.getUser() ?? { data: { user: null } };

  const { module: mod, lessons } = await getModuleLessons(
    moduleId,
    user?.id ?? "00000000-0000-0000-0000-000000000000"
  );

  if (!mod) notFound();

  const completed = lessons.filter((l) => l.progress_status === "completed").length;
  const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;
  const totalMinutes = lessons.reduce((sum, l) => sum + (l.estimated_minutes ?? 0), 0);

  return (
    <div className="space-y-8">
      {/* ── Back link ──────────────────────────────────────────────────────── */}
      <Link
        href="/knowledge/modules"
        className="inline-flex items-center gap-2 font-ui text-[0.62rem] uppercase tracking-[0.18em] text-theme-42 transition hover:text-theme-primary"
      >
        <ArrowLeft size={12} /> All modules
      </Link>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <p className="kicker">Module</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          {mod.title}
        </h1>
        {mod.description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">{mod.description}</p>
        )}
      </div>

      {/* ── Progress summary ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <p className="font-ui text-[0.58rem] uppercase tracking-[0.28em] text-theme-35">Lessons</p>
          <p className="mt-1 font-header text-3xl leading-none text-theme-primary">
            {completed}<span className="text-theme-25 text-lg"> / {lessons.length}</span>
          </p>
        </div>
        <div className="panel p-5">
          <p className="font-ui text-[0.58rem] uppercase tracking-[0.28em] text-theme-35">Progress</p>
          <p className="mt-1 font-header text-3xl leading-none text-ember">{pct}%</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-theme-5">
            <div className="h-full rounded-full bg-ember" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="panel p-5">
          <p className="font-ui text-[0.58rem] uppercase tracking-[0.28em] text-theme-35">Est. time</p>
          <p className="mt-1 font-header text-3xl leading-none text-theme-primary">
            {totalMinutes}<span className="text-theme-25 text-lg"> min</span>
          </p>
        </div>
      </div>

      {/* ── Lesson list ────────────────────────────────────────────────────── */}
      <section className="panel p-6">
        <div className="mb-6 flex items-center gap-3 border-b border-theme-5 pb-5">
          <div className="rounded-lg bg-theme-4 p-2 text-ember">
            <GraduationCap size={16} />
          </div>
          <div>
            <p className="kicker">Curriculum</p>
            <h2 className="mt-1 font-header text-xl leading-tight text-theme-primary">
              Lessons in this module
            </h2>
          </div>
        </div>
        <LessonList lessons={lessons} moduleId={mod.id} />
      </section>
    </div>
  );
}
