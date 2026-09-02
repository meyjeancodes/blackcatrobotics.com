"use server";

import { revalidatePath } from "next/cache";
import { updateProgress } from "@/lib/techmedix/lms";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function markLessonComplete(
  lessonId: string,
  moduleId: string
) {
  // Derive userId from authenticated session — NEVER trust client-supplied userId
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase not configured");
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error("Not authenticated");
  }
  await updateProgress(user.id, lessonId, moduleId, "completed");
  revalidatePath(`/knowledge/modules/${moduleId}/${lessonId}`);
  revalidatePath(`/knowledge/modules/${moduleId}`);
  revalidatePath("/knowledge");
}
