import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLesson, getModuleLessons } from "@/lib/techmedix/lms";
import { LessonViewer } from "@/components/lms/LessonViewer";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>;
}) {
  const { moduleId, lessonId } = await params;

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

  const [lesson, { module, lessons }] = await Promise.all([
    getLesson(lessonId, userId),
    getModuleLessons(moduleId, userId),
  ]);

  if (!lesson || !module) notFound();

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-ui text-[0.62rem] uppercase tracking-widest text-white/25 flex-wrap">
        <Link href="/knowledge" className="hover:text-white/50 transition-colors">
          Learning
        </Link>
        <span>/</span>
        <Link
          href={`/knowledge/modules/${moduleId}`}
          className="hover:text-white/50 transition-colors"
        >
          {module.title}
        </Link>
        <span>/</span>
        <span className="text-white/50">{lesson.title}</span>
      </nav>

      {/* Header */}
      <div className="pb-6 border-b border-white/[0.07]">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-ui text-[0.58rem] uppercase tracking-widest text-white/25 tabular-nums">
            {String(currentIndex + 1).padStart(2, "0")} / {String(lessons.length).padStart(2, "0")}
          </span>
          <span className="w-px h-3 bg-white/[0.08]" />
          <span className="font-ui text-[0.58rem] uppercase tracking-widest text-white/25">
            {lesson.estimated_minutes} min
          </span>
        </div>
        <h1 className="font-header text-2xl text-white">{lesson.title}</h1>
      </div>

      {/* Content */}
      {lesson.content_blocks.length === 0 ? (
        <p className="text-white/30 text-sm py-8 text-center font-ui text-xs uppercase tracking-widest">
          Content coming soon
        </p>
      ) : (
        <LessonViewer lesson={lesson} userId={userId} />
      )}

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
        {prevLesson ? (
          <Link
            href={`/knowledge/modules/${moduleId}/${prevLesson.id}`}
            className="flex items-center gap-2 font-ui text-[0.62rem] uppercase tracking-widest text-white/35 hover:text-white/70 transition-colors group"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {prevLesson.title}
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/knowledge/modules/${moduleId}/${nextLesson.id}`}
            className="flex items-center gap-2 font-ui text-[0.62rem] uppercase tracking-widest text-white/35 hover:text-white/70 transition-colors group text-right"
          >
            {nextLesson.title}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:translate-x-0.5 transition-transform">
              <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : (
          <Link
            href={`/knowledge/modules/${moduleId}`}
            className="font-ui text-[0.62rem] uppercase tracking-widest text-white/35 hover:text-white/70 transition-colors"
          >
            Back to module
          </Link>
        )}
      </div>
    </div>
  );
}
