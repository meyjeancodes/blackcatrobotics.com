import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isSupabaseServerConfigured() || !(await createSupabaseServerClient())) {
    return NextResponse.json(
      { error: "Cannot submit certification — database is offline" },
      { status: 503 }
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not available" }, { status: 503 });
    }

    const body = await req.json();
    const { enrollment_id, answers, completed_at } = body;

    if (!enrollment_id || !Array.isArray(answers)) {
      return NextResponse.json({ error: "enrollment_id and answers are required" }, { status: 400 });
    }

    // Record submission
    const { error } = await supabase
      .from("certification_exam_submissions")
      .insert({
        enrollment_id,
        answers,
        submitted_at: completed_at ?? new Date().toISOString(),
        score: null, // will be filled by grader
        graded: false,
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/certifications/submit] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Submission failed" },
      { status: 500 }
    );
  }
}
