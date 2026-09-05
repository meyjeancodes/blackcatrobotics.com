"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email || "" });
        setName((data.user.user_metadata as Record<string, string>)?.name || "");
        setCompany((data.user.user_metadata as Record<string, string>)?.company || "");
        setPhone((data.user.user_metadata as Record<string, string>)?.phone || "");
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    // In production, this would update the user profile
    // For now, just simulate a save
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-theme-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10">
        <Link href="/account" className="text-sm text-[#cc3d17] hover:text-[#cc3d17]/80">
          ← Back to Account
        </Link>
        <h1 className="mt-2 font-header text-4xl tracking-[-0.04em] text-theme-primary">
          Account Settings
        </h1>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-theme-10 bg-white p-6">
          <h2 className="font-header text-lg text-theme-primary">Profile Information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-theme-40">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-lg border border-theme-10 bg-theme-5 px-3 py-2 text-sm text-theme-40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-theme-40">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-theme-10 px-3 py-2 text-sm text-theme-primary focus:border-theme-20 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-theme-40">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border border-theme-10 px-3 py-2 text-sm text-theme-primary focus:border-theme-20 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-theme-40">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-theme-10 px-3 py-2 text-sm text-theme-primary focus:border-theme-20 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-theme-10 bg-white p-6">
          <h2 className="font-header text-lg text-theme-primary">Preferences</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-theme-20" />
              <span className="text-sm text-theme-primary">Email me order updates</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-theme-20" />
              <span className="text-sm text-theme-primary">Email me TechMedix alerts</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-theme-20" />
              <span className="text-sm text-theme-primary">Email me promotions</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-ember px-6 py-2.5 font-ui text-xs uppercase tracking-widest text-white transition hover:bg-ember/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {success && <span className="text-sm text-[#1db87a]">Saved!</span>}
        </div>
      </form>

      <div className="mt-8 border-t border-theme-10 pt-8">
        <button
          onClick={handleSignOut}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
