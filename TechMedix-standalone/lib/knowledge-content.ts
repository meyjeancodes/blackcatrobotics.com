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
  component?: string;
  severity?: string;
  root_cause?: string;
  mtbf_hours?: string;
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

/** Normalize a platform slug to match content file naming (underscore → hyphen).
 * Content files use underscores (unitree_g1.md) but platform IDs and URLs use hyphens (unitree-g1).
 * Try the slug as-is first, then with underscores→hyphens, then hyphens→underscores. */
function resolveContentPath(slug: string): string | null {
  const variants = [
    slug,
    slug.replace(/-/g, "_"),
    slug.replace(/_/g, "-"),
  ];
  for (const v of variants) {
    const file = path.join(CONTENT_DIR, `${v}.md`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

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

/** Parse failure modes from the raw frontmatter. Two schemas exist in content/platforms:
 *  A) `- mode: "..."` with symptom/cause/mitigation/confidence  (most files)
 *  B) `- id: fm-...` with component/severity/symptom/root_cause  (veo-s1)
 * Both are normalized into one shape so the UI renders either. */
function parseFailureModes(raw: string): FailureMode[] {
  const modes: FailureMode[] = [];
  let cur: Partial<FailureMode> | null = null;

  const start = (line: string): Partial<FailureMode> | null => {
    const a = line.match(/^\s*-\s+mode:\s*"?(.*?)"?\s*$/);
    if (a) return { mode: a[1] };
    const b = line.match(/^\s*-\s+id:\s*(fm-[^\s]+)\s*$/);
    if (b) return { mode: b[1] };
    return null;
  };

  const FIELD = /^\s+(mode|symptom|cause|root_cause|mitigation|confidence|component|severity|mtbf_hours):\s*"?(.*?)"?\s*$/;

  for (const line of raw.split("\n")) {
    const s = start(line);
    if (s) {
      if (cur?.mode) modes.push(cur as FailureMode);
      cur = s;
      continue;
    }
    if (!cur) continue;
    const kv = line.match(FIELD);
    if (kv) (cur as any)[kv[1]] = kv[2];
  }
  if (cur?.mode) modes.push(cur as FailureMode);

  // Normalize schema B → A so the UI's confidence/cause fields are populated, and so the
  // card title is the human component name rather than the raw fm-* id.
  return modes
    .filter((m) => m.mode)
    .map((m) => ({
      ...m,
      mode: /^fm-/.test(m.mode) && m.component ? `${m.component}` : m.mode,
      symptom: m.symptom ?? "",
      cause: m.cause || m.root_cause || "",
      mitigation: m.mitigation ?? "",
      confidence: m.confidence || (m.root_cause ? "verified-community" : "reported"),
    }));
}

export function getPlatformKnowledge(slug: string): PlatformKnowledge | null {
  try {
    const file = resolveContentPath(slug);
    if (!file) return null;
    const raw = fs.readFileSync(file, "utf8");
    const fm = parseFrontmatter(raw);
    const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, "");

    // NOTE: these content files keep failure_modes / repair_protocol / sources INSIDE the
    // frontmatter block, so `body` (frontmatter stripped) is EMPTY. Parse them from `raw`.
    // Parsing from `body` made failure modes and repair protocols silently render as empty.
    const overview =
      (fm.overview as string) ||
      (raw.match(/overview:\s*\|?\n([\s\S]*?)(?=\n\w+:|$)/)?.[1] ?? "").trim();
    const repairMatch = raw.match(/repair_protocol:\s*\|\n([\s\S]*?)(?=\nsources:|$)/);
    const sourcesMatch = raw.match(/sources:\s*\n([\s\S]*)/);

    return {
      slug,
      name: fm.name,
      category: fm.category,
      overview: overview || "",
      failureModes: parseFailureModes(raw),
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
