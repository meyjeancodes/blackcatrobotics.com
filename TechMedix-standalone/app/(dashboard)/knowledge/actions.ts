"use server";

import { revalidatePath } from "next/cache";
import { updateProgress } from "@/lib/techmedix/lms";

export async function markLessonComplete(
  userId: string,
  lessonId: string,
  moduleId: string
) {
  await updateProgress(userId, lessonId, moduleId, "completed");
  revalidatePath(`/knowledge/modules/${moduleId}/${lessonId}`);
  revalidatePath(`/knowledge/modules/${moduleId}`);
  revalidatePath("/knowledge");
}
