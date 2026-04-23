"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { DesignParams } from "../lib/floor-plan-generator";
import type { Quote } from "../lib/quote-engine";

interface SaveDesignButtonProps {
  params: Partial<DesignParams>;
  svg?: string;
  quote?: Quote;
  onSaved?: (id: string) => void;
}

export function SaveDesignButton({ params, svg, quote, onSaved }: SaveDesignButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  async function handleSave() {
    setSaving(true);
    setShowAuthPrompt(false);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setShowAuthPrompt(true);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/habitat-design/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: params.notes ? `${params.notes.slice(0, 30)}...` : "Untitled Design",
          params,
          floor_plan_svg: svg,
          quote,
        }),
      });
      const data = await res.json();

      if (data.success && data.id) {
        setSaved(true);
        onSaved?.(data.id);
      } else {
        alert(data.error || "Failed to save design");
      }
    } catch {
      alert("Connection error while saving");
    } finally {
      setSaving(false);
    }
  }

  function handleGoogleSignIn() {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/habitat/design`,
      },
    });
  }

  if (saved) {
    return (
      <div className="rounded-full bg-moss/10 border border-moss/20 px-4 py-2.5 text-sm font-medium text-moss flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-moss" />
        Design saved
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showAuthPrompt && (
        <div className="rounded-[12px] border border-theme-10 bg-theme-3 px-4 py-3">
          <p className="text-sm text-theme-primary mb-2">Sign in to save your design</p>
          <button
            onClick={handleGoogleSignIn}
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-theme-primary hover:bg-white/10 transition flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-full border border-theme-10 px-5 py-2.5 text-sm font-semibold text-theme-primary hover:border-ember/30 hover:text-ember transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Design"}
      </button>
    </div>
  );
}
