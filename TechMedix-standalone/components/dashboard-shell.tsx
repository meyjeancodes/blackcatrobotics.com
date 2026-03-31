import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export interface SessionUser {
  email?: string;
  name?: string;
}

export function DashboardShell({
  title,
  description,
  user,
  children,
}: {
  title: string;
  description: string;
  user?: SessionUser;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px]">
      <div className="hidden shrink-0 lg:block">
        <Sidebar user={user} />
      </div>
      <main className="min-w-0 flex-1 space-y-6 px-4 py-8 lg:px-6">
        <header
          className="panel px-7 py-6"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(252,251,248,0.82) 100%)",
          }}
        >
          <p className="kicker">Operator Console</p>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-header text-[2.4rem] leading-tight tracking-[-0.02em] text-black">
                {title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-black/55">{description}</p>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
