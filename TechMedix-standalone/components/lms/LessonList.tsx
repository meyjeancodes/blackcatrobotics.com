import Link from "next/link";
import type { LessonWithProgress } from "@/lib/techmedix/lms";

function StatusIndicator({
  status,
}: {
  status: LessonWithProgress["progress_status"];
}) {
  if (status === "completed") {
    return (
      <div className="w-5 h-5 rounded-full border border-moss bg-moss/20 flex items-center justify-center shrink-0">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="#1db87a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="w-5 h-5 rounded-full border border-ember bg-ember/10 flex items-center justify-center shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-ember" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border border-theme-10 bg-theme-2 shrink-0" />
  );
}

export function LessonList({
  lessons,
  moduleId,
}: {
  lessons: LessonWithProgress[];
  moduleId: string;
}) {
  if (lessons.length === 0) {
    return (
      <p className="text-theme-30 text-sm py-6 text-center font-ui text-xs uppercase tracking-widest">
        No lessons in this module
      </p>
    );
  }

  return (
    <ol className="space-y-1">
      {lessons.map((lesson, idx) => (
        <li key={lesson.id}>
          <Link
            href={`/knowledge/modules/${moduleId}/${lesson.id}`}
            className="flex items-center gap-4 rounded-xl px-4 py-3.5 border border-transparent hover:border-theme-10 hover:bg-theme-2 transition-all duration-220 group"
          >
            <StatusIndicator status={lesson.progress_status} />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-ui text-[0.6rem] text-theme-25 tabular-nums w-4 shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span
                  className={[
                    "text-sm font-medium leading-tight truncate transition-colors",
                    lesson.progress_status === "completed"
                      ? "text-theme-60 group-hover:text-theme-80"
                      : "text-theme-80 group-hover:text-theme-primary",
                  ].join(" ")}
                >
                  {lesson.title}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <span className="font-ui text-[0.6rem] text-theme-25 uppercase tracking-widest">
                {lesson.estimated_minutes}m
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-theme-20 group-hover:text-theme-50 transition-colors"
              >
                <path
                  d="M5 3L9 7L5 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
