/**
 * TechMedix AR Guidance Skill — Phase 4
 *
 * Registers the ar-guidance skill with the TechMedix skill registry.
 * The actual API route lives at app/api/ar-guidance/route.ts.
 * This skill provides a client-facing wrapper for the skill registry.
 */

import { registerSkill } from "../index";
import type { SkillConfig, SkillInput, SkillResult } from "../types";
import type { LoadedSkill } from "..";
import { runOllamaVision } from "@/lib/blackcat/ollama";
import { getSupabase } from "@/lib/techmedix/memory";

const config: SkillConfig = {
  name: "ar-guidance",
  version: "0.1.0",
  description:
    "Generate AR overlay instructions for a robot fault by running Ollama vision analysis and logging results to ar_guidance_log.",
  inputSchema: {
    robot_id: "string",
    platform_id: "string",
    active_fault: "string",
    image_data: "string?",
  },
};

interface ArGuidanceInput {
  robot_id: string;
  platform_id: string;
  active_fault: string;
  image_data?: string;
}

const runArGuidance = async (input: SkillInput): Promise<SkillResult> => {
  try {
    const prompt = input.image_data
      ? `Fault: ${input.active_fault}. Provide AR overlay instructions for a field technician working on the robot.`
      : `Fault: ${input.active_fault}. Provide AR overlay instructions for a field technician working on the robot.`;

    const visionResult = await runOllamaVision(prompt, {
      temperature: 0.2,
      maxTokens: 512,
    });

    const overlayResponse: Record<string, unknown> = {
      instructions: visionResult.response,
      fault_detected: input.active_fault,
      image_provided: !!input.image_data,
      timestamp: new Date().toISOString(),
    };

    const confidence = visionResult.confidence;

    // Write to ar_guidance_log
    const supabase = await getSupabase();
    if (supabase) {
      await supabase
        .from("ar_guidance_log")
        .insert({
          robot_id: input.robot_id,
          platform_id: input.platform_id,
          active_fault: input.active_fault,
          overlay_response: overlayResponse,
          confidence,
        })
        .select()
        .single();
    }

    return {
      ok: true,
      message: `AR guidance generated (confidence: ${(confidence * 100).toFixed(0)}%)`,
      data: { overlayResponse, confidence },
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message ?? "ar_guidance_failed" };
  }
}

registerSkill({ name: config.name, config, run: runArGuidance as (input: SkillInput) => Promise<SkillResult> } as unknown as LoadedSkill);
export { config as skillConfig, runArGuidance };
