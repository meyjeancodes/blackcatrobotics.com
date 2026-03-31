"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../../lib/supabase-browser";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? "Failed to create account.");
      setLoading(false);
      return;
    }

    const userId = authData.user.id;
    const slug = toSlug(companyName);

    // 2. Insert customer row
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: companyName,
        slug,
        billing_email: email,
        plan: "operator",
        status: "trial",
      })
      .select("id")
      .single();

    if (customerError || !customer) {
      setError(customerError?.message ?? "Failed to create organisation.");
      setLoading(false);
      return;
    }

    // 3. Insert user_profile row
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        user_id: userId,
        customer_id: customer.id,
        full_name: fullName,
        email,
        global_role: "customer_admin",
      });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 py-10">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-surface p-8 lg:p-10">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/35">
          New Account
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-white">
          Join TechMedix
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Set up your operator account in seconds.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-white/70">
            Full name
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-ember"
              placeholder="Jordan Smith"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white/70">
            Company name
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-ember"
              placeholder="Acme Robotics"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </label>

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
              placeholder="Min. 8 characters"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-white/40">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ember hover:opacity-80">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
