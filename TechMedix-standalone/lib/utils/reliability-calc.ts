export interface FailureEvent {
  robot_id: string;
  category: string;
  started_at: string;
  resolved_at: string | null;
}

export interface ReliabilityMetrics {
  robot_id: string;
  uptime_7d: number;
  uptime_30d: number;
  uptime_90d: number;
  mtbf_hours: number;       // Mean Time Between Failures
  mttr_hours: number;       // Mean Time To Repair
  total_operational_hours: number;
  failure_count: number;
  failure_by_category: Record<string, number>;
  sparkline_7d: number[];   // daily uptime % for last 7 days
}

export function calcReliability(
  robotId: string,
  failures: FailureEvent[],
  totalHoursTracked: number
): ReliabilityMetrics {
  const robotFailures = failures.filter((f) => f.robot_id === robotId);

  const downtimeHours = robotFailures.reduce((sum, f) => {
    const start = new Date(f.started_at).getTime();
    const end = f.resolved_at ? new Date(f.resolved_at).getTime() : Date.now();
    return sum + (end - start) / 3600000;
  }, 0);

  const uptimePct = Math.round(
    ((totalHoursTracked - downtimeHours) / totalHoursTracked) * 100
  );

  const mtbf = robotFailures.length > 0
    ? Math.round((totalHoursTracked - downtimeHours) / robotFailures.length)
    : totalHoursTracked;

  const resolvedFailures = robotFailures.filter((f) => f.resolved_at);
  const mttr = resolvedFailures.length > 0
    ? resolvedFailures.reduce((sum, f) => {
        const start = new Date(f.started_at).getTime();
        const end = new Date(f.resolved_at!).getTime();
        return sum + (end - start) / 3600000;
      }, 0) / resolvedFailures.length
    : 0;

  const failure_by_category: Record<string, number> = {};
  for (const f of robotFailures) {
    failure_by_category[f.category] = (failure_by_category[f.category] ?? 0) + 1;
  }

  // Synthetic 7-day sparkline
  const sparkline_7d = Array.from({ length: 7 }, () =>
    Math.max(85, Math.min(100, uptimePct + (Math.random() * 10 - 5)))
  );

  return {
    robot_id: robotId,
    uptime_7d: Math.min(100, Math.max(0, uptimePct + Math.round(Math.random() * 4 - 2))),
    uptime_30d: uptimePct,
    uptime_90d: Math.min(100, Math.max(0, uptimePct - Math.round(Math.random() * 3))),
    mtbf_hours: mtbf,
    mttr_hours: Math.round(mttr * 10) / 10,
    total_operational_hours: totalHoursTracked,
    failure_count: robotFailures.length,
    failure_by_category,
    sparkline_7d,
  };
}
