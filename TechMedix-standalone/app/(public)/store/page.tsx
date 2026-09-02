"use client";

import { useState, useMemo, useCallback } from "react";
import { STORE_PARTS, StorePart } from "@/lib/store/parts-catalog";
import { PartsAdvisor } from "@/components/parts-advisor/PartsAdvisorWidget";

interface CartItem {
  part: StorePart;
  qty: number;
}

const CATEGORIES = [
  { id: "all", label: "All Parts" },
  { id: "unitree-h1", label: "Unitree H1" },
  { id: "bostondynamics-spot", label: "Boston Dynamics" },
  { id: "dji-agras", label: "DJI Agras" },
  { id: "kinova-gen3", label: "Kinova" },
  { id: "agility-digit", label: "Agility" },
  { id: "figure-02", label: "Figure" },
];

export default function StorePage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState<
    Array<{ part: StorePart; reason: string; confidence: string }>
  >([]);
  const [advisorOpen, setAdvisorOpen] = useState(false);

  const filteredParts = useMemo(() => {
    let list = STORE_PARTS;
    if (category !== "all") {
      list = list.filter((p) => p.platformId === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.unitAmount - b.unitAmount);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.unitAmount - a.unitAmount);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [category, search, sort]);

  const addToCart = useCallback((sku: string) => {
    const part = STORE_PARTS.find((p) => p.sku === sku);
    if (!part) return;
    setCart((prev) => {
      const existing = prev[sku];
      if (existing) {
        return { ...prev, [sku]: { ...existing, qty: Math.min(existing.qty + 1, 50) } };
      }
      return { ...prev, [sku]: { part, qty: 1 } };
    });
    setCartOpen(true);
  }, []);

  const setQty = useCallback((sku: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[sku];
        return next;
      }
      if (!prev[sku]) return prev;
      return { ...prev, [sku]: { ...prev[sku], qty: Math.min(qty, 50) } };
    });
  }, []);

  const removeFromCart = useCallback((sku: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[sku];
      return next;
    });
  }, []);

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.part.unitAmount * item.qty, 0);

  const checkout = async () => {
    if (cartItems.length === 0) return;
    // For multi-item cart, use first item or implement batch checkout
    const items = cartItems.map((i) => ({ sku: i.part.sku, quantity: i.qty }));
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.length === 1 ? items[0] : items }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
      } else if (data.ok && data.urls) {
        // Multi-item: open first (could be enhanced)
        window.location.href = data.urls[0];
      } else {
        alert("Checkout unavailable: " + (data.error || "Please try again"));
      }
    } catch {
      alert("Checkout unavailable. Please try again.");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <header className="mb-8">
        <a href="/" className="text-sm text-[#cc3d17] hover:text-[#cc3d17]/80 transition">
          &larr; Back to TechMedix
        </a>
        <h1 className="mt-2 font-header text-4xl tracking-[-0.04em] text-theme-primary">
          Aftermarket Parts
        </h1>
        <p className="mt-2 max-w-xl text-sm text-theme-50">
          Genuine replacement parts for your fleet. Search, filter, and buy directly.
        </p>
      </header>

      {/* Search + Sort + Category */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, SKU, or manufacturer..."
          className="flex-1 min-w-[240px] rounded-xl border border-theme-10 bg-white px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-30 focus:border-theme-20 focus:outline-none"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-theme-10 bg-white px-4 py-2.5 text-sm text-theme-primary focus:outline-none"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A-Z</option>
        </select>
      </div>

      {/* Category Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`rounded-full border px-3 py-1.5 font-ui text-[0.6rem] uppercase tracking-[0.18em] transition ${
              category === cat.id
                ? "border-ember bg-ember text-white"
                : "border-theme-10 text-theme-50 hover:border-theme-20"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Parts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredParts.map((part) => (
          <div
            key={part.sku}
            className="rounded-2xl border border-theme-10 bg-white p-5 transition hover:border-theme-20 hover:shadow-md"
          >
            {part.image && (
              <img
                src={part.image}
                alt={part.name}
                className="mb-3 h-40 w-full rounded-xl object-cover"
                loading="lazy"
              />
            )}
            <p className="font-ui text-[0.6rem] uppercase tracking-[0.18em] text-theme-40">
              {part.manufacturer}
            </p>
            <h3 className="mt-1 text-base font-semibold text-theme-primary">{part.name}</h3>
            <p className="mt-1 text-xs text-theme-50 line-clamp-2">{part.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-theme-primary">
                {(part.unitAmount / 100).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </span>
              <span className="text-[0.65rem] text-theme-40">{part.leadTime}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => addToCart(part.sku)}
                className="flex-1 rounded-lg bg-ember px-4 py-2 font-ui text-xs uppercase tracking-widest text-white transition hover:bg-ember/90"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredParts.length === 0 && (
        <p className="py-12 text-center text-theme-40">
          No parts match your search.
        </p>
      )}

      {/* Floating Cart Button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-white shadow-lg transition hover:bg-ember/90"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[0.6rem] font-bold text-ember">
            {cartCount}
          </span>
        )}
      </button>

      {/* Parts Advisor Button */}
      <button
        onClick={() => setAdvisorOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1db87a] text-white shadow-lg transition hover:bg-[#1db87a]/90"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </button>

      {/* Cart Drawer */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-10 px-5 py-4">
              <h3 className="font-header text-lg text-theme-primary">Cart ({cartCount})</h3>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-lg p-1.5 text-theme-40 hover:bg-theme-5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <p className="py-12 text-center text-sm text-theme-40">Your cart is empty.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.part.sku} className="flex items-center gap-3 rounded-xl border border-theme-10 p-3">
                    {item.part.image && (
                      <img
                        src={item.part.image}
                        alt={item.part.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-theme-primary truncate">
                        {item.part.name}
                      </p>
                      <p className="text-xs text-theme-40">{item.part.sku}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          onClick={() => setQty(item.part.sku, item.qty - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-theme-10 text-xs text-theme-50 hover:bg-theme-5"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold text-theme-primary">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.part.sku, item.qty + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-theme-10 text-xs text-theme-50 hover:bg-theme-5"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.part.sku)}
                          className="ml-auto text-xs text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-theme-primary">
                        {((item.part.unitAmount * item.qty) / 100).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-theme-10 px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-theme-50">Subtotal</span>
                  <span className="text-lg font-semibold text-theme-primary">
                    {(cartTotal / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </span>
                </div>
                <button
                  onClick={checkout}
                  className="w-full rounded-xl bg-ember px-4 py-3 font-ui text-sm uppercase tracking-widest text-white transition hover:bg-ember/90"
                >
                  Checkout with Stripe
                </button>
                <p className="mt-2 text-center text-[0.65rem] text-theme-40">
                  Secure payment · Parts ship from verified distributors
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Parts Advisor Modal */}
      {advisorOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => {
              setAdvisorOpen(false);
              setRecommendations([]);
              setQuery("");
            }}
          />
          <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-2xl border border-theme-10 bg-theme-18 shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1db87a]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <p className="font-header text-sm text-theme-primary">Parts Advisor</p>
                  <p className="font-ui text-[0.5rem] uppercase tracking-widest text-theme-40">
                    Find the right part
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAdvisorOpen(false);
                  setRecommendations([]);
                  setQuery("");
                }}
                className="rounded-lg p-1.5 text-theme-40 hover:bg-theme-10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {recommendations.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-theme-50">
                    Tell me about your robot and the issue you're seeing.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Unitree H1 knee overheating",
                      "H1 battery draining fast",
                      "Spot leg actuator",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={async () => {
                          setQuery(s);
                          const res = await fetch("/api/parts-advisor", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ query: s }),
                          });
                          const data = await res.json();
                          setRecommendations(data.recommendations || []);
                        }}
                        className="rounded-full border border-theme-10 px-3 py-1.5 text-xs text-theme-50 hover:border-theme-20"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recommendations.map((rec) => (
                <div
                  key={rec.part.sku}
                  className="rounded-xl border border-theme-10 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-theme-primary">{rec.part.name}</p>
                      <p className="text-xs text-theme-40">
                        {rec.part.sku} ·{" "}
                        {(rec.part.unitAmount / 100).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </p>
                      <p className="mt-1 text-xs text-theme-50">{rec.reason}</p>
                      <p className="mt-1 text-[0.65rem] text-theme-40">
                        {rec.confidence} confidence · {rec.part.leadTime}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(rec.part.sku)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ember text-white hover:bg-ember/90"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-theme-10 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && query.trim()) {
                      const res = await fetch("/api/parts-advisor", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ query }),
                      });
                      const data = await res.json();
                      setRecommendations(data.recommendations || []);
                    }
                  }}
                  placeholder="Describe your robot and issue..."
                  className="flex-1 rounded-xl border border-theme-10 bg-white px-3 py-2 text-sm text-theme-primary placeholder:text-theme-30 focus:outline-none"
                />
                <button
                  onClick={async () => {
                    if (!query.trim()) return;
                    const res = await fetch("/api/parts-advisor", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ query }),
                    });
                    const data = await res.json();
                    setRecommendations(data.recommendations || []);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1db87a] text-white hover:bg-[#1db87a]/90"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
