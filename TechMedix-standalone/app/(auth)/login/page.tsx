"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../../lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 py-10">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-surface p-8 lg:p-10">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/35">
          Operator Access
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-white">
          Sign in to TechMedix
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/50">
          BlackCat Robotics fleet intelligence platform.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-white/70">
            Work email
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-ember"
              placeholder="ops@acmerobotics.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white/70">
            Password
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-ember"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-white/40">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-ember hover:opacity-80">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
