"use client";

import { useState } from "react";
import Link from "next/link";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xreyrndq";

/**
 * Conversion block for insights pages. Closes the loop: a reader landed on a
 * failure-mode page (high-intent SEO traffic) → capture their email + push to
 * a booked call. Posts to the same live Formspree endpoint as the homepage,
 * tagged interest_type=insights so sales can route it.
 */
export default function InsightCTA({
  platformName,
  platformId,
}: {
  platformName?: string;
  platformId?: string;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("err");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name || "—",
          email,
          interest_type: "insights",
          source: "insights_page",
          platform: platformId || "general",
          _subject: `Insights lead — ${platformName || "platform diagnostics"} — ${email}`,
        }),
      });
      if (res.ok) {
        setStatus("ok");
      } else {
        setStatus("err");
      }
    } catch {
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <section className="rounded-2xl border border-theme-12 bg-theme-4 p-8 text-center">
        <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">
          You&apos;re on the list.
        </h2>
        <p className="mt-2 max-w-md mx-auto text-sm leading-6 text-theme-52">
          We&apos;ll send the {platformName ? `${platformName} ` : ""}failure-mode brief and a link to
          book a free 30-minute diagnostic review.
        </p>
        <Link
          href="/book"
          className="mt-4 inline-flex items-center rounded-full bg-theme-fire px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-theme-fire/90"
        >
          Book your free call →
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-theme-12 bg-theme-4 p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="font-ui text-[0.6rem] uppercase tracking-[0.14em] text-theme-fire">
            Don&apos;t wait for it to break
          </p>
          <h2 className="mt-2 font-header text-2xl tracking-[-0.02em] text-theme-primary">
            Get the {platformName ? `${platformName} ` : ""}failure-mode brief
          </h2>
          <p className="mt-2 text-sm leading-6 text-theme-52">
            Free 30-minute diagnostic review with a BlackCat engineer. We&apos;ll show you exactly which
            signatures apply to your fleet and how the 48-hour alert window works.
          </p>
        </div>
        <form onSubmit={submit} className="w-full max-w-sm shrink-0 space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className="w-full rounded-full border border-theme-12 bg-white px-4 py-2.5 text-sm text-theme-primary outline-none focus:border-theme-fire"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email"
            className="w-full rounded-full border border-theme-12 bg-white px-4 py-2.5 text-sm text-theme-primary outline-none focus:border-theme-fire"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full bg-theme-fire px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-theme-fire/90 disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Get the brief + book free call"}
          </button>
          {status === "err" && (
            <p className="text-center text-xs text-red-600">Enter a valid email or book directly.</p>
          )}
          <Link
            href="/book"
            className="block text-center font-ui text-[0.58rem] uppercase tracking-[0.12em] text-theme-40 hover:text-theme-primary"
          >
            or book a paid consultation →
          </Link>
        </form>
      </div>
    </section>
  );
}
