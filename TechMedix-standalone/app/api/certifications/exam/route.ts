/**
 * POST /api/certifications/exam
 * Validates exam answers, calculates score, and upgrades cert_level if passed.
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient as createClient } from "../../../../lib/supabase-server";

export const runtime = "nodejs";

const VALID_LEVELS = ["L1", "L2", "L3", "L4", "L5"] as const;
type Level = (typeof VALID_LEVELS)[number];

const PASS_THRESHOLD = 80;

// Local answer key fallback — mirrors the certification submit route
const LOCAL_ANSWERS: Record<Level, number[]> = {
  L1: [0, 2, 1, 1, 2],
  L2: [0, 1, 1, 1, 1],
  L3: [1, 0, 1, 1, 2],
  L4: [1, 1, 1, 1, 1],
  L5: [1, 2, 2, 1, 1],
};

interface ExamAnswer {
  questionId: string;
  answer: number;
}

interface ExamRequest {
  technicianId: string;
  level: string;
  answers: ExamAnswer[];
}

export async function POST(req: NextRequest) {
  let body: ExamRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { technicianId, level, answers } = body;

  if (!technicianId) {
    return NextResponse.json(
      { error: "technicianId is required" },
      { status: 400 }
    );
  }

  if (!level || !VALID_LEVELS.includes(level as Level)) {
    return NextResponse.json(
      { error: `level must be one of: ${VALID_LEVELS.join(", ")}` },
      { status: 400 }
    );
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json(
      { error: "answers must be a non-empty array" },
      { status: 400 }
    );
  }

  const certLevel = level as Level;

  try {
    const supabase = await createClient();

    // 1. Verify technician exists
    const { data: tech, error: techErr } = await supabase
      .from("technicians")
      .select("id, cert_level")
      .eq("id", technicianId)
      .single();

    if (techErr || !tech) {
      return NextResponse.json(
        { error: "Technician not found" },
        { status: 404 }
      );
    }

    // 2. Score — try DB questions first, fall back to local key
    let score = 0;
    let scoredFromDb = false;

    const { data: questions } = await supabase
      .from("certification_exam_questions")
      .select("id, answer_idx")
      .eq("level", certLevel)
      .order("created_at");

    if (questions && questions.length > 0) {
      // Build a map of questionId → correct answer_idx
      const answerMap = new Map<string, number>();
      for (const q of questions) {
        answerMap.set(q.id, q.answer_idx);
      }

      let correct = 0;
      for (const a of answers) {
        const correctIdx = answerMap.get(a.questionId);
        if (correctIdx !== undefined && correctIdx === a.answer) {
          correct++;
        }
      }
      score = Math.round((correct / questions.length) * 100);
      scoredFromDb = true;
    }

    if (!scoredFromDb) {
      // Fall back to local answer key (positional matching)
      const key = LOCAL_ANSWERS[certLevel];
      const correct = key.filter((ans, i) => ans === (answers[i]?.answer ?? -1)).length;
      score = Math.round((correct / key.length) * 100);
    }

    const passed = score >= PASS_THRESHOLD;

    // 3. If passed, upgrade technician cert_level
    let newLevel: string | undefined;
    if (passed) {
      await supabase
        .from("technicians")
        .update({
          cert_level: certLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", technicianId);
      newLevel = certLevel;
    }

    // 4. Record the exam submission (best-effort)
    try {
      await supabase.from("certification_exam_submissions").insert({
        technician_id: technicianId,
        level: certLevel,
        answers,
        score,
        passed,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ passed, score, newLevel });
  } catch (err) {
    console.error("[certifications/exam] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
