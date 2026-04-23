import { createSupabaseServerClient } from "@/lib/supabase-server";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentBlock = {
  id: string;
  content_type: "text" | "image" | "code" | "video";
  content: Record<string, unknown>;
  order_index: number;
};

export type LessonRow = {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
  estimated_minutes: number;
  status: string;
};

export type LessonWithProgress = LessonRow & {
  progress_status: "not_started" | "in_progress" | "completed";
  completed_at: string | null;
};

export type ModuleWithProgress = {
  id: string;
  title: string;
  description: string | null;
  level_required: number;
  order_index: number;
  status: string;
  total_lessons: number;
  completed_lessons: number;
  progress_status: "locked" | "available" | "in_progress" | "completed";
};

export type LessonDetail = LessonRow & {
  content_blocks: ContentBlock[];
  progress: {
    status: "not_started" | "in_progress" | "completed";
    started_at: string | null;
    completed_at: string | null;
  } | null;
};

export type UserStats = {
  xp: number;
  level: number;
  completed_lessons: number;
  active_module: { id: string; title: string } | null;
};

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getModules(userId: string): Promise<ModuleWithProgress[]> {
  const supabase = await createSupabaseServerClient();

  const [modulesResult, lessonsResult, progressResult, profileResult] =
    await Promise.all([
      supabase
        .from("lms_modules")
        .select("id, title, description, level_required, order_index, status")
        .eq("status", "published")
        .order("order_index"),
      supabase
        .from("lms_lessons")
        .select("id, module_id")
        .eq("status", "published"),
      supabase
        .from("lms_progress")
        .select("module_id, lesson_id, status")
        .eq("user_id", userId),
      supabase
        .from("profiles")
        .select("level")
        .eq("id", userId)
        .maybeSingle(),
    ]);

  const modules = modulesResult.data ?? [];
  const lessons = lessonsResult.data ?? [];
  const progress = progressResult.data ?? [];
  const userLevel = profileResult.data?.level ?? 1;

  return modules.map((mod) => {
    const modLessons = lessons.filter((l) => l.module_id === mod.id);
    const modProgress = progress.filter((p) => p.module_id === mod.id);
    const completedCount = modProgress.filter(
      (p) => p.status === "completed"
    ).length;
    const inProgressCount = modProgress.filter(
      (p) => p.status === "in_progress"
    ).length;

    let progressStatus: ModuleWithProgress["progress_status"] = "available";
    if (mod.level_required > userLevel) {
      progressStatus = "locked";
    } else if (
      completedCount === modLessons.length &&
      modLessons.length > 0
    ) {
      progressStatus = "completed";
    } else if (completedCount > 0 || inProgressCount > 0) {
      progressStatus = "in_progress";
    }

    return {
      ...mod,
      total_lessons: modLessons.length,
      completed_lessons: completedCount,
      progress_status: progressStatus,
    };
  });
}

export async function getModuleLessons(
  moduleId: string,
  userId: string
): Promise<{ module: { id: string; title: string; description: string | null } | null; lessons: LessonWithProgress[] }> {
  const supabase = await createSupabaseServerClient();

  const [moduleResult, lessonsResult, progressResult] = await Promise.all([
    supabase
      .from("lms_modules")
      .select("id, title, description")
      .eq("id", moduleId)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("lms_lessons")
      .select("id, module_id, title, order_index, estimated_minutes, status")
      .eq("module_id", moduleId)
      .eq("status", "published")
      .order("order_index"),
    supabase
      .from("lms_progress")
      .select("lesson_id, status, completed_at")
      .eq("user_id", userId)
      .eq("module_id", moduleId),
  ]);

  const lessons = lessonsResult.data ?? [];
  const progress = progressResult.data ?? [];

  const lessonsWithProgress: LessonWithProgress[] = lessons.map((lesson) => {
    const lessonProgress = progress.find((p) => p.lesson_id === lesson.id);
    return {
      ...lesson,
      progress_status:
        (lessonProgress?.status as LessonWithProgress["progress_status"]) ??
        "not_started",
      completed_at: lessonProgress?.completed_at ?? null,
    };
  });

  return {
    module: moduleResult.data ?? null,
    lessons: lessonsWithProgress,
  };
}

export async function getLesson(
  lessonId: string,
  userId: string
): Promise<LessonDetail | null> {
  const supabase = await createSupabaseServerClient();

  const [lessonResult, contentResult, progressResult] = await Promise.all([
    supabase
      .from("lms_lessons")
      .select("id, module_id, title, order_index, estimated_minutes, status")
      .eq("id", lessonId)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("lms_lesson_content")
      .select("id, content_type, content, order_index")
      .eq("lesson_id", lessonId)
      .order("order_index"),
    supabase
      .from("lms_progress")
      .select("status, started_at, completed_at")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle(),
  ]);

  if (!lessonResult.data) return null;

  return {
    ...lessonResult.data,
    content_blocks: (contentResult.data ?? []) as ContentBlock[],
    progress: progressResult.data
      ? {
          status: progressResult.data.status as LessonDetail["progress"]["status"],
          started_at: progressResult.data.started_at,
          completed_at: progressResult.data.completed_at,
        }
      : null,
  };
}

export async function updateProgress(
  userId: string,
  lessonId: string,
  moduleId: string,
  status: "not_started" | "in_progress" | "completed"
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const now = new Date().toISOString();

  await supabase.from("lms_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      module_id: moduleId,
      status,
      started_at: status !== "not_started" ? now : null,
      completed_at: status === "completed" ? now : null,
    },
    { onConflict: "user_id,lesson_id" }
  );

  // Award XP on completion
  if (status === "completed") {
    await Promise.resolve(supabase.rpc("increment_xp", { uid: userId, amount: 10 })).catch(
      () => undefined // RPC may not exist yet — non-blocking
    );
  }
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = await createSupabaseServerClient();

  const [profileResult, progressResult, modulesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("xp, level")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("lms_progress")
      .select("module_id, status")
      .eq("user_id", userId),
    supabase
      .from("lms_modules")
      .select("id, title")
      .eq("status", "published")
      .order("order_index"),
  ]);

  const progress = progressResult.data ?? [];
  const completedLessons = progress.filter(
    (p) => p.status === "completed"
  ).length;

  // Active module = first module with in_progress lessons, or first incomplete module
  const modules = modulesResult.data ?? [];
  let activeModule: UserStats["active_module"] = null;

  const inProgressModuleId = progress.find(
    (p) => p.status === "in_progress"
  )?.module_id;

  if (inProgressModuleId) {
    const mod = modules.find((m) => m.id === inProgressModuleId);
    if (mod) activeModule = { id: mod.id, title: mod.title };
  } else {
    // First module with no completed lessons
    const completedModuleIds = new Set(
      progress.filter((p) => p.status === "completed").map((p) => p.module_id)
    );
    const incompleteModule = modules.find((m) => !completedModuleIds.has(m.id));
    if (incompleteModule)
      activeModule = { id: incompleteModule.id, title: incompleteModule.title };
  }

  return {
    xp: profileResult.data?.xp ?? 0,
    level: profileResult.data?.level ?? 1,
    completed_lessons: completedLessons,
    active_module: activeModule,
  };
}
