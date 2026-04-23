"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChatPanel } from "./components/ChatPanel";
import { DesignCanvas } from "./components/DesignCanvas";
import { QuotePanel } from "./components/QuotePanel";
import { IterationInput } from "./components/IterationInput";
import { SaveDesignButton } from "./components/SaveDesignButton";
import { CheckoutFlow } from "./components/CheckoutFlow";
import { Preview3D } from "./components/Preview3D";
import { useDesignSession, type DesignParams } from "./hooks/useDesignSession";
import { computeQuote, type Quote } from "./lib/quote-engine";
import { generateFloorPlan, floorPlanToSvg, type FloorPlan } from "./lib/floor-plan-generator";

function ParamsSummary({ params }: { params: Partial<DesignParams> }) {
  const entries = Object.entries(params).filter(([k]) => k !== "notes");
  if (!entries.length) {
    return (
      <div className="text-sm text-theme-40 italic">
        No parameters extracted yet. Start describing your home above.
      </div>
    );
  }

  const formatKey = (k: string) =>
    k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatValue = (k: string, v: unknown) => {
    if (k === "budget_max" && typeof v === "number") return `$${v.toLocaleString()}`;
    if (k === "sqft" && typeof v === "number") return `${v.toLocaleString()} sqft`;
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-[12px] border border-theme-6 bg-theme-3 px-3 py-2">
          <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-theme-35 mb-0.5">
            {formatKey(key)}
          </p>
          <p className="text-sm font-semibold text-theme-primary">{formatValue(key, value)}</p>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ step }: { step: string }) {
  const steps = [
    { id: "intake", label: "Intake" },
    { id: "designing", label: "Designing" },
    { id: "quoting", label: "Quote" },
    { id: "checkout", label: "Checkout" },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${i <= currentIdx ? "bg-ember" : "bg-theme-15"}`} />
          <span
            className={`font-ui text-[0.60rem] uppercase tracking-[0.16em] ${
              i <= currentIdx ? "text-ember font-medium" : "text-theme-30"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`h-px w-4 ${i < currentIdx ? "bg-ember/40" : "bg-theme-10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function HabitatDesignPage() {
  const { session, loading, setLoading, addMessage, setStep, reset } = useDesignSession();
  const [showDesign, setShowDesign] = useState(false);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [iterating, setIterating] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | undefined>();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Handle Stripe redirect back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setCheckoutSuccess(true);
      setStep("checkout");
      const id = params.get("design_id");
      if (id) setSavedDesignId(id);
    }
  }, [setStep]);

  const quote: Quote = useMemo(() => {
    return computeQuote({
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      stories: 1,
      style: "modern",
      ...session.params,
    });
  }, [session.params]);

  const plan: FloorPlan = useMemo(() => {
    return generateFloorPlan({
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      stories: 1,
      style: "modern",
      ...session.params,
    });
  }, [session.params]);

  const svg = useMemo(() => {
    if (!showDesign) return undefined;
    return floorPlanToSvg(plan);
  }, [plan, showDesign]);

  const hasCoreParams = useMemo(() => {
    const p = session.params;
    return p.bedrooms !== undefined && p.bathrooms !== undefined && p.sqft !== undefined;
  }, [session.params]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const nextMessages = [
        ...session.messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: trimmed },
      ];

      addMessage({ role: "user", content: trimmed });
      setLoading(true);

      try {
        const res = await fetch("/api/habitat-design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
        });
        const data = await res.json();

        addMessage({
          role: "assistant",
          content: data.reply ?? "No response received.",
          params: data.params,
        });

        if (data.params && (data.params.bedrooms || data.params.sqft)) {
          setStep("designing");
        }
      } catch {
        addMessage({
          role: "assistant",
          content: "Connection error. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    },
    [session.messages, loading, addMessage, setLoading, setStep]
  );

  const handleIterate = useCallback(
    async (text: string) => {
      if (iterating) return;
      setIterating(true);

      try {
        const res = await fetch("/api/habitat-design/iterate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_params: session.params,
            message: text,
          }),
        });
        const data = await res.json();

        if (data.changes && Object.keys(data.changes).length > 0) {
          const merged: Partial<DesignParams> = { ...session.params, ...data.changes };
          addMessage({
            role: "assistant",
            content: data.reasoning || "Design updated.",
            params: merged as DesignParams,
          });
          setSavedDesignId(undefined); // reset saved state on change
        } else {
          addMessage({
            role: "assistant",
            content: data.reasoning || "No changes were needed.",
          });
        }
      } catch {
        addMessage({
          role: "assistant",
          content: "Could not apply that change. Please try again.",
        });
      } finally {
        setIterating(false);
      }
    },
    [iterating, session.params, addMessage]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/habitat"
              className="text-xs text-theme-50 hover:text-ember transition-colors"
            >
              &larr; Back to HABITAT
            </Link>
          </div>
          <p className="kicker">BlackCat Robotics</p>
          <h1 className="mt-2 font-header text-3xl leading-tight text-theme-primary">
            HABITAT AI Designer
          </h1>
          <p className="mt-2 text-sm leading-6 text-theme-55 max-w-xl">
            Describe your ideal home in plain language. Our AI extracts every detail,
            generates a floor plan, and produces a real quote — all in one conversation.
          </p>
        </div>
        <button
          onClick={() => { reset(); setShowDesign(false); setSavedDesignId(undefined); setCheckoutSuccess(false); }}
          className="rounded-full border border-theme-10 px-4 py-2 text-xs text-theme-50 hover:border-ember/30 hover:text-ember transition-colors"
        >
          New Design
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <ProgressBar step={session.step} />
      </div>

      {/* Checkout success banner */}
      {checkoutSuccess && (
        <div className="mb-6 rounded-[16px] border border-moss/20 bg-moss/8 px-5 py-4 flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-moss" />
          <div>
            <p className="text-sm font-semibold text-theme-primary">Deposit received</p>
            <p className="text-xs text-theme-55">Your design is locked. We will be in touch within 24 hours.</p>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Chat */}
        <div className="lg:col-span-3 panel-elevated p-6">
          <ChatPanel messages={session.messages} loading={loading || iterating} onSend={sendMessage} />

          {hasCoreParams && !showDesign && (
            <div className="mt-5 pt-5 border-t border-theme-6 flex items-center justify-between">
              <p className="text-sm text-theme-55">
                Core parameters captured. Ready to generate your floor plan.
              </p>
              <button
                onClick={() => { setShowDesign(true); setStep("quoting"); }}
                className="rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e85d2a] transition-colors"
              >
                Generate Floor Plan
              </button>
            </div>
          )}

          {showDesign && (
            <div className="mt-5 pt-5 border-t border-theme-6">
              <p className="text-sm text-theme-55 mb-3">Want to tweak the design?</p>
              <IterationInput onIterate={handleIterate} loading={iterating} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="panel p-6">
            <p className="kicker">Live design brief</p>
            <h2 className="mt-1.5 font-header text-xl leading-tight text-theme-primary">
              Extracted Parameters
            </h2>
            <div className="mt-4">
              <ParamsSummary params={session.params} />
            </div>
            {session.params.notes && (
              <div className="mt-4 rounded-[12px] border border-theme-6 bg-theme-3 px-3 py-2">
                <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-theme-35 mb-0.5">
                  Notes
                </p>
                <p className="text-sm text-theme-primary leading-relaxed">{session.params.notes}</p>
              </div>
            )}
          </div>

          {showDesign && (
            <>
              <div className="panel-elevated p-6">
                {/* 2D / 3D toggle */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="kicker">Floor plan</p>
                    <h2 className="mt-1 font-header text-xl leading-tight text-theme-primary">
                      {viewMode === "2d" ? "Generated Layout" : "3D Preview"}
                    </h2>
                  </div>
                  <div className="flex items-center rounded-full border border-theme-10 bg-theme-3 p-1">
                    <button
                      onClick={() => setViewMode("2d")}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        viewMode === "2d"
                          ? "bg-ember text-white"
                          : "text-theme-55 hover:text-theme-primary"
                      }`}
                    >
                      2D
                    </button>
                    <button
                      onClick={() => setViewMode("3d")}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        viewMode === "3d"
                          ? "bg-ember text-white"
                          : "text-theme-55 hover:text-theme-primary"
                      }`}
                    >
                      3D
                    </button>
                  </div>
                </div>
                {viewMode === "2d" ? (
                  <DesignCanvas params={session.params} />
                ) : (
                  <Preview3D plan={plan} />
                )}
              </div>
              <div className="panel p-6 space-y-4">
                <QuotePanel params={session.params} />
                <div className="border-t border-theme-6 pt-4 space-y-3">
                  <SaveDesignButton
                    params={session.params}
                    svg={svg}
                    quote={quote}
                    onSaved={(id) => setSavedDesignId(id)}
                  />
                  <CheckoutFlow designId={savedDesignId} quote={quote} />
                </div>
              </div>
            </>
          )}

          {!showDesign && (
            <div className="panel-elevated p-6">
              <p className="kicker">Coming next</p>
              <h3 className="mt-1.5 font-header text-lg leading-tight text-theme-primary">
                Floor Plan & Quote
              </h3>
              <p className="mt-2 text-sm text-theme-55 leading-relaxed">
                Once your design brief is complete, HABITAT AI will generate a
                parametric floor plan and line-item quote. Save your design and
                lock it in with a deposit.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-moss" />
                <span className="font-ui text-[0.60rem] uppercase tracking-[0.16em] text-theme-50">
                  Phase 2 — In development
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
