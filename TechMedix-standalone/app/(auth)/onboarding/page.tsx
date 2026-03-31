"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase-browser";

const PLATFORMS = [
  "Unitree G1",
  "Unitree H1-2",
  "Boston Dynamics Spot",
  "DJI Agras T50",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 data
  const [companyName, setCompanyName] = useState("");
  const [plan, setPlan] = useState("operator");

  // Step 2 data
  const [robotName, setRobotName] = useState("");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [serialNumber, setSerialNumber] = useState("");
  const [location, setLocation] = useState("");

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("customer_id")
        .eq("user_id", user.id)
        .single();

      if (profile?.customer_id) {
        setCustomerId(profile.customer_id);
      }

      // Pre-fill company name from customers table
      if (profile?.customer_id) {
        const { data: customer } = await supabase
          .from("customers")
          .select("name, plan")
          .eq("id", profile.customer_id)
          .single();

        if (customer) {
          setCompanyName(customer.name ?? "");
          setPlan(customer.plan ?? "operator");
        }
      }
    }

    loadProfile();
  }, [router]);

  async function handleAddRobot(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) return;

    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: robotError } = await supabase.from("robots").insert({
      customer_id: customerId,
      name: robotName,
      platform,
      serial_number: serialNumber,
      location,
      status: "online",
    });

    if (robotError) {
      setError(robotError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 py-10">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-3">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
                  s === step
                    ? "bg-ember text-white"
                    : s < step
                    ? "bg-ember/30 text-ember"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className={`h-px w-12 transition ${
                    step > s ? "bg-ember/40" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <section className="rounded-[28px] border border-white/10 bg-surface p-8 lg:p-10">
          {step === 1 && (
            <>
              <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/35">
                Step 1 of 2
              </p>
              <h1 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-white">
                Welcome to TechMedix
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/50">
                Confirm your organisation details before setting up your fleet.
              </p>

              <div className="mt-8 grid gap-5">
                <div className="grid gap-2 text-sm font-medium text-white/70">
                  <span>Company name</span>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                    {companyName || <span className="text-white/30">Loading…</span>}
                  </div>
                </div>

                <div className="grid gap-2 text-sm font-medium text-white/70">
                  <span>Plan</span>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="capitalize text-white">{plan}</span>
                    <span className="ml-2 rounded-full border border-ember/30 bg-ember/10 px-2 py-0.5 text-xs text-ember">
                      Trial
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Continue
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white/80"
                >
                  Skip
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/35">
                Step 2 of 2
              </p>
              <h1 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-white">
                Add your first robot
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/50">
                Register a robot to start monitoring its health and dispatching technicians.
              </p>

              <form onSubmit={handleAddRobot} className="mt-8 grid gap-5">
                <label className="grid gap-2 text-sm font-medium text-white/70">
                  Robot name
                  <input
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-ember"
                    placeholder="Unit Alpha-1"
                    type="text"
                    value={robotName}
                    onChange={(e) => setRobotName(e.target.value)}
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-white/70">
                  Platform
                  <select
                    className="rounded-2xl border border-white/10 bg-surface px-4 py-3 text-white outline-none transition focus:border-ember"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-white/70">
                  Serial number
                  <input
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-ember"
                    placeholder="SN-2024-001"
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-white/70">
                  Location
                  <input
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-ember"
                    placeholder="Warehouse A, Chicago"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </label>

                {error && (
                  <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white/80"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Adding robot…" : "Add robot & go to dashboard"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white/80"
                  >
                    Skip
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
