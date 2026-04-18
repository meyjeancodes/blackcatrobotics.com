import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const SLUGS: Record<string, string> = {
  L1: "L1_operator",
  L2: "L2_technician",
  L3: "L3_specialist",
  L4: "L4_systems_engineer",
  L5: "L5_autonomous_architect",
};

const SECTIONS = ["README", "curriculum", "lab_exercises", "competency_rubric"] as const;
export type SectionKey = (typeof SECTIONS)[number];

export interface CertSection {
  key: SectionKey;
  label: string;
  html: string;
}

const LABELS: Record<SectionKey, string> = {
  README: "Overview",
  curriculum: "Curriculum",
  lab_exercises: "Lab Exercises",
  competency_rubric: "Competency Rubric",
};

export function certDirForLevel(level: string): string | null {
  return SLUGS[level] ?? null;
}

export function loadCertSections(level: string): CertSection[] | null {
  const slug = SLUGS[level];
  if (!slug) return null;
  const dir = path.join(process.cwd(), "content", "certifications", slug);
  if (!fs.existsSync(dir)) return null;
  const result: CertSection[] = [];
  for (const key of SECTIONS) {
    const file = path.join(dir, `${key}.md`);
    if (!fs.existsSync(file)) continue;
    const raw = fs.readFileSync(file, "utf8");
    const html = marked.parse(raw, { async: false }) as string;
    result.push({ key, label: LABELS[key], html });
  }
  return result;
}
