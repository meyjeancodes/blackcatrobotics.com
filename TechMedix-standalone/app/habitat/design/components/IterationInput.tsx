"use client";

import { useState } from "react";

interface IterationInputProps {
  onIterate: (text: string) => void;
  loading: boolean;
}

const QUICK_CHANGES = [
  "Add a garage",
  "Make the kitchen bigger",
  "Add solar panels",
  "Make it off-grid",
  "Add a bedroom",
];

export function IterationInput({ onIterate, loading }: IterationInputProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onIterate(trimmed);
    setText("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_CHANGES.map((c) => (
          <button
            key={c}
            onClick={() => onIterate(c)}
            disabled={loading}
            className="rounded-full border border-theme-10 px-3 py-1 text-xs text-theme-55 hover:border-ember/40 hover:text-ember transition-colors disabled:opacity-50"
          >
            {c}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Make a change..."
          disabled={loading}
          className="flex-1 rounded-[14px] border border-theme-10 bg-theme-25 px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-30 focus:outline-none focus:border-ember/40"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e85d2a] disabled:opacity-50 transition-colors"
        >
          Update
        </button>
      </form>
    </div>
  );
}
