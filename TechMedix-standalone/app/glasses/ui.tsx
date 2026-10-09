/**
 * TechMedix Glasses web app — glanceable UI primitives.
 * Built for a monocular ~20° display: huge type, high contrast, big targets.
 */
import type { ReactNode } from "react";

export const theme = {
  bg: "#0a0a0f",
  panel: "#14141c",
  text: "#ffffff",
  mut: "rgba(255,255,255,.6)",
  fire: "#ff6b35",
  fireDim: "#cc3d17",
  ok: "#4ade80",
  warn: "#fbbf24",
  crit: "#f87171",
};

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: theme.bg,
        color: theme.text,
        padding: "28px 24px 40px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, Menlo, monospace",
        fontSize: 15,
        letterSpacing: ".3em",
        textTransform: "uppercase",
        color: theme.fire,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1, margin: "0 0 24px" }}>
      {children}
    </h1>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: theme.panel,
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 20,
        padding: "24px 22px",
        marginBottom: 18,
      }}
    >
      {children}
    </div>
  );
}

export function BigButton({
  children,
  onClick,
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const style = {
    display: "block",
    width: "100%",
    background: theme.fireDim,
    color: "#fff",
    border: "none",
    borderRadius: 18,
    padding: "22px",
    fontSize: 26,
    fontWeight: 700,
    textAlign: "center" as const,
    textDecoration: "none",
    cursor: "pointer",
    marginBottom: 14,
  };
  if (href) {
    return (
      <a href={href} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const style = {
    display: "block",
    width: "100%",
    background: "transparent",
    color: theme.text,
    border: "2px solid rgba(255,255,255,.25)",
    borderRadius: 18,
    padding: "20px",
    fontSize: 24,
    fontWeight: 600,
    textAlign: "center" as const,
    textDecoration: "none",
    cursor: "pointer",
    marginBottom: 14,
  };
  if (href) {
    return (
      <a href={href} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: "block", marginBottom: 20 }}>
      <div style={{ fontSize: 20, color: theme.mut, marginBottom: 10 }}>{label}</div>
      <input
        {...props}
        style={{
          width: "100%",
          background: theme.panel,
          border: "1px solid rgba(255,255,255,.2)",
          borderRadius: 16,
          padding: "20px 18px",
          fontSize: 26,
          color: theme.text,
          outline: "none",
        }}
      />
    </label>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "rgba(248,113,113,.12)",
        border: "1px solid rgba(248,113,113,.4)",
        color: theme.crit,
        borderRadius: 16,
        padding: "18px",
        fontSize: 22,
        marginBottom: 18,
      }}
    >
      {message}
    </div>
  );
}

export function severityColor(sev: string): string {
  if (sev === "critical") return theme.crit;
  if (sev === "warning") return theme.warn;
  return theme.mut;
}
