export interface SkillConfig {
  name: string;
  version: string;
  description: string;
  inputSchema: Record<string, string>;
}

export interface SkillInput {
  [key: string]: unknown;
}

export interface SkillResult {
  ok: boolean;
  dryRun?: boolean;
  message?: string;
  error?: string;
  data?: Record<string, unknown>;
}
