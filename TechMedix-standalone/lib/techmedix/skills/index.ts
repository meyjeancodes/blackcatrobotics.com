/**
 * TechMedix Skill System — Phase 2
 *
 * Skills are self-contained modules that implement a single capability
 * (telemetry ingestion, diagnostics, parts lookup, work orders, etc.).
 *
 * They live under `lib/techmedix/skills/<skill-name>/index.ts` and export:
 *   - config: SkillConfig
 *   - run(input): Promise<SkillResult>
 *
 * The registry loads them dynamically from disk at startup.
 */

import type { SkillConfig, SkillInput, SkillResult } from "./types";

export type { SkillConfig, SkillInput, SkillResult } from "./types";

export interface LoadedSkill {
  name: string;
  config: SkillConfig;
  run: (input: SkillInput) => Promise<SkillResult>;
}

const skills = new Map<string, LoadedSkill>();

/**
 * Register a skill at startup.
 * Call this from a root loader, e.g. in `app/layout.tsx` or a server init.
 */
export function registerSkill(skill: LoadedSkill) {
  skills.set(skill.name, skill);
}

export function getSkill(name: string): LoadedSkill | undefined {
  return skills.get(name);
}

export function listSkills(): LoadedSkill[] {
  return Array.from(skills.values()).sort((a, b) => a.config.name.localeCompare(b.config.name));
}
