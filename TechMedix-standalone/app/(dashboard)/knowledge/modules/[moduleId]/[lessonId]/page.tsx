import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getLesson } from "@/lib/techmedix/lms";
import { LessonViewer } from "@/components/lms/LessonViewer";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>;
}) {
  const { moduleId, lessonId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase?.auth.getUser() ?? { data: { user: null } };

  const userId = user?.id ?? "00000000-0000-0000-0000-000000000000";
  const lesson = await getLesson(lessonId, userId);

  if (!lesson) notFound();

  return (
    <div className="space-y-8">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 font-ui text-[0.62rem] uppercase tracking-[0.18em] text-theme-42">
        <Link href="/knowledge/modules" className="transition hover:text-theme-primary">Modules</Link>
        <span className="text-theme-20">/</span>
        <Link href={`/knowledge/modules/${moduleId}`} className="transition hover:text-theme-primary">
          <ArrowLeft size={11} className="inline" /> Back to module
        </Link>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="kicker">Lesson {lesson.order_index + 1}</p>
          <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
            {lesson.title}
          </h1>
        </div>
        {lesson.estimated_minutes ? (
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-theme-10 bg-theme-2 px-4 py-2">
            <Clock size={12} className="text-ember" />
            <span className="font-ui text-[0.62rem] uppercase tracking-[0.18em] text-theme-52">
              {lesson.estimated_minutes} min
            </span>
          </div>
        ) : null}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <LessonViewer lesson={lesson} userId={userId} />
    </div>
  );
}
