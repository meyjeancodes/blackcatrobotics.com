"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Cpu,
  LayoutDashboard,
  LogOut,
  Network,
  Scan,
  Server,
  Settings2,
  Wrench,
  Zap,
} from "lucide-react";
import { createClient } from "../lib/supabase-browser";
import { ThemeToggle } from "./theme-toggle";
import type { SessionUser } from "./dashboard-shell";

// ─── Nav structure ────────────────────────────────────────────────────────────

interface NavChild {
  href: string;
  label: string;
}

interface NavGroup {
  href?: string;
  label: string;
  icon: React.ElementType;
  children?: NavChild[];
}

const NAV: NavGroup[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/ar-mode",
    label: "AR Mode",
    icon: Scan,
  },
  {
    label: "Maintenance",
    icon: Wrench,
    children: [
      { href: "/maintenance", label: "Jobs & Protocols" },
      { href: "/dispatch",    label: "Dispatch" },
      { href: "/operations",  label: "Operations" },
    ],
  },
  {
    label: "Knowledge",
    icon: BookOpen,
    children: [
      { href: "/knowledge",                  label: "Knowledge Hub" },
      { href: "/knowledge/certifications",   label: "Certifications" },
      { href: "/knowledge/simulations",      label: "Simulations" },
      { href: "/knowledge/study-guides",     label: "Study Guides" },
      { href: "/technicians/certifications", label: "Technician Certs" },
    ],
  },
  {
    label: "Fleet",
    icon: Cpu,
    children: [
      { href: "/nodes",  label: "Robots & Nodes" },
      { href: "/drones", label: "Drones" },
    ],
  },
  {
    label: "Infrastructure",
    icon: Server,
    children: [
      { href: "/habitat",    label: "Habitat" },
      { href: "/datacenter", label: "Data Centers" },
      { href: "/network",    label: "Network" },
      { href: "/energy",     label: "Energy & Grid" },
    ],
  },
  {
    href: "/billing",
    label: "Billing",
    icon: CreditCard,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings2,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function isGroupActive(group: NavGroup, pathname: string): boolean {
  if (group.href && (pathname === group.href || pathname.startsWith(`${group.href}/`))) return true;
  if (group.children) {
    return group.children.some(
      (c) => pathname === c.href || pathname.startsWith(`${c.href}/`)
    );
  }
  return false;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({ user }: { user?: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={clsx(
        "sticky top-0 h-screen flex flex-col bg-[#15161b] text-white border-r border-white/[0.07]",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[64px]" : "w-[272px]"
      )}
    >
      {/* Brand + collapse toggle */}
      <div
        className="flex items-center border-b p-4 shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-ui text-[0.56rem] uppercase tracking-[0.38em] text-white/30 font-medium truncate">
              BlackCat Robotics
            </p>
            <h1 className="font-header text-[1.55rem] leading-tight text-white truncate">
              TechMedix
            </h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={clsx(
            "flex items-center justify-center rounded-[10px] p-1.5 text-white/30 transition-all duration-200 hover:bg-white/[0.07] hover:text-white/70",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((group) => {
          const Icon = group.icon;
          const groupActive = isGroupActive(group, pathname);

          return (
            <div key={group.label} className={clsx("mb-0.5", !collapsed && group.children && "mb-2")}>
              {/* Group parent */}
              {group.href ? (
                <Link
                  href={group.href}
                  title={collapsed ? group.label : undefined}
                  className={clsx(
                    "flex items-center gap-3 rounded-[13px] px-3 py-2 font-ui text-[0.68rem] uppercase tracking-[0.14em] font-medium transition-all duration-200",
                    collapsed && "justify-center px-0",
                    groupActive
                      ? "bg-white/95 text-black shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                      : "text-white/55 hover:bg-white/[0.07] hover:text-white/90"
                  )}
                >
                  <Icon size={15} className="shrink-0" />
                  {!collapsed && <span>{group.label}</span>}
                </Link>
              ) : (
                <div
                  className={clsx(
                    "flex items-center gap-3 rounded-[13px] px-3 py-2 font-ui text-[0.68rem] uppercase tracking-[0.14em] font-medium text-white/30",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Icon size={15} className="shrink-0" />
                  {!collapsed && <span>{group.label}</span>}
                </div>
              )}

              {/* Children — hidden when collapsed */}
              {!collapsed && group.children && (
                <div className="mt-0.5 space-y-0.5 pl-3">
                  {group.children.map((child) => {
                    const childActive =
                      pathname === child.href || pathname.startsWith(`${child.href}/`);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={clsx(
                          "flex items-center rounded-[11px] py-1.5 pl-5 pr-3 font-ui text-[0.62rem] uppercase tracking-[0.12em] font-medium transition-all duration-200",
                          childActive
                            ? "bg-white/[0.10] text-white/90"
                            : "text-white/36 hover:bg-white/[0.06] hover:text-white/75"
                        )}
                      >
                        <span
                          className={clsx(
                            "mr-2.5 h-1 w-1 rounded-full shrink-0 transition-all duration-200",
                            childActive ? "bg-white/80 scale-125" : "bg-white/20"
                          )}
                        />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User + logout */}
      {user && (
        <div
          className="shrink-0 pt-3 px-2 pb-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3 px-2 py-1.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ember/[0.20] text-[0.60rem] font-semibold text-ember ring-1 ring-ember/[0.18]">
                  {initials(user.name, user.email)}
                </div>
                <div className="min-w-0 flex-1">
                  {user.name && (
                    <p className="truncate text-xs font-medium text-white/90">{user.name}</p>
                  )}
                  {user.email && (
                    <p className="truncate text-[0.60rem] text-white/36">{user.email}</p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <button
                  onClick={handleLogout}
                  className="flex flex-1 items-center gap-2 rounded-[12px] px-3 py-1.5 text-xs text-white/38 transition-all duration-200 hover:bg-white/[0.07] hover:text-white/80"
                >
                  <LogOut size={12} />
                  <span>Sign out</span>
                </button>
                <ThemeToggle />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center justify-center rounded-[12px] p-2 text-white/30 transition-all duration-200 hover:bg-white/[0.07] hover:text-white/70"
              >
                <LogOut size={14} />
              </button>
              <ThemeToggle />
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
