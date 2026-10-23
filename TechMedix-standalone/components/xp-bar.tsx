"use client";

import { useEffect, useState } from "react";
import { Zap, Trophy } from "lucide-react";

const STORAGE_KEY = "techmedix-xp";

interface XpState {
  xp: number;
  level: number;
  streak: number;
  lastDay: string;
}

const LEVELS = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000];

function levelFor(xp: number) {
  let lvl = 1;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]) lvl = i + 1;
  return Math.min(lvl, LEVELS.length);
}

function load(): XpState {
  if (typeof window === "undefined") return { xp: 0, level: 1, streak: 0, lastDay: "" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { xp: 0, level: 1, streak: 0, lastDay: "" };
}

export function XpBar() {
  const [state, setState] = useState<XpState>({ xp: 0, level: 1, streak: 0, lastDay: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const s = load();
    const today = new Date().toISOString().slice(0, 10);
    if (s.lastDay && s.lastDay !== today) {
      const prev = new Date(s.lastDay);
      const diff = (new Date(today).getTime() - prev.getTime()) / 86400000;
      if (diff === 1) s.streak += 1;
      else if (diff > 1) s.streak = 1;
    } else if (!s.lastDay) {
      s.streak = 1;
    }
    s.lastDay = today;
    s.level = levelFor(s.xp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setState(s);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const nextXp = LEVELS[Math.min(state.level, LEVELS.length - 1)] ?? LEVELS[LEVELS.length - 1];
  const prevXp = LEVELS[state.level - 1] ?? 0;
  const pct = Math.min(100, ((state.xp - prevXp) / (nextXp - prevXp)) * 100);

  return (
    <div className="rounded-2xl border border-theme-5 bg-theme-2 px-4 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Trophy size={16} className="text-amber-500" />
        <span className="text-xs font-semibold text-theme-primary">Level {state.level}</span>
      </div>
      <div className="flex-1">
        <div className="h-2 rounded-full bg-theme-5 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-theme-35">
          {state.xp} XP · {Math.max(0, nextXp - state.xp)} to next level · {state.streak} day streak
        </p>
      </div>
      <button
        onClick={() => {
          const s = load();
          s.xp += 25;
          s.level = levelFor(s.xp);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
          setState(s);
        }}
        className="flex items-center gap-1 rounded-full border border-theme-5 px-3 py-1 text-xs text-theme-50 hover:border-theme-10"
      >
        <Zap size={12} /> +25 XP
      </button>
    </div>
  );
}