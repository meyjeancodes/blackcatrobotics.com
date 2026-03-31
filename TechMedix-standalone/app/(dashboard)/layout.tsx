import type { ReactNode } from "react";
import { DashboardShell } from "../../components/dashboard-shell";
import { createSupabaseServerClient } from "../../lib/supabase-server";

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  let user = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // cookies() may throw outside a request context (e.g. during static rendering)
  }

  const sessionUser = user
    ? {
        email: user.email ?? undefined,
        name: (user.user_metadata?.full_name as string | undefined) ?? undefined,
      }
    : undefined;

  return (
    <DashboardShell
      title="TechMedix Operations"
      description="Fleet health, alert pressure, technician dispatch, and customer operations for BlackCat Robotics."
      user={sessionUser}
    >
      {children}
    </DashboardShell>
  );
}
