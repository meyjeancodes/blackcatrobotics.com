"use client";

import { useState, useCallback, useEffect } from "react";

export type SecurityActionType =
  | "remote-control-start"
  | "remote-control-end"
  | "ota-update-pushed"
  | "ota-rollback"
  | "permission-change"
  | "api-key-rotation"
  | "emergency-stop"
  | "session-timeout";

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  action: SecurityActionType;
  operator_id: string;
  robot_id: string | null;
  detail: string;
  checksum?: string;
}

const SEED: SecurityAuditEntry[] = [
  { id: "sec_001", timestamp: "2026-05-06T07:55:00Z", action: "remote-control-start", operator_id: "OP-012", robot_id: "robot_atlas_7f4a",    detail: "Remote session opened — duration 8m 22s" },
  { id: "sec_002", timestamp: "2026-05-06T08:05:00Z", action: "remote-control-end",   operator_id: "OP-012", robot_id: "robot_atlas_7f4a",    detail: "Session closed cleanly" },
  { id: "sec_003", timestamp: "2026-05-05T16:30:00Z", action: "ota-update-pushed",    operator_id: "OP-003", robot_id: "robot_optimus_03",    detail: "v2.4.1 → v2.4.2 · SHA256: a1b2c3d4e5f6", checksum: "a1b2c3d4e5f6" },
  { id: "sec_004", timestamp: "2026-05-04T09:00:00Z", action: "api-key-rotation",     operator_id: "ADMIN",  robot_id: null,                  detail: "API key BCR-LIVE-03 rotated" },
  { id: "sec_005", timestamp: "2026-05-03T11:45:00Z", action: "emergency-stop",       operator_id: "OP-007", robot_id: "robot_figure_02_09",  detail: "E-stop triggered — resolved 14m later" },
  { id: "sec_006", timestamp: "2026-05-02T17:00:00Z", action: "permission-change",    operator_id: "ADMIN",  robot_id: null,                  detail: "OP-015 granted OPERATOR role" },
];

export function useSecurityAudit() {
  const [entries, setEntries] = useState<SecurityAuditEntry[]>(SEED);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [warnShown, setWarnShown] = useState(false);

  const addEntry = useCallback((entry: Omit<SecurityAuditEntry, "id" | "timestamp">) => {
    setEntries((prev) => [
      { ...entry, id: `sec_${Date.now()}`, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  // Session idle tracking — warn at 14 min, log at 15 min
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    function reset() { setIdleSeconds(0); setWarnShown(false); }
    ["mousemove", "keydown", "click", "scroll"].forEach((ev) =>
      window.addEventListener(ev, reset)
    );
    timer = setInterval(() => {
      setIdleSeconds((s) => {
        const next = s + 1;
        if (next === 840 && !warnShown) setWarnShown(true); // 14 min
        if (next === 900) {
          addEntry({
            action: "session-timeout",
            operator_id: "system",
            robot_id: null,
            detail: "Session auto-expired after 15 min idle",
          });
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      ["mousemove", "keydown", "click", "scroll"].forEach((ev) =>
        window.removeEventListener(ev, reset)
      );
    };
  }, [addEntry, warnShown]);

  return { entries, addEntry, idleSeconds, warnShown };
}
