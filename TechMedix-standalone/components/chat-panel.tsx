"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: "ollama" | "claude" | "fallback";
}

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply ?? "No response received.",
        source: data.source,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again.", source: "fallback" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function sourceLabel(source?: string) {
    switch (source) {
      case "ollama": return "Local LLM";
      case "claude": return "Claude";
      default: return "";
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-white shadow-lg transition hover:scale-105 hover:opacity-90"
          aria-label="Open AI chat"
        >
          <MessageSquare size={22} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-white/10 bg-[#15161b] shadow-2xl"
          style={{ height: "min(560px, calc(100vh - 6rem))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ember/20">
                <Bot size={14} className="text-ember" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">TechMedix AI</p>
                <p className="text-[0.6rem] uppercase tracking-widest text-white/30">Diagnostic Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot size={32} className="text-white/20 mb-3" />
                <p className="text-sm text-white/40">Ask about your fleet</p>
                <p className="text-xs text-white/25 mt-1">Health, alerts, diagnostics, maintenance</p>
                <div className="mt-4 space-y-2">
                  {[
                    "What robots need attention?",
                    "Summarize active alerts",
                    "Which robot has the lowest health?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="block w-full rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-left text-xs text-white/50 transition hover:bg-white/10 hover:text-white/70"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ember/20">
                    <Bot size={12} className="text-ember" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-ember text-white"
                        : "bg-white/5 text-white/90"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && msg.source && msg.source !== "fallback" && (
                    <p className="mt-1 text-[0.55rem] uppercase tracking-widest text-white/20">
                      {sourceLabel(msg.source)}
                    </p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <User size={12} className="text-white/50" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ember/20">
                  <Bot size={12} className="text-ember" />
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  <Loader2 size={16} className="animate-spin text-white/40" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t border-white/10 px-3 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your fleet..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-ember/50"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ember text-white transition hover:opacity-90 disabled:opacity-30"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
