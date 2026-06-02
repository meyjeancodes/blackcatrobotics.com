import { NextRequest, NextResponse } from "next/server";
import { listSkills, getSkill } from "@/lib/techmedix/skills";

export const dynamic = "force-dynamic";

export async function GET() {
  const skills = listSkills();
  return NextResponse.json({
    skills: skills.map((s) => ({
      name: s.config.name,
      version: s.config.version,
      description: s.config.description,
      inputSchema: s.config.inputSchema,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const skillName = body.skill as string | undefined;
    const input = body.input ?? {};

    if (!skillName) {
      return NextResponse.json({ error: "skill name required" }, { status: 400 });
    }

    const skill = getSkill(skillName);
    if (!skill) {
      return NextResponse.json({ error: `skill not found: ${skillName}` }, { status: 404 });
    }

    const result = await skill.run(input);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[skills] POST failed:", err);
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
