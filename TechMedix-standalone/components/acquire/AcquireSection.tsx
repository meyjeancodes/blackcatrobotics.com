"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Bot, X } from "lucide-react";
import {
  ACQUIRE_PRODUCTS,
  CATEGORY_LABELS,
  type AcquireCategory,
  type AcquireProduct,
} from "@/lib/acquire/data";

const CATEGORY_ORDER: AcquireCategory[] = [
  "humanoid",
  "quadruped",
  "drone",
  "ebike",
  "arm",
  "cleaning",
  "supplier",
];

const PRICE_BUCKETS = [
  { id: "all", label: "Any price" },
  { id: "under-10k", label: "Under $10k" },
  { id: "10k-50k", label: "$10k – $50k" },
  { id: "50k-150k", label: "$50k – $150k" },
  { id: "over-150k", label: "$150k+" },
  { id: "contact", label: "Contact for pricing" },
] as const;

type PriceBucket = (typeof PRICE_BUCKETS)[number]["id"];

function matchesBucket(priceValue: number | null, bucket: PriceBucket) {
  if (bucket === "all") return true;
  if (bucket === "contact") return priceValue === null;
  if (priceValue === null) return false;
  if (bucket === "under-10k") return priceValue < 10_000;
  if (bucket === "10k-50k") return priceValue >= 10_000 && priceValue < 50_000;
  if (bucket === "50k-150k") return priceValue >= 50_000 && priceValue < 150_000;
  if (bucket === "over-150k") return priceValue >= 150_000;
  return true;
}

const badgeColorClass: Record<string, string> = {
  green: "border-moss/30 bg-moss/10 text-moss",
  gold: "border-gold/30 bg-gold/10 text-gold",
  indigo: "border-indigo-400/30 bg-indigo-400/10 text-indigo-300",
};

function ProductImage({ product }: { product: AcquireProduct }) {
  if (product.image) {
    return (
      <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-white/[0.02]">
        <Image
          src={product.image}
          alt={product.imageAlt ?? product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 320px"
        />
        {product.badge ? (
          <span
            className={`absolute right-2.5 top-2.5 rounded-full border px-2.5 py-1 font-ui text-[0.6rem] uppercase tracking-[0.15em] ${
              badgeColorClass[product.badgeColor ?? ""] ?? "border-white/20 bg-white/10 text-white/70"
            }`}
          >
            {product.badge}
          </span>
        ) : null}
      </div>
    );
  }

  // Fallback for products without local product photography yet.
  return (
    <div className="relative flex h-40 w-full items-center justify-center rounded-t-2xl bg-white/[0.02]">
      <Bot size={40} className="text-white/15" />
      {product.badge ? (
        <span
          className={`absolute right-2.5 top-2.5 rounded-full border px-2.5 py-1 font-ui text-[0.6rem] uppercase tracking-[0.15em] ${
            badgeColorClass[product.badgeColor ?? ""] ?? "border-white/20 bg-white/10 text-white/70"
          }`}
        >
          {product.badge}
        </span>
      ) : null}
    </div>
  );
}

function ProductCard({
  product,
  onQuote,
}: {
  product: AcquireProduct;
  onQuote: (product: AcquireProduct) => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] transition hover:border-white/[0.14] hover:bg-white/[0.045]">
      <ProductImage product={product} />

      <div className="flex flex-1 flex-col p-5">
        {product.ribbon ? (
          <span className="mb-2 inline-block w-fit rounded-full bg-ember/15 px-2.5 py-0.5 font-ui text-[0.6rem] uppercase tracking-[0.15em] text-ember">
            {product.ribbon}
          </span>
        ) : null}

        {product.maker ? (
          <div className="mb-1 text-xs text-white/40">
            {product.makerUrl ? (
              <a
                href={product.makerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/70"
              >
                {product.maker}
              </a>
            ) : (
              product.maker
            )}
          </div>
        ) : null}

        <h3 className="font-header text-lg leading-tight text-white">{product.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-white/45">{product.description}</p>

        {product.specs.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/[0.06] pt-4">
            {product.specs.map((spec) => (
              <div key={spec.label}>
                <div className="font-ui text-[0.6rem] uppercase tracking-[0.15em] text-white/30">
                  {spec.label}
                </div>
                <div className="mt-0.5 text-sm text-white/75">{spec.value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {product.bundle ? (
          <p className="mt-4 font-ui text-[0.65rem] leading-snug text-white/35">{product.bundle}</p>
        ) : null}

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
          <div>
            <div className="font-header text-xl text-white">{product.priceLabel}</div>
            {product.priceSub ? (
              <div className="mt-0.5 text-[0.7rem] text-white/35">{product.priceSub}</div>
            ) : null}
          </div>

          {product.ctaHref ? (
            <a
              href={product.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-ember px-4 py-2 text-xs font-semibold text-white transition hover:bg-ember/90"
            >
              {product.ctaText}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onQuote(product)}
              className="shrink-0 rounded-full bg-ember px-4 py-2 text-xs font-semibold text-white transition hover:bg-ember/90"
            >
              {product.ctaText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuoteModal({
  product,
  onClose,
}: {
  product: AcquireProduct;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email.includes("@")) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          message,
          interest_type: "Acquire quote request",
          product: product.name,
          source: "blackcat_website",
          _subject: `Acquire Quote — ${product.name} — ${name}`,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14151b] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-ui text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Acquire</p>
            <h3 className="mt-1 font-header text-lg text-white">Request a Quote</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {status === "sent" ? (
          <div className="py-6 text-center">
            <p className="font-header text-base text-white">Quote request sent.</p>
            <p className="mt-2 text-sm text-white/45">
              We&apos;ll prepare your quote for the {product.name} and reach out within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-white/45">
              We&apos;ll source, configure, and deliver the <strong className="text-white/70">{product.name}</strong>{" "}
              with TechMedix pre-activated.
            </p>
            <div>
              <label className="mb-1 block font-ui text-[0.65rem] uppercase tracking-[0.15em] text-white/40">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-ui text-[0.65rem] uppercase tracking-[0.15em] text-white/40">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-ui text-[0.65rem] uppercase tracking-[0.15em] text-white/40">
                Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your Company"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-ember/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-ui text-[0.65rem] uppercase tracking-[0.15em] text-white/40">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Quantity, timeline, deployment context..."
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-ember/50 focus:outline-none"
              />
            </div>

            {status === "error" ? (
              <p className="text-xs text-red-400">Something went wrong. Please try again.</p>
            ) : null}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-2 w-full rounded-full bg-ember px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ember/90 disabled:opacity-50"
            >
              {status === "submitting" ? "Sending..." : "Submit Quote Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function AcquireSection() {
  const [activeCategory, setActiveCategory] = useState<AcquireCategory>("humanoid");
  const [priceBucket, setPriceBucket] = useState<PriceBucket>("all");
  const [quoteProduct, setQuoteProduct] = useState<AcquireProduct | null>(null);

  const filtered = useMemo(
    () =>
      ACQUIRE_PRODUCTS.filter(
        (p) => p.category === activeCategory && matchesBucket(p.priceValue, priceBucket)
      ),
    [activeCategory, priceBucket]
  );

  return (
    <section id="acquire" className="px-6 py-20 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <p className="font-ui text-[0.7rem] uppercase tracking-[0.25em] text-ember">Acquire</p>
        <h2 className="mt-2 font-header text-3xl text-white sm:text-4xl">
          Browse the catalog. We handle sourcing.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
          Every platform below ships with TechMedix onboarding — request a quote and we source,
          configure, and deliver with fleet monitoring pre-activated.
        </p>

        {/* Category tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-2 font-ui text-xs uppercase tracking-[0.1em] transition ${
                activeCategory === cat
                  ? "border-ember bg-ember/15 text-ember"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Price filter */}
        <div className="mt-3 flex flex-wrap gap-2">
          {PRICE_BUCKETS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setPriceBucket(b.id)}
              className={`rounded-full px-3 py-1.5 font-ui text-[0.68rem] uppercase tracking-[0.08em] transition ${
                priceBucket === b.id
                  ? "bg-white/15 text-white"
                  : "text-white/35 hover:text-white/65"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onQuote={setQuoteProduct} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-10 text-center text-sm text-white/40">
            No platforms in this price range yet — try a different filter.
          </div>
        )}
      </div>

      {quoteProduct ? (
        <QuoteModal product={quoteProduct} onClose={() => setQuoteProduct(null)} />
      ) : null}
    </section>
  );
}
