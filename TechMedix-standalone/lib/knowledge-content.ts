// Platform knowledge-base loader.
//
// Content lives in /content/platforms/<slug>.md with YAML frontmatter:
//   overview, failure_modes[] {mode, symptom, cause, mitigation, confidence},
//   repair_protocol (multiline), sources[].
// Parsed at build time (server components only) — no runtime deps, no gray-matter.
import fs from "fs";
import path from "path";

export interface FailureMode {
  mode: string;
  symptom: string;
  cause: string;
  mitigation: string;
  confidence: string;
}

export interface PlatformKnowledge {
  slug: string;
  name?: string;
  category?: string;
  overview: string;
  failureModes: FailureMode[];
  repairProtocol: string;
  sources: string[];
}

const CONTENT_DIR = path.join(process.cwd(), "content", "platforms");

function parseFrontmatter(raw: string): Record<string, any> {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return {};
  const fm: Record<string, any> = {};
  let key = "";
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv && !line.startsWith(" ")) {
      key = kv[1];
      const v = kv[2].trim();
      fm[key] = v === "" ? undefined : v;
    } else if (/^\s*-\s/.test(line) && key) {
      // list item — strip "- " and unquote
      const item = line.replace(/^\s*-\s/, "").trim().replace(/^["']|["']$/g, "");
      if (!fm[key]) fm[key] = [];
      if (typeof fm[key] === "string") continue; // multiline scalar started
      fm[key].push(item);
    }
  }
  return fm;
}

function parseFailureModes(raw: string): FailureMode[] {
  const modes: FailureMode[] = [];
  let cur: Partial<FailureMode> | null = null;
  for (const line of raw.split("\n")) {
    const item = line.match(/^\s*-\s+mode:\s*"?(.*?)"?\s*$/);
    if (item) {
      if (cur) modes.push(cur as FailureMode);
      cur = { mode: item[1] };
      continue;
    }
    if (!cur) continue;
    const kv = line.match(/^\s+(mode|symptom|cause|mitigation|confidence):\s*"?(.*?)"?\s*$/);
    if (kv) (cur as any)[kv[1]] = kv[2];
  }
  if (cur) modes.push(cur as FailureMode);
  return modes.filter((m) => m.mode);
}

export function getPlatformKnowledge(slug: string): PlatformKnowledge | null {
  try {
    const file = path.join(CONTENT_DIR, `${slug}.md`);
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, "utf8");
    const fm = parseFrontmatter(raw);
    const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, "");

    const overview =
      (fm.overview as string) ||
      (body.match(/overview:\s*\|?\n([\s\S]*?)(?=\n\w+:|$)/)?.[1] ?? "").trim();
    const repairMatch = body.match(/repair_protocol:\s*\|\n([\s\S]*?)(?=\nsources:|$)/);
    const sourcesMatch = body.match(/sources:\s*\n([\s\S]*)/);

    return {
      slug,
      name: fm.name,
      category: fm.category,
      overview: overview || "",
      failureModes: parseFailureModes(body),
      repairProtocol: (repairMatch?.[1] ?? "").trim(),
      sources: (fm.sources as string[]) ||
        (sourcesMatch
          ? sourcesMatch[1]
              .split("\n")
              .map((l) => l.replace(/^\s*-\s*/, "").trim())
              .filter(Boolean)
          : []),
    };
  } catch {
    return null;
  }
}
