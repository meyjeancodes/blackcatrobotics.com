/**
 * Add runOllamaVision to lib/blackcat/ollama.ts.
 * Appends the vision function to the existing Ollama client module.
 */

import { readFileSync, appendFileSync } from "fs";

const OLLAMA_TS_PATH = "/Users/megan/blackcatrobotics-repo/TechMedix-standalone/lib/blackcat/ollama.ts";
const content = readFileSync(OLLAMA_TS_PATH, "utf-8");

// Check if runOllamaVision already exists
if (content.includes("runOllamaVision")) {
  console.log("runOllamaVision already exists in ollama.ts");
} else {
  // Append the runOllamaVision function to the end of the file
  const visionFn = `

/**
 * Vision-capable Ollama call. Sends a prompt and returns structured
 * text instructions with a confidence score.
 */
export async function runOllamaVision(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<{ response: string; confidence: number }> {
  const text = await ollamaGenerate(prompt, {
    system: "You are a field service AR overlay assistant. Return a JSON object with 'instructions' (string) and 'confidence' (number 0-1).",
    json: true,
    temperature: options?.temperature ?? 0.2,
    maxTokens: options?.maxTokens ?? 512,
  }) as unknown as string;

  let confidence = 0.5;
  let instructions = text;
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed.confidence === "number") confidence = parsed.confidence;
    if (typeof parsed.instructions === "string") instructions = parsed.instructions;
  } catch {
    // Not JSON, use raw response
  }

  return { response: instructions, confidence };
}
`;

  appendFileSync(OLLAMA_TS_PATH, visionFn);
  console.log("Added runOllamaVision to ollama.ts");
}
