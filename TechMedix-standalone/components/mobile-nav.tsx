"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

interface NavChild {
  href: string;
  label: string;
}

interface NavGroup {
  href?: string;
  label: string;
  children?: NavChild[];
}

const NAV: NavGroup[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/ar-mode", label: "AR Mode" },
  {
    label: "Maintenance",
    children: [
      { href: "/maintenance", label: "Jobs & Protocols" },
      { href: "/dispatch", label: "Dispatch" },
      { href: "/operations", label: "Operations" },
    ],
  },
  {
    label: "Knowledge",
    children: [
      { href: "/knowledge", label: "Knowledge Hub" },
      { href: "/knowledge/certifications", label: "Certifications" },
      { href: "/knowledge/simulations", label: "Simulations" },
      { href: "/knowledge/study-guides", label: "Study Guides" },
      { href: "/technicians/certifications", label: "Technician Certs" },
    ],
  },
  {
    label: "Fleet",
    children: [
      { href: "/nodes", label: "Robots & Nodes" },
      { href: "/drones", label: "Drones" },
    ],
  },
  {
    label: "Infrastructure",
    children: [
      { href: "/habitat", label: "Habitat" },
      { href: "/datacenter", label: "Data Centers" },
      { href: "/network", label: "Network" },
      { href: "/energy", label: "Energy & Grid" },
    ],
  },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

function isActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger button — visible below lg */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[150] flex items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] p-2.5 shadow-[var(--shadow-panel)] backdrop-blur"
        aria-label="Open navigation"
      >
        <Menu size={18} className="text-[var(--ink)]" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[160] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out panel */}
      <div
        className={clsx(
          "fixed left-0 top-0 z-[170] h-full w-[280px] bg-[#15161b] text-white border-r border-white/[0.07] transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] p-4">
          <div>
            <p className="font-ui text-[0.56rem] uppercase tracking-[0.38em] text-white/30 font-medium">
              BlackCat Robotics
            </p>
            <h1 className="font-header text-[1.55rem] leading-tight text-white truncate">
              TechMedix
            </h1>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-[10px] p-1.5 text-white/30 transition hover:bg-white/[0.07] hover:text-white/70"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map((group) => (
            <div key={group.label} className="mb-0.5">
              {group.href ? (
                <Link
                  href={group.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 rounded-[13px] px-3 py-2 font-ui text-[0.68rem] uppercase tracking-[0.14em] font-medium transition-all duration-200",
                    isActive(group.href, pathname)
                      ? "bg-white/95 text-black shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                      : "text-white/55 hover:bg-white/[0.07] hover:text-white/90"
                  )}
                >
                  {group.label}
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-[13px] px-3 py-2 font-ui text-[0.68rem] uppercase tracking-[0.14em] font-medium text-white/30">
                  {group.label}
                </div>
              )}

              {group.children && (
                <div className="mt-0.5 space-y-0.5 pl-3">
                  {group.children.map((child) => {
                    const childActive =
                      pathname === child.href || pathname.startsWith(`${child.href}/`);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
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
          ))}
        </nav>
      </div>
    </>
  );
}
