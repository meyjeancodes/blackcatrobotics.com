"use server";

import { revalidatePath } from "next/cache";
import { updateProgress } from "@/lib/techmedix/lms";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function markLessonComplete(
  lessonId: string,
  moduleId: string
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await updateProgress(user.id, lessonId, moduleId, "completed");
  revalidatePath(`/knowledge/modules/${moduleId}/${lessonId}`);
  revalidatePath(`/knowledge/modules/${moduleId}`);
  revalidatePath("/knowledge");
}
