"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Wrench, ShoppingCart, Check } from "lucide-react";
import type { StorePart } from "@/lib/store/parts-catalog";

interface Message {
  role: "user" | "assistant";
  content: string;
  parts?: Array<{ part: StorePart; reason: string; confidence: string }>;
}

const INITIAL_SUGGESTIONS = [
  "My Unitree H1 knee actuator is overheating",
  "Looking for hip actuator for H1",
  "What parts do you have for Boston Dynamics Spot?",
  "H1 battery draining fast",
  "Spot arm actuator making noise",
  "G1 grip force dropping",
  "Asimov battery fault",
];

export function PartsAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<Map<string, { part: StorePart; qty: number }>>(
    new Map()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/parts-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (data.error && !data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || "Sorry, something went wrong. Please try again." },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, parts: data.recommendations },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't reach the parts advisor. Please try again or contact support.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (part: StorePart) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(part.sku);
      if (existing) {
        next.set(part.sku, { part, qty: existing.qty + 1 });
      } else {
        next.set(part.sku, { part, qty: 1 });
      }
      return next;
    });
  };

  const removeFromCart = (sku: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(sku);
      return next;
    });
  };

  const updateCartQty = (sku: string, qty: number) => {
    if (qty <= 0) { removeFromCart(sku); return; }
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(sku);
      if (existing) next.set(sku, { ...existing, qty });
      return next;
    });
  };

  const checkout = async () => {
    if (cart.size === 0) return;
    const items = Array.from(cart.values()).map(({ part, qty }) => ({
      sku: part.sku,
      quantity: qty,
    }));
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout unavailable: " + (data.error || "Please try again"));
      }
    } catch {
      alert("Checkout unavailable. Please try again.");
    }
  };

  const cartCount = Array.from(cart.values()).reduce((s, { qty }) => s + qty, 0);

  if (!isOpen) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-ember px-5 py-3 font-ui text-sm uppercase tracking-widest text-white shadow-lg transition hover:bg-ember/90 hover:shadow-xl"
        >
          <Wrench size={16} />
          Parts Advisor
        </button>
        {cartCount > 0 && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-20 z-50 flex items-center gap-2 rounded-full bg-ember/90 px-4 py-3 font-ui text-sm uppercase tracking-widest text-white shadow-lg transition hover:bg-ember"
          >
            <ShoppingCart size={16} />
            Cart ({cartCount})
          </button>
        )}
      </>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[420px] flex-col rounded-2xl border border-theme-10 bg-theme-18 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme-10 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember">
            <Wrench size={14} className="text-white" />
          </div>
          <div>
            <p className="font-header text-sm text-theme-primary">Parts Advisor</p>
            <p className="font-ui text-[0.5rem] uppercase tracking-widest text-theme-40">
              Find the right part
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1.5 text-theme-40 transition hover:bg-theme-10 hover:text-theme-primary"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-theme-50">
              Hi! I can help you find the right aftermarket part. Tell me about your robot and the issue.
            </p>
            <div className="flex flex-wrap gap-2">
              {INITIAL_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-theme-10 px-3 py-1.5 text-xs text-theme-50 transition hover:border-theme-20 hover:text-theme-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user"
                  ? "bg-ember text-white"
                  : "border border-theme-10 bg-white text-theme-primary"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.parts && msg.parts.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.parts.map((rec) => (
                    <div
                      key={rec.part.sku}
                      className="rounded-xl border border-theme-10 bg-theme-5 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-theme-primary">
                            {rec.part.name}
                          </p>
                          <p className="mt-0.5 text-[0.65rem] text-theme-40">
                            {rec.part.sku} ·{" "}
                            {(rec.part.unitAmount / 100).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => addToCart(rec.part)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ember text-white transition hover:bg-ember/90"
                          title="Add to cart"
                        >
                          <ShoppingCart size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-theme-10 bg-white px-4 py-2.5">
              <p className="text-sm text-theme-40">Searching parts...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="border-t border-theme-10 bg-theme-5 px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-theme-40">{cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
          <button
            onClick={checkout}
            className="flex-1 rounded-lg bg-ember px-3 py-1.5 text-xs font-ui uppercase tracking-widest text-white transition hover:bg-ember/90"
          >
            Checkout ({cart.size})
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-theme-10 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Describe your robot and issue..."
            className="flex-1 rounded-xl border border-theme-10 bg-white px-3 py-2 text-sm text-theme-primary placeholder:text-theme-30 focus:border-theme-20 focus:outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-ember text-white transition hover:bg-ember/90 disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}