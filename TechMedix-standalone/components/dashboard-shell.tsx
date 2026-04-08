import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export interface SessionUser {
  email?: string;
  name?: string;
}

export function DashboardShell({
  user,
  children,
}: {
  title?: string;
  description?: string;
  user?: SessionUser;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px]">
      <div className="hidden shrink-0 lg:flex">
        <Sidebar user={user} />
      </div>
      <main className="min-w-0 flex-1 px-4 py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
