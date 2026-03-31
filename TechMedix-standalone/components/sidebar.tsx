"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Activity,
  Award,
  CreditCard,
  Cpu,
  Layers,
  LayoutDashboard,
  LogOut,
  Network,
  Package,
  Scan,
  Server,
  Settings2,
  Users,
  Waypoints,
  Wrench,
  Zap,
} from "lucide-react";
import { createClient } from "../lib/supabase-browser";
import type { SessionUser } from "./dashboard-shell";

const links = [
  { href: "/dashboard",                    label: "Overview",       icon: LayoutDashboard },
  { href: "/ar-mode",                      label: "AR Mode",        icon: Scan },
  { href: "/maintenance",                  label: "Maintenance",    icon: Wrench },
  { href: "/certifications",              label: "Certifications", icon: Award },
  { href: "/acquire",                      label: "Acquire",        icon: Package },
  { href: "/nodes",                        label: "Nodes",          icon: Cpu },
  { href: "/technicians/certifications",   label: "Technicians",    icon: Users },
  { href: "/datacenter",                   label: "Data Centers",   icon: Server },
  { href: "/network",                      label: "Network",        icon: Network },
  { href: "/operations",                   label: "Operations",   icon: Waypoints },
  { href: "/fleet",                        label: "Fleet",        icon: Activity },
  { href: "/energy",                       label: "Energy",       icon: Zap },
  { href: "/grid",                         label: "Grid",         icon: Layers },
  { href: "/billing",                      label: "Billing",      icon: CreditCard },
  { href: "/settings",                     label: "Settings",     icon: Settings2 },
];

function initials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

export function Sidebar({ user }: { user?: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 h-screen flex w-full max-w-[272px] flex-col p-5 bg-[#15161b] text-white border-r border-white/[0.07]">
      {/* Brand */}
      <div className="mb-4 space-y-2 border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <p className="font-ui text-[0.62rem] uppercase tracking-[0.38em] text-white/30 font-medium">
          BlackCat Robotics
        </p>
        <div>
          <h1 className="font-header text-[1.75rem] leading-tight text-white">TechMedix</h1>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 rounded-[14px] px-4 py-2 font-ui text-[0.70rem] uppercase tracking-[0.14em] font-medium transition-all duration-200",
                active
                  ? "bg-white/95 text-black shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                  : "text-white/52 hover:bg-white/[0.07] hover:text-white/90"
              )}
            >
              <Icon size={15} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>


      {/* User + logout */}
      {user && (
        <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ember/[0.20] text-xs font-semibold text-ember ring-1 ring-ember/[0.18]">
              {initials(user.name, user.email)}
            </div>
            <div className="min-w-0 flex-1">
              {user.name && (
                <p className="truncate text-sm font-medium text-white/90">
                  {user.name}
                </p>
              )}
              {user.email && (
                <p className="truncate text-xs text-white/36">{user.email}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-sm text-white/42 transition-all duration-200 hover:bg-white/[0.07] hover:text-white/80"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
