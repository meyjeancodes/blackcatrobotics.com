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
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { createClient } from "../lib/supabase-browser";
import { ThemeToggle } from "./theme-toggle";
import type { SessionUser } from "./dashboard-shell";

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
  { href: "/dashboard",  label: "Overview",    icon: LayoutDashboard },
  { href: "/ar-mode",    label: "AR Mode",      icon: Scan },
  {
    label: "Maintenance", icon: Wrench,
    children: [
      { href: "/maintenance", label: "Jobs & Protocols" },
      { href: "/dispatch",    label: "Dispatch" },
      { href: "/operations",  label: "Operations" },
    ],
  },
  {
    label: "Knowledge", icon: BookOpen,
    children: [
      { href: "/knowledge",             label: "Knowledge Hub" },
      { href: "/knowledge/simulations", label: "Simulations" },
    ],
  },
  {
    label: "Technicians", icon: Users,
    children: [
      { href: "/technicians",              label: "Directory" },
      { href: "/technicians/certifications", label: "Certifications" },
      { href: "/technicians/marketplace",  label: "Marketplace" },
    ],
  },
  {
    label: "Fleet", icon: Cpu,
    children: [
      { href: "/nodes",  label: "Robots & Nodes" },
      { href: "/drones", label: "Drones" },
    ],
  },
  {
    label: "Infrastructure", icon: Server,
    children: [
      { href: "/habitat",    label: "Habitat" },
      { href: "/datacenter", label: "Data Centers" },
      { href: "/network",    label: "Network" },
      { href: "/energy",     label: "Energy & Grid" },
    ],
  },
  { href: "/billing",  label: "Billing",  icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

function initials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "BC";
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
        "relative h-full flex flex-col text-white overflow-hidden",
        "border-r border-white/[0.06]",
        "transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        collapsed ? "w-[60px]" : "w-[260px]"
      )}
      style={{
        background: "linear-gradient(180deg, #15161e 0%, #12131a 100%)",
      }}
    >
      {/* Ember ambient glow — top left */}
      <div
        className="pointer-events-none absolute -top-12 -left-12 h-40 w-40 rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(232,96,30,0.10) 0%, transparent 70%)" }}
      />

      {/* Brand */}
      <div className={clsx(
        "shrink-0 flex items-center border-b border-white/[0.06] px-4",
        collapsed ? "h-[60px] justify-center" : "h-[60px] gap-3"
      )}>
        {/* Logo mark */}
        <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-[9px] bg-ember/[0.14] ring-1 ring-ember/[0.22]">
          <Zap size={13} className="text-ember" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[0.44rem] uppercase tracking-[0.30em] text-white/28 leading-none mb-0.5">
              BlackCat Robotics
            </p>
            <p className="font-header text-[1.20rem] leading-none text-white tracking-[-0.01em]">
              TechMedix
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={clsx(
            "shrink-0 flex h-6 w-6 items-center justify-center rounded-[8px] text-white/28 transition hover:bg-white/[0.07] hover:text-white/60",
            collapsed && "mt-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-none">
        {NAV.map((group) => {
          const Icon = group.icon;
          const groupActive = isGroupActive(group, pathname);

          return (
            <div key={group.label} className={clsx(!collapsed && group.children && "mb-1")}>
              {/* Parent item */}
              {group.href ? (
                <Link
                  href={group.href}
                  title={collapsed ? group.label : undefined}
                  className={clsx(
                    "relative flex items-center rounded-[11px] px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] font-medium transition-all duration-200",
                    collapsed && "justify-center px-0 w-[44px] mx-auto",
                    groupActive
                      ? "bg-ember/[0.12] text-white ring-1 ring-ember/[0.22]"
                      : "text-white/55 hover:bg-white/[0.07] hover:text-white/90"
                  )}
                >
                  {groupActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-ember opacity-90" />
                  )}
                  <Icon size={14} className={clsx("shrink-0", !collapsed && "mr-2.5")} />
                  {!collapsed && <span>{group.label}</span>}
                </Link>
              ) : (
                <div
                  className={clsx(
                    "flex items-center px-3 py-1.5 font-mono text-[0.50rem] uppercase tracking-[0.18em] font-medium text-white/40",
                    collapsed && "justify-center px-0"
                  )}
                >
                  {collapsed ? (
                    <Icon size={14} className="text-white/40" />
                  ) : (
                    <span>{group.label}</span>
                  )}
                </div>
              )}

              {/* Children */}
              {!collapsed && group.children && (
                <div className="mt-0.5 space-y-0.5 pl-3 border-l border-white/[0.05] ml-3">
                  {group.children.map((child) => {
                    const childActive =
                      pathname === child.href || pathname.startsWith(`${child.href}/`);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={clsx(
                          "relative flex items-center rounded-[9px] py-1.5 pl-4 pr-3 font-mono text-[0.56rem] uppercase tracking-[0.10em] font-medium transition-all duration-200",
                          childActive
                            ? "bg-white/[0.09] text-white"
                            : "text-white/48 hover:bg-white/[0.05] hover:text-white/80"
                        )}
                      >
                        <span
                          className={clsx(
                            "mr-2.5 h-1 w-1 rounded-full shrink-0 transition-all duration-200",
                            childActive ? "bg-ember scale-125" : "bg-white/18"
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

      {/* Divider */}
      <div className="shrink-0 h-px bg-white/[0.06] mx-0" />

      {/* User footer */}
      <div className={clsx("shrink-0 px-2 py-3", collapsed && "flex flex-col items-center gap-2")}>
        {!collapsed ? (
          <>
            {user && (
              <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1 rounded-[11px] bg-white/[0.03]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ember/[0.16] text-[0.58rem] font-semibold text-ember ring-1 ring-ember/[0.20]">
                  {initials(user.name, user.email)}
                </div>
                <div className="min-w-0 flex-1">
                  {user.name && (
                    <p className="truncate font-mono text-[0.60rem] font-medium text-white/80">{user.name}</p>
                  )}
                  {user.email && (
                    <p className="truncate font-mono text-[0.52rem] text-white/30">{user.email}</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={handleLogout}
                className="flex flex-1 items-center gap-2 rounded-[10px] px-3 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.10em] text-white/32 transition hover:bg-white/[0.06] hover:text-white/70"
              >
                <LogOut size={11} />
                <span>Sign out</span>
              </button>
              <ThemeToggle />
            </div>
          </>
        ) : (
          <>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-[10px] text-white/28 transition hover:bg-white/[0.07] hover:text-white/65"
            >
              <LogOut size={13} />
            </button>
            <ThemeToggle />
          </>
        )}
      </div>
    </aside>
  );
}
