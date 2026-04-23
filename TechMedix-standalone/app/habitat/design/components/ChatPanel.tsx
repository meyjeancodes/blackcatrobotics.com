"use client";

import { useRef, useEffect } from "react";
import { Message, DesignParams } from "../hooks/useDesignSession";

const QUICK_PICKS = [
  "3 bed, 2 bath, modern",
  "Off-grid, $400k budget",
  "2 story, 2000 sqft, solar",
  "Minimalist, suburban",
];

interface ChatPanelProps {
  messages: Message[];
  loading: boolean;
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, loading, onSend }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text || loading) return;
    onSend(text);
    inputRef.current!.value = "";
  }

  const hasStarted = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <p className="kicker">Design assistant</p>
        <h2 className="mt-1.5 font-header text-2xl leading-tight text-theme-primary">
          HABITAT AI Designer
        </h2>
        <p className="mt-1 text-sm text-theme-55 leading-relaxed">
          Describe your dream home. I will translate your vision into a structured design.
        </p>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[200px] max-h-[480px]"
      >
        {!hasStarted && (
          <div className="flex flex-wrap gap-2 pt-2">
            {QUICK_PICKS.map((pick) => (
              <button
                key={pick}
                onClick={() => onSend(pick)}
                className="rounded-full border border-theme-10 px-3.5 py-1.5 text-xs text-theme-60 hover:border-ember/40 hover:text-ember transition-colors"
              >
                {pick}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-[16px] px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-ember text-white"
                  : "bg-theme-4 border border-theme-6 text-theme-primary"
              }`}
            >
              {msg.content}
              {msg.params && msg.role === "assistant" && (
                <ParamsPill params={msg.params} />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-[16px] border border-theme-6 bg-theme-4 px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-theme-30 animate-bounce"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Describe your home..."
          disabled={loading}
          className="flex-1 rounded-[14px] border border-theme-10 bg-theme-25 px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-30 focus:outline-none focus:border-ember/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e85d2a] disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function ParamsPill({ params }: { params: DesignParams }) {
  const items: string[] = [];
  if (params.bedrooms) items.push(`${params.bedrooms} bed`);
  if (params.bathrooms) items.push(`${params.bathrooms} bath`);
  if (params.sqft) items.push(`${params.sqft.toLocaleString()} sqft`);
  if (params.style) items.push(params.style);
  if (params.budget_max) items.push(`$${(params.budget_max / 1000).toFixed(0)}k`);
  if (!items.length) return null;

  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full bg-ember/10 border border-ember/15 px-2 py-0.5 text-[0.65rem] font-medium text-ember uppercase tracking-wider"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
