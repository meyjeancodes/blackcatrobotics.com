"use client";

import { useState, useMemo, useCallback } from "react";
import { STORE_PARTS, STORE_BUNDLES, STORE_CATALOG, StorePart, PartBundle, TIER_META, PRICE_MATCH_GUARANTEE, PLATFORM_META } from "@/lib/store/parts-catalog";

interface CartItem {
  item: StorePart | PartBundle;
  qty: number;
}

type TierFilter = "all" | "oem" | "direct" | "bundle";
type ViewMode = "grid" | "detail";

const CATEGORIES = [
  { id: "all", label: "All Platforms" },
  { id: "unitree-h1-2", label: "Unitree H1" },
  { id: "unitree-g1", label: "Unitree G1" },
  { id: "boston-dynamics-spot", label: "Boston Dynamics" },
  { id: "dji-agras-t50", label: "DJI Agras" },
];

const TRUST_BADGES = [
  { icon: "shield", text: "Verified Fitment" },
  { icon: "clock", text: "24h Ship" },
  { icon: "wrench", text: "TechMedix Included" },
  { icon: "dollar", text: "Price Match" },
];

export default function StorePage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [category, setCategory] = useState("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState<Array<{ part: StorePart; reason: string; confidence: string }>>([]);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const filteredItems = useMemo(() => {
    let list = STORE_CATALOG;
    if (category !== "all") list = list.filter((p) => p.platformId === category);
    if (tierFilter !== "all") list = list.filter((p) => p.tier === tierFilter);
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
  }, [category, search, sort, tierFilter]);

  const selectedItem = selectedSku ? STORE_CATALOG.find((p) => p.sku === selectedSku) : null;

  const addToCart = useCallback((sku: string) => {
    const item = STORE_CATALOG.find((p) => p.sku === sku);
    if (!item) return;
    setCart((prev) => {
      const existing = prev[sku];
      if (existing) return { ...prev, [sku]: { ...existing, qty: Math.min(existing.qty + 1, 50) } };
      return { ...prev, [sku]: { item, qty: 1 } };
    });
    setCartOpen(true);
  }, []);

  const setQty = useCallback((sku: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) { const next = { ...prev }; delete next[sku]; return next; }
      if (!prev[sku]) return prev;
      return { ...prev, [sku]: { ...prev[sku], qty: Math.min(qty, 50) } };
    });
  }, []);

  const removeFromCart = useCallback((sku: string) => {
    setCart((prev) => { const next = { ...prev }; delete next[sku]; return next; });
  }, []);

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.item.unitAmount * item.qty, 0);

  const checkout = async () => {
    if (cartItems.length === 0) return;
    const items = cartItems.map((i) => ({ sku: i.item.sku, quantity: i.qty }));
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.length === 1 ? items[0] : items }),
      });
      const data = await res.json();
      if (data.ok && data.url) window.location.href = data.url;
      else if (data.ok && data.urls) window.location.href = data.urls[0];
      else alert("Checkout unavailable: " + (data.error || "Please try again"));
    } catch { alert("Checkout unavailable. Please try again."); }
  };

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const openDetail = (sku: string) => setSelectedSku(sku);
  const closeDetail = () => setSelectedSku(null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <header className="mb-10">
        <a href="/" className="text-sm text-[#cc3d17] hover:text-[#cc3d17]/80 transition">
          ← Back to TechMedix
        </a>
        <h1 className="mt-2 font-header text-4xl tracking-[-0.04em] text-theme-primary">
          Aftermarket Parts
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-50">
          The world's most trusted source for robotic parts. Three tiers, one guarantee: the best price or we beat it by 10%. Every order includes free TechMedix monitoring.
        </p>

        {/* Trust Badges */}
        <div className="mt-4 flex flex-wrap gap-3">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.text} className="flex items-center gap-1.5 rounded-full bg-theme-5 px-3 py-1 text-[0.65rem] text-theme-50">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1db87a]" />
              {badge.text}
            </div>
          ))}
        </div>

        {PRICE_MATCH_GUARANTEE.enabled && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#1db87a]/10 px-3 py-1 text-xs text-[#1db87a]">
            <span className="font-semibold">✓ Price Match Guarantee</span>
            <span className="text-theme-40">— We beat any verified seller by 10%</span>
          </div>
        )}
      </header>

      {/* Comparison Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div />
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="text-xs text-theme-50 hover:text-theme-30 underline"
        >
          {showComparison ? "Hide" : "Show"} tier comparison
        </button>
      </div>

      {/* Tier Comparison */}
      {showComparison && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {(["oem", "direct", "bundle"] as const).map((tier) => {
            const meta = TIER_META[tier];
            const count = tier === "bundle" ? STORE_BUNDLES.length : STORE_PARTS.filter(p => p.tier === tier).length;
            return (
              <div key={tier} className="rounded-xl border border-theme-10 bg-white p-5">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="font-ui text-xs uppercase tracking-wider text-theme-40">{meta.label}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-theme-primary">{meta.badge}</p>
                <p className="mt-1 text-xs text-theme-50">{meta.description}</p>
                <div className="mt-3 flex items-center justify-between border-t border-theme-5 pt-3">
                  <span className="text-xs text-theme-40">{count} SKUs</span>
                  <span className="text-xs text-theme-40">from {formatPrice(tier === "bundle" ? Math.min(...STORE_BUNDLES.map(b => b.unitAmount)) : Math.min(...STORE_PARTS.filter(p => p.tier === tier).map(p => p.unitAmount)))}</span>
                </div>
                <button
                  onClick={() => { setTierFilter(tier); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="mt-3 w-full rounded-lg border border-theme-10 py-1.5 text-xs text-theme-50 hover:border-theme-20"
                >
                  Shop {meta.label}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tier Filter Pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {([["all", "All Tiers"], ["bundle", `Bundles (${STORE_BUNDLES.length})`], ["oem", "OEM Genuine"], ["direct", "Direct (Compatible)"]] as [TierFilter, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTierFilter(id)}
            className={`rounded-full border px-3 py-1.5 font-ui text-[0.6rem] uppercase tracking-[0.18em] transition ${
              tierFilter === id ? "border-ember bg-ember text-white" : "border-theme-10 text-theme-50 hover:border-theme-20"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`rounded-full border px-3 py-1.5 font-ui text-[0.6rem] uppercase tracking-[0.18em] transition ${
              category === cat.id ? "border-ember bg-ember text-white" : "border-theme-10 text-theme-50 hover:border-theme-20"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
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

      {/* Items Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const tier = TIER_META[item.tier];
          const isBundle = item.tier === "bundle";
          const bundle = isBundle ? (item as PartBundle) : null;

          return (
            <div
              key={item.sku}
              onClick={() => openDetail(item.sku)}
              className={`cursor-pointer rounded-2xl border bg-white p-5 transition hover:shadow-md ${
                isBundle ? "border-amber-300 ring-1 ring-amber-200" : "border-theme-10 hover:border-theme-20"
              }`}
            >
              {/* Tier Badge */}
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${tier.color}15`, color: tier.color }}
                >
                  {tier.badge}
                </span>
                {bundle && <span className="text-[0.6rem] font-bold text-amber-600">Save {bundle.savingsPct}%</span>}
              </div>

              {/* Image placeholder — real images go here */}
              <div className="mb-3 flex h-40 items-center justify-center rounded-xl bg-theme-5">
                <span className="text-xs text-theme-300">{item.name}</span>
              </div>

              <p className="font-ui text-[0.6rem] uppercase tracking-[0.18em] text-theme-40">
                {item.manufacturer}
              </p>
              <h3 className="mt-1 text-base font-semibold text-theme-primary">{item.name}</h3>
              <p className="mt-1 text-xs text-theme-50 line-clamp-2">{item.description}</p>

              {bundle && (
                <div className="mt-2 rounded-lg bg-amber-50 p-2">
                  <p className="text-[0.6rem] font-semibold text-amber-700">Includes:</p>
                  <ul className="mt-1 text-[0.6rem] text-amber-600">
                    {bundle.parts.slice(0, 3).map((sku) => (<li key={sku}>• {sku}</li>))}
                    {bundle.parts.length > 3 && <li>+{bundle.parts.length - 3} more</li>}
                  </ul>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-theme-primary">{formatPrice(item.unitAmount)}</span>
                <span className="text-[0.65rem] text-theme-40">{item.leadTime}</span>
              </div>
              <div className="mt-1 text-[0.6rem] text-theme-40">{item.warranty} warranty</div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); addToCart(item.sku); }}
                  className="flex-1 rounded-lg bg-ember px-4 py-2 font-ui text-xs uppercase tracking-widest text-white transition hover:bg-ember/90"
                >
                  {isBundle ? "Add Bundle" : "Add to Cart"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <p className="py-12 text-center text-theme-40">No parts match your search.</p>
      )}

      {/* Floating Cart Button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-white shadow-lg transition hover:bg-ember/90"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[0.6rem] font-bold text-ember">{cartCount}</span>
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

      {/* Product Detail Modal */}
      {selectedItem && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={closeDetail} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-10 px-5 py-4">
              <h3 className="font-header text-lg text-theme-primary">Part Details</h3>
              <button onClick={closeDetail} className="rounded-lg p-1.5 text-theme-40 hover:bg-theme-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-5">
              {/* Image */}
              <div className="mb-4 flex h-48 items-center justify-center rounded-xl bg-theme-5">
                <span className="text-sm text-theme-300">{selectedItem.name}</span>
              </div>

              {/* Tier Badge */}
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider" style={{ backgroundColor: `${TIER_META[selectedItem.tier].color}15`, color: TIER_META[selectedItem.tier].color }}>
                  {TIER_META[selectedItem.tier].badge}
                </span>
              </div>

              <p className="font-ui text-[0.6rem] uppercase tracking-[0.18em] text-theme-40">{selectedItem.manufacturer}</p>
              <h2 className="mt-1 text-xl font-semibold text-theme-primary">{selectedItem.name}</h2>
              <p className="mt-1 text-xs text-theme-40">{selectedItem.sku}</p>
              <p className="mt-3 text-sm text-theme-50">{selectedItem.description}</p>

              {/* Price */}
              <div className="mt-4 rounded-xl bg-theme-5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold text-theme-primary">{formatPrice(selectedItem.unitAmount)}</span>
                  <span className="text-xs text-theme-40">{selectedItem.leadTime}</span>
                </div>
                <div className="mt-1 text-xs text-theme-40">{selectedItem.warranty} warranty</div>
              </div>

              {/* Bundle breakdown */}
              {selectedItem.tier === "bundle" && (
                <div className="mt-4 rounded-xl bg-amber-50 p-4">
                  <p className="font-semibold text-amber-800">Bundle includes:</p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700">
                    {(selectedItem as PartBundle).parts.map((sku) => (
                      <li key={sku} className="flex items-center justify-between">
                        <span>• {sku}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t border-amber-200 pt-2">
                    <span className="text-sm font-semibold text-amber-800">You save</span>
                    <span className="text-sm font-bold text-amber-600">{formatPrice((selectedItem as PartBundle).savingsDollars)}</span>
                  </div>
                </div>
              )}

              {/* Platform */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-theme-40">Platform</span>
                <span className="font-medium text-theme-primary">{PLATFORM_META[selectedItem.platformId]?.name || selectedItem.platformId}</span>
              </div>

              {/* Source */}
              {"sourceUrl" in selectedItem && selectedItem.sourceUrl && (
                <div className="mt-2 text-xs text-theme-40">
                  Price source: <a href={selectedItem.sourceUrl} target="_blank" rel="noopener" className="underline hover:text-theme-300">verify</a>
                </div>
              )}

              {/* Add to Cart */}
              <div className="mt-6">
                <button
                  onClick={() => { addToCart(selectedItem.sku); closeDetail(); }}
                  className="w-full rounded-xl bg-ember px-4 py-3 font-ui text-sm uppercase tracking-widest text-white transition hover:bg-ember/90"
                >
                  {selectedItem.tier === "bundle" ? "Add Bundle to Cart" : "Add to Cart"}
                </button>
              </div>

              {/* Price Match */}
              <p className="mt-3 text-center text-[0.65rem] text-theme-40">
                Price match guarantee • Free TechMedix monitoring included
              </p>
            </div>
          </div>
        </>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-10 px-5 py-4">
              <h3 className="font-header text-lg text-theme-primary">Cart ({cartCount})</h3>
              <button onClick={() => setCartOpen(false)} className="rounded-lg p-1.5 text-theme-40 hover:bg-theme-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <p className="py-12 text-center text-sm text-theme-40">Your cart is empty.</p>
              ) : cartItems.map((cartItem) => (
                <div key={cartItem.item.sku} className="flex items-center gap-3 rounded-xl border border-theme-10 p-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-theme-5">
                    <span className="text-[0.5rem] text-theme-300">{cartItem.item.name.slice(0, 10)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-theme-primary truncate">{cartItem.item.name}</p>
                    <p className="text-xs text-theme-40">{cartItem.item.sku}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button onClick={() => setQty(cartItem.item.sku, cartItem.qty - 1)} className="flex h-6 w-6 items-center justify-center rounded border border-theme-10 text-xs text-theme-50 hover:bg-theme-5">-</button>
                      <span className="text-xs font-semibold text-theme-primary">{cartItem.qty}</span>
                      <button onClick={() => setQty(cartItem.item.sku, cartItem.qty + 1)} className="flex h-6 w-6 items-center justify-center rounded border border-theme-10 text-xs text-theme-50 hover:bg-theme-5">+</button>
                      <button onClick={() => removeFromCart(cartItem.item.sku)} className="ml-auto text-xs text-red-500 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-theme-primary">{formatPrice(cartItem.item.unitAmount * cartItem.qty)}</p>
                  </div>
                </div>
              ))}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-theme-10 px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-theme-50">Subtotal</span>
                  <span className="text-lg font-semibold text-theme-primary">{formatPrice(cartTotal)}</span>
                </div>
                <button onClick={checkout} className="w-full rounded-xl bg-ember px-4 py-3 font-ui text-sm uppercase tracking-widest text-white transition hover:bg-ember/90">
                  Checkout with Stripe
                </button>
                <p className="mt-2 text-center text-[0.65rem] text-theme-40">Secure payment · Free TechMedix monitoring</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Parts Advisor Modal */}
      {advisorOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => { setAdvisorOpen(false); setRecommendations([]); setQuery(""); }} />
          <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-2xl border border-theme-10 bg-theme-18 shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1db87a]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                </div>
                <div>
                  <p className="font-header text-sm text-theme-primary">Parts Advisor</p>
                  <p className="font-ui text-[0.5rem] uppercase tracking-widest text-theme-40">Find the right part</p>
                </div>
              </div>
              <button onClick={() => { setAdvisorOpen(false); setRecommendations([]); setQuery(""); }} className="rounded-lg p-1.5 text-theme-40 hover:bg-theme-10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {recommendations.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-theme-50">Tell me about your robot and the issue you're seeing.</p>
                  <div className="flex flex-wrap gap-2">
                    {["Unitree H1 knee overheating", "H1 battery draining fast", "Spot leg actuator"].map((s) => (
                      <button key={s} onClick={async () => { setQuery(s); const res = await fetch("/api/parts-advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: s }) }); const data = await res.json(); setRecommendations(data.recommendations || []); }} className="rounded-full border border-theme-10 px-3 py-1.5 text-xs text-theme-50 hover:border-theme-20">{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {recommendations.map((rec) => (
                <div key={rec.part.sku} className="rounded-xl border border-theme-10 bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-theme-primary">{rec.part.name}</p>
                      <p className="text-xs text-theme-40">{rec.part.sku} · {formatPrice(rec.part.unitAmount)}</p>
                      <p className="mt-1 text-xs text-theme-50">{rec.reason}</p>
                      <p className="mt-1 text-[0.65rem] text-theme-40">{rec.confidence} confidence · {rec.part.leadTime}</p>
                    </div>
                    <button onClick={() => addToCart(rec.part.sku)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ember text-white hover:bg-ember/90">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-theme-10 p-3">
              <div className="flex items-center gap-2">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={async (e) => { if (e.key === "Enter" && query.trim()) { const res = await fetch("/api/parts-advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) }); const data = await res.json(); setRecommendations(data.recommendations || []); } }} placeholder="Describe your robot and issue..." className="flex-1 rounded-xl border border-theme-10 bg-white px-3 py-2 text-sm text-theme-primary placeholder:text-theme-30 focus:outline-none" />
                <button onClick={async () => { if (!query.trim()) return; const res = await fetch("/api/parts-advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) }); const data = await res.json(); setRecommendations(data.recommendations || []); }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1db87a] text-white hover:bg-[#1db87a]/90">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
