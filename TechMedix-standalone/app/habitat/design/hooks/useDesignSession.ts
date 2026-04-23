"use client";

import { useState, useCallback } from "react";

export type DesignStep = "intake" | "designing" | "quoting" | "checkout";

export interface DesignParams {
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  stories?: number;
  style?: "modern" | "traditional" | "minimalist" | "industrial" | "craftsman";
  features?: Array<"solar" | "off-grid" | "smart-home" | "ev-charging" | "rainwater" | "compost">;
  budget_max?: number;
  budget_tier?: "standard" | "pro" | "signature";
  site_type?: "urban" | "suburban" | "rural" | "off-grid";
  notes?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  params?: DesignParams;
  timestamp: number;
}

export interface DesignSession {
  messages: Message[];
  params: Partial<DesignParams>;
  step: DesignStep;
}

export function useDesignSession() {
  const [session, setSession] = useState<DesignSession>({
    messages: [],
    params: {},
    step: "intake",
  });
  const [loading, setLoading] = useState(false);

  const addMessage = useCallback((msg: Omit<Message, "timestamp">) => {
    const full: Message = { ...msg, timestamp: Date.now() };
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, full],
      params: msg.params ? { ...prev.params, ...msg.params } : prev.params,
      step: deriveStep(prev.step, msg.params),
    }));
  }, []);

  const setStep = useCallback((step: DesignStep) => {
    setSession((prev) => ({ ...prev, step }));
  }, []);

  const reset = useCallback(() => {
    setSession({ messages: [], params: {}, step: "intake" });
  }, []);

  return { session, loading, setLoading, addMessage, setStep, reset };
}

function deriveStep(current: DesignStep, newParams?: DesignParams): DesignStep {
  if (!newParams) return current;
  const hasCore =
    newParams.bedrooms !== undefined ||
    newParams.bathrooms !== undefined ||
    newParams.sqft !== undefined ||
    newParams.budget_max !== undefined;
  if (hasCore && current === "intake") return "designing";
  return current;
}
