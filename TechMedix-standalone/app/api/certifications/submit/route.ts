import { NextResponse } from "next/server";

const VALID_LEVELS = ["L1", "L2", "L3", "L4", "L5"] as const;
type Level = (typeof VALID_LEVELS)[number];

const PASS_THRESHOLDS: Record<Level, number> = {
  L1: 70,
  L2: 72,
  L3: 75,
  L4: 78,
  L5: 82,
};

// Local answer key — mirrors the question bank in the exam page client.
// Used as fallback when the DB is unavailable or not yet seeded.
const LOCAL_ANSWERS: Record<Level, number[]> = {
  L1: [0, 2, 1, 1, 2],
  L2: [0, 1, 1, 1, 1],
  L3: [1, 0, 1, 1, 2],
  L4: [1, 1, 1, 1, 1],
  L5: [1, 2, 2, 1, 1],
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

  // ── Score — try DB first, fall back to local answer key ──────────────────────
  let score = 0;
  let scoredFromDb = false;

  try {
    const { createSupabaseServerClient } = await import("../../../../lib/supabase-server");
    const supabase = await createSupabaseServerClient();

    const { data: questions } = await supabase
      .from("certification_exam_questions")
      .select("id, answer_idx")
      .eq("level", certLevel)
      .order("created_at");

    if (questions && questions.length > 0) {
      const correct = questions.filter(
        (q, i) => q.answer_idx === (answers[i] ?? -1)
      ).length;
      score = Math.round((correct / questions.length) * 100);
      scoredFromDb = true;
    }
  } catch {
    // DB unavailable — fall through to local scoring
  }

  if (!scoredFromDb) {
    // Score against local answer key
    const key = LOCAL_ANSWERS[certLevel];
    const correct = key.filter((ans, i) => ans === (answers[i] ?? -1)).length;
    score = Math.round((correct / key.length) * 100);
  }

  const passed = score >= threshold;

  // ── Record to DB — best-effort, never blocks the response ────────────────────
  void (async () => {
    try {
      const { createSupabaseServerClient } = await import("../../../../lib/supabase-server");
      const supabase = await createSupabaseServerClient();

      const { data: enrollment } = await supabase
        .from("certification_enrollments")
        .insert({
          email: cleanEmail,
          name: typeof name === "string" && name.trim() ? name.trim() : null,
          level: certLevel,
        })
        .select("id")
        .single();

      await supabase.from("certification_exam_submissions").insert({
        enrollment_id: enrollment?.id ?? null,
        email: cleanEmail,
        level: certLevel,
        answers,
        score,
        passed,
      });
    } catch {
      // Recording failed — score is still valid, don't surface this to user
    }
  })();

  return NextResponse.json({ score, passed, level: certLevel, threshold });
}
