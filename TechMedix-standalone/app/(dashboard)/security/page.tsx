"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { KeyRound, Shield, Upload, Users } from "lucide-react";
import { SecurityAuditLog, RBACSettings, OTAUpdatePanel } from "@/components/security-audit-log";

function Section({ icon: Icon, eyebrow, title, children }: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="panel-elevated p-6">
      <div className="mb-5 flex items-center gap-3 pb-5 border-b border-theme-5">
        <Icon size={18} className="text-ember shrink-0" />
        <div>
          <p className="kicker">{eyebrow}</p>
          <h2 className="mt-1 font-header text-xl text-theme-primary">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Enterprise</p>
        <h1 className="mt-2 font-header text-3xl text-theme-primary">Security & Audit</h1>
        <p className="mt-1.5 font-body text-sm text-theme-soft">
          Append-only audit trail, RBAC user management, OTA update approvals, and session security.
        </p>
      </div>

      <Section icon={Shield} eyebrow="Privileged actions" title="Security Audit Log">
        <SecurityAuditLog />
      </Section>

      <Section icon={Users} eyebrow="Access control" title="User & Role Management">
        <RBACSettings />
      </Section>

      <Section icon={Upload} eyebrow="OTA firmware" title="Pending Updates">
        <OTAUpdatePanel />
      </Section>
    </div>
  );
}
