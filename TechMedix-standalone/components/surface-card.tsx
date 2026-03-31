import type { ReactNode } from "react";

export function SurfaceCard({
  title,
  eyebrow,
  children,
  dark = false,
  elevated = false,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  dark?: boolean;
  elevated?: boolean;
}) {
  const base = dark
    ? "panel-dark p-6"
    : elevated
    ? "panel-elevated p-6"
    : "panel p-6";

  return (
    <section className={base}>
      <div className="mb-6 flex items-center justify-between gap-4 pb-5 border-b border-black/[0.05]" style={dark ? { borderColor: "rgba(255,255,255,0.06)" } : undefined}>
        <div>
          {eyebrow ? (
            <p className={dark ? "font-ui text-[0.68rem] uppercase tracking-[0.34em] text-white/40 font-medium" : "kicker"}>
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={
              dark
                ? "mt-2 font-header text-xl leading-tight text-white"
                : "mt-2 font-header text-xl leading-tight text-black"
            }
          >
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}
