import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getModuleLessons } from "@/lib/techmedix/lms";
import { LessonList } from "@/components/lms/LessonList";
import { ProgressBar } from "@/components/lms/ProgressBar";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;

  const supabase = await createSupabaseServerClient();
  let userId = "";
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? "";
    } catch {
      // Auth offline
    }
  }

  const { module, lessons } = await getModuleLessons(moduleId, userId);
  if (!module) notFound();

  const completed = lessons.filter((l) => l.progress_status === "completed").length;
  const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;
  const totalMinutes = lessons.reduce((sum, l) => sum + l.estimated_minutes, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-ui text-[0.62rem] uppercase tracking-widest text-white/25">
        <Link href="/knowledge" className="hover:text-white/50 transition-colors">
          Learning
        </Link>
        <span>/</span>
        <span className="text-white/50">{module.title}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="font-header text-2xl text-white mb-2">{module.title}</h1>
        {module.description && (
          <p className="text-white/45 text-sm leading-relaxed">{module.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-white/30 font-ui text-[0.62rem] uppercase tracking-widest">
          <span>{lessons.length} lessons</span>
          <span>·</span>
          <span>{totalMinutes} min total</span>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-ui text-[0.62rem] uppercase tracking-widest text-white/30">
            Module Progress
          </span>
          <span className="font-ui text-[0.62rem] text-white/40">
            {completed} / {lessons.length} complete
          </span>
        </div>
        <ProgressBar value={pct} showLabel={false} />
      </div>

      {/* Lesson list */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="font-ui text-[0.62rem] uppercase tracking-widest text-white/35">
            Lessons
          </h2>
        </div>
        <div className="px-1 py-2">
          <LessonList lessons={lessons} moduleId={moduleId} />
        </div>
      </div>
    </div>
  );
}
