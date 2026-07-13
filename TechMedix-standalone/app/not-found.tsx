import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "#F0EFE8",
        color: "#0a0a0f",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path
          d="M8 34 H20 L25 22 L32 44 L38 30 L43 34 H56"
          stroke="#E84E1B"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="28" y="10" width="8" height="14" rx="2" fill="#0a0a0f" />
        <rect x="24" y="14" width="16" height="6" rx="2" fill="#0a0a0f" />
      </svg>
      <h1 style={{ fontSize: "64px", letterSpacing: "-0.04em", fontWeight: 800, margin: "24px 0 8px" }}>
        4<span style={{ color: "#E84E1B" }}>0</span>4
      </h1>
      <p style={{ fontSize: "16px", color: "#555", maxWidth: "420px", lineHeight: 1.6, marginBottom: "28px" }}>
        This page flew off the radar. Let&apos;s get you back to the flock.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          background: "#E84E1B",
          color: "#fff",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "14px",
          padding: "14px 28px",
          borderRadius: "8px",
        }}
      >
        Back to BlackCat Robotics
      </Link>
      <div style={{ marginTop: "40px", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", fontFamily: "monospace" }}>
        TechMedix — A BlackCat Robotics Company · Est. 2026
      </div>
    </main>
  );
}
