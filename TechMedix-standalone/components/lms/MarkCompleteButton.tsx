"use client";

import { useTransition } from "react";
import { markLessonComplete } from "@/app/(dashboard)/knowledge/actions";

export function MarkCompleteButton({
  lessonId,
  moduleId,
  userId,
  isComplete,
}: {
  lessonId: string;
  moduleId: string;
  userId: string;
  isComplete: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (isComplete) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full border border-[#1db87a] bg-[#1db87a]/20 flex items-center justify-center">
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
        <span className="font-ui text-xs uppercase tracking-widest text-[#1db87a]">
          Lesson Complete
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await markLessonComplete(userId, lessonId, moduleId);
        });
      }}
      disabled={isPending}
      className="flex items-center gap-3 px-5 py-2.5 rounded-xl font-ui text-xs uppercase tracking-widest text-white transition-all duration-220 disabled:opacity-50"
      style={{ background: "#e8601e" }}
    >
      {isPending ? "Saving..." : "Mark as Complete"}
    </button>
  );
}
