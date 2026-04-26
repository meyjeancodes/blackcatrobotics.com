import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// ─── Answer key (mirrors exam page question bank) ─────────────────────────────
const ANSWER_KEY: Record<string, number[]> = {
  L1: [0, 2, 1, 1, 2],
  L2: [0, 1, 1, 1, 1],
  L3: [1, 0, 1, 1, 2],
  L4: [1, 1, 1, 1, 1],
  L5: [1, 2, 2, 1, 1],
};

// Passing threshold per level (%)
const THRESHOLD: Record<string, number> = {
  L1: 60,
  L2: 60,
  L3: 80,
  L4: 80,
  L5: 80,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, level, answers } = body as {
      email: string;
      name?: string;
      level: string;
      answers: number[];
    };

    if (!email || !level || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "email, level, and answers are required" },
        { status: 400 }
      );
    }

    const key = ANSWER_KEY[level];
    const threshold = THRESHOLD[level] ?? 60;

    if (!key) {
      return NextResponse.json({ error: "Unknown certification level" }, { status: 400 });
    }

    // Score immediately
    const correct = answers.reduce(
      (sum, ans, i) => sum + (ans === key[i] ? 1 : 0),
      0
    );
    const score = Math.round((correct / key.length) * 100);
    const passed = score >= threshold;

    // Persist to DB if available (non-blocking — don't fail the response if DB is down)
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        await supabase.from("certification_exam_results").insert({
          email,
          name: name ?? null,
          level,
          answers,
          score,
          passed,
          threshold,
          submitted_at: new Date().toISOString(),
        });
      }
    } catch {
      // DB persistence is best-effort — exam result is still returned
    }

    return NextResponse.json({ score, passed, level, threshold });
  } catch (err) {
    console.error("[POST /api/certifications/submit] error:", err);
    return NextResponse.json(
      { error: "Submission failed. Please try again." },
      { status: 500 }
    );
  }
}
