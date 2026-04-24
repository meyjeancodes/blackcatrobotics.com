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
      <nav className="flex items-center gap-2 overflow-x-auto scrollbar-none font-ui text-[0.62rem] uppercase tracking-widest text-theme-25">
        <Link href="/knowledge" className="shrink-0 hover:text-theme-55 transition-colors">
          Learning
        </Link>
        <span className="shrink-0">/</span>
        <span className="shrink-0 text-theme-50">{module.title}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="font-header text-2xl text-theme-primary mb-2">{module.title}</h1>
        {module.description && (
          <p className="text-theme-50 text-sm leading-relaxed">{module.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4 overflow-x-auto scrollbar-none text-theme-35 font-ui text-[0.62rem] uppercase tracking-widest">
          <span className="shrink-0">{lessons.length} lessons</span>
          <span className="shrink-0">·</span>
          <span className="shrink-0">{totalMinutes} min total</span>
        </div>
      </div>

      {/* Progress */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-ui text-[0.62rem] uppercase tracking-widest text-theme-35">
            Module Progress
          </span>
          <span className="font-ui text-[0.62rem] text-theme-45">
            {completed} / {lessons.length} complete
          </span>
        </div>
        <ProgressBar value={pct} showLabel={false} />
      </div>

      {/* Lesson list */}
      <div className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-theme-5">
          <h2 className="font-ui text-[0.62rem] uppercase tracking-widest text-theme-35">
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
