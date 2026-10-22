"use client";

import { useState } from "react";
import { SurfaceCard } from "../../../components/surface-card";

export default function ConnectMusePage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/muse/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "techmedix-user" }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setToken(data.token);
    } catch (e: any) {
      setError(e?.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SurfaceCard title="Connect Muse" eyebrow="AI Assistant Integration">
        <p className="text-sm text-theme-50 mb-4">
          Connect your TechMedix account to Muse (Claude) to let an AI assistant
          query your parts catalog, fleet status, and more.
        </p>

        {!token && (
          <button
            onClick={connect}
            disabled={loading}
            className="rounded-xl bg-theme-10 px-4 py-2 text-sm font-medium text-theme-primary hover:bg-theme-20 disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect Muse"}
          </button>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}

        {token && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-green-600 font-medium">Connected! Copy your token:</p>
            <code className="block rounded-lg bg-theme-5 p-3 text-xs break-all">{token}</code>
            <p className="text-xs text-theme-40">
              Paste this token into Muse&apos;s Secure Credentials Store as your connector token.
              Manage your connection at{" "}
              <a href="https://blackcatrobotics.com" className="underline">blackcatrobotics.com</a>.
            </p>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}