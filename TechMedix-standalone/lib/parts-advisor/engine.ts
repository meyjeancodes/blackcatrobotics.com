/**
 * Parts Advisor — recommendation engine
 * 
 * Matches natural language queries against the parts catalog and
 * knowledge hub failure modes to recommend the right parts.
 */

import { STORE_PARTS, StorePart } from "@/lib/store/parts-catalog";

export interface Recommendation {
  part: StorePart;
  reason: string;
  confidence: "high" | "medium" | "low";
  relatedFailures?: string[];
}

const PLATFORM_ALIASES: Record<string, string[]> = {
  "unitree h1": ["unitree-h1-2", "unitree_h1"],
  "h1": ["unitree-h1-2"],
  "unitree h2": ["unitree-h2"],
  "h2": ["unitree-h2"],
  "unitree g1": ["unitree_g1", "unitree-g1"],
  "g1": ["unitree_g1"],
  "unitree go2": ["unitree-go2"],
  "go2": ["unitree-go2"],
  "boston dynamics spot": ["boston_dynamics_spot"],
  "spot": ["boston_dynamics_spot"],
  "agility digit": ["agility-digit"],
  "digit": ["agility-digit"],
  "figure 02": ["figure-02"],
  "figure": ["figure-02"],
  "tesla optimus": ["tesla-optimus"],
  "optimus": ["tesla-optimus"],
};

const SYMPTOM_KEYWORDS: Record<string, string[]> = {
  "overheat": ["overheat", "overheating", "hot", "thermal", "temperature"],
  "backlash": ["backlash", "loose", "play", "worn", "drift", "calibration"],
  "battery": ["battery", "power", "charge", "runtime", "drain"],
  "actuator": ["actuator", "joint", "motor", "movement", "stiff"],
  "controller": ["controller", "compute", "communication", "comms", "drop"],
  "gait": ["gait", "walking", "limp", "balance", "stumble"],
  "grip": ["grip", "hand", "finger", "grasp", "tendon"],
  "sensor": ["sensor", "lidar", "camera", "perception", "drift"],
};

export function detectPlatform(query: string): string[] {
  const q = query.toLowerCase();
  const platforms: string[] = [];
  
  for (const [alias, ids] of Object.entries(PLATFORM_ALIASES)) {
    if (q.includes(alias)) {
      platforms.push(...ids);
    }
  }
  
  return [...new Set(platforms)];
}

export function detectSymptoms(query: string): string[] {
  const q = query.toLowerCase();
  const symptoms: string[] = [];
  
  for (const [category, keywords] of Object.entries(SYMPTOM_KEYWORDS)) {
    if (keywords.some((kw) => q.includes(kw))) {
      symptoms.push(category);
    }
  }
  
  return symptoms;
}

export function recommendParts(query: string): Recommendation[] {
  const platforms = detectPlatform(query);
  const symptoms = detectSymptoms(query);
  
  // If no specific platform detected, check for SKU match
  const skuMatch = query.match(/\b([A-Z]{2,}-[A-Z0-9-]+)\b/g);
  
  if (skuMatch) {
    const exactMatches = STORE_PARTS.filter((p) =>
      skuMatch.includes(p.sku)
    ).map((part) => ({
      part,
      reason: `Exact SKU match: ${part.sku}`,
      confidence: "high" as const,
    }));
    if (exactMatches.length > 0) return exactMatches;
  }
  
  // Score parts by relevance
  const scored = STORE_PARTS.map((part) => {
    let score = 0;
    let reasons: string[] = [];
    
    // Platform match
    if (platforms.some((pid) => part.platformId === pid)) {
      score += 3;
      reasons.push(`Fits your ${part.manufacturer} platform`);
    }
    
    // Symptom match
    for (const symptom of symptoms) {
      const keywords = SYMPTOM_KEYWORDS[symptom] || [];
      const partText = `${part.name} ${part.description}`.toLowerCase();
      if (keywords.some((kw) => partText.includes(kw))) {
        score += 2;
        reasons.push(`Addresses ${symptom} issue`);
      }
    }
    
    // Keyword overlap with description
    const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const descWords = part.description.toLowerCase();
    const nameWords = part.name.toLowerCase();
    for (const word of queryWords) {
      if (descWords.includes(word) || nameWords.includes(word)) {
        score += 1;
      }
    }
    
    let confidence: "high" | "medium" | "low" = "low";
    if (score >= 5) confidence = "high";
    else if (score >= 2) confidence = "medium";
    
    return {
      part,
      reason: reasons.length > 0 ? reasons.join("; ") : "General catalog match",
      confidence,
      score,
    };
  });
  
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ part, reason, confidence }) => ({ part, reason, confidence }));
}

export function formatRecommendationText(recs: Recommendation[]): string {
  if (recs.length === 0) {
    return "I couldn't find parts matching that query. Try being more specific about your robot platform (e.g., \"Unitree H1\") or the symptom you're seeing (e.g., \"knee overheating\").";
  }
  
  const lines = recs.map((rec, i) => {
    const price = (rec.part.unitAmount / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    const confEmoji = rec.confidence === "high" ? "🔴" : rec.confidence === "medium" ? "🟡" : "⚪";
    return `${i + 1}. **${rec.part.name}** (${rec.part.sku}) — ${price}
   ${rec.reason} ${confEmoji} ${rec.confidence} confidence
   Lead time: ${rec.part.leadTime} | ${rec.part.warranty} warranty`;
  });
  
  return `Here's what I found:\n\n${lines.join("\n\n")}\n\nWant me to add any of these to your cart, or tell me more about the issue for a better match?`;
}
