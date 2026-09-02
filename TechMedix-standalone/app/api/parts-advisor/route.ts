/**
 * Parts Advisor API route — handles natural language parts queries.
 * 
 * POST /api/parts-advisor
 * Body: { query: string, sessionId?: string }
 * Response: { reply: string, recommendations: Array<{ part: StorePart, reason: string, confidence: string }> }
 */

import { NextRequest, NextResponse } from "next/server";
import { recommendParts, formatRecommendationText, detectPlatform, detectSymptoms } from "@/lib/parts-advisor/engine";
import { getAllPlatforms } from "@/lib/platforms/index";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required", reply: "Please describe your robot platform and the issue you're experiencing." },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      return NextResponse.json(
        { error: "Empty query", reply: "What part are you looking for? Tell me about your robot and the problem." },
        { status: 400 }
      );
    }

    // Get recommendations
    const recommendations = recommendParts(trimmedQuery);
    const platforms = detectPlatform(trimmedQuery);
    const symptoms = detectSymptoms(trimmedQuery);

    // Build platform context
    let platformContext = "";
    if (platforms.length > 0) {
      const platformData = getAllPlatforms().filter((p) =>
        platforms.includes(p.id)
      );
      if (platformData.length > 0) {
        platformContext = ` Detected platform: ${platformData.map((p) => p.name).join(", ")}.`;
      }
    }

    // Build symptom context
    let symptomContext = "";
    if (symptoms.length > 0) {
      symptomContext = ` Symptoms detected: ${symptoms.join(", ")}.`;
    }

    // Format reply
    const reply = formatRecommendationText(recommendations) + platformContext + symptomContext;

    return NextResponse.json({
      reply,
      recommendations: recommendations.map((rec) => ({
        part: rec.part,
        reason: rec.reason,
        confidence: rec.confidence,
      })),
      metadata: {
        platforms,
        symptoms,
        count: recommendations.length,
      },
    });
  } catch (error) {
    console.error("[parts-advisor] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        reply: "Something went wrong while searching for parts. Please try again or contact support@blackcatrobotics.com.",
      },
      { status: 500 }
    );
  }
}
