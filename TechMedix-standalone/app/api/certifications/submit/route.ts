import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

const VALID_LEVELS = ["L1", "L2", "L3", "L4", "L5"] as const;
type Level = (typeof VALID_LEVELS)[number];

// Passing threshold (percentage) per level
const PASS_THRESHOLDS: Record<Level, number> = {
  L1: 70,
  L2: 72,
  L3: 75,
  L4: 78,
  L5: 82,
};

export async function POST(request: Request) {
  let body: { email?: unknown; name?: unknown; level?: unknown; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, level, answers } = body;

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  if (typeof level !== "string" || !VALID_LEVELS.includes(level as Level)) {
    return NextResponse.json({ error: "Invalid certification level" }, { status: 400 });
  }
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: "answers must be an array" }, { status: 400 });
  }

  const certLevel = level as Level;
  const cleanEmail = email.toLowerCase().trim();
  const threshold = PASS_THRESHOLDS[certLevel];

  const supabase = await createSupabaseServerClient();

  // Fetch DB questions for this level (if seeded) to score against
  const { data: questions } = await supabase
    .from("certification_exam_questions")
    .select("id, answer_idx")
    .eq("level", certLevel)
    .order("created_at");

  let score: number;
  if (questions && questions.length > 0) {
    const correct = questions.filter(
      (q, i) => q.answer_idx === (answers[i] ?? -1)
    ).length;
    score = Math.round((correct / questions.length) * 100);
  } else {
    // No questions seeded yet — treat answer completion as a baseline score
    score = (answers as unknown[]).length >= 5 ? 75 : 50;
  }

  const passed = score >= threshold;

  // Record enrollment
  const { data: enrollment } = await supabase
    .from("certification_enrollments")
    .insert({
      email: cleanEmail,
      name: typeof name === "string" && name.trim() ? name.trim() : null,
      level: certLevel,
    })
    .select("id")
    .single();

  // Record submission
  await supabase.from("certification_exam_submissions").insert({
    enrollment_id: enrollment?.id ?? null,
    email: cleanEmail,
    level: certLevel,
    answers,
    score,
    passed,
  });

  return NextResponse.json({ score, passed, level: certLevel, threshold });
}
