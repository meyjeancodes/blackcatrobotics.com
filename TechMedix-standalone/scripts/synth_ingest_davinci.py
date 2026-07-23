#!/usr/bin/env python3
"""
Synthetic telemetry generator for the da Vinci / dVRK adapter.

Reads the live adapter config from medical_device_adapters (platform_slug
'intuitive-davinci'), then emits synthetic signal values that traverse the
defined warning/critical thresholds over time, inserting into medical_telemetry.

This is for DASHBOARD DEMO ONLY — values are fabricated. It does NOT connect
to a real robot. Safe to run/safe to clear.

Usage:
  python3 synth_ingest_davinci.py --dry-run          # print only, no DB writes
  python3 synth_ingest_davinci.py --samples 200      # 200 samples/series (default 120)
  python3 synth_ingest_davinci.py --clear            # delete all synthetic rows
  python3 synth_ingest_davinci.py --seed 42          # reproducible

It creates one synthetic robot (robot_id 'robot_davinci_synthetic') tagged
medical_device_id='SYNTHETIC' on first run so the NOT NULL + FK on
medical_telemetry.robot_id is satisfied.
"""
import argparse, json, os, random, subprocess, sys, datetime, math

SUPABASE = os.environ.get("SUPABASE_BIN", "supabase")
LINKED = ["db", "query", "--linked"]

def run(sql, capture=True):
    cmd = [SUPABASE] + LINKED + [sql]
    r = subprocess.run(cmd, capture_output=capture, text=True)
    if r.returncode != 0:
        msg = (r.stderr or r.stdout or "").strip()
        raise RuntimeError(f"supabase query failed: {msg}")
    return r.stdout

def customer_exists():
    out = run("SELECT id FROM customers WHERE id='synthetic-demo';")
    return "synthetic-demo" in out

def ensure_customer():
    if customer_exists():
        return
    run("""INSERT INTO customers (id, company, name, email, plan, status, fleet_size, monthly_spend, onboarding_complete)
VALUES ('synthetic-demo', 'Synthetic Demo', 'Demo Account', 'demo@blackcat.robotics', 'operator', 'active', 1, 0, true)
ON CONFLICT (id) DO NOTHING;""")

def robot_exists():
    out = run("SELECT id FROM robots WHERE id='robot_davinci_synthetic';")
    return "robot_davinci_synthetic" in out

def ensure_robot():
    if robot_exists():
        return
    ensure_customer()
    run("""INSERT INTO robots (id, customer_id, name, platform, serial_number, location, region, status, health_score, battery_level, telemetry_summary, platforms_supported, medical_device_id, medical_certification, sterilization_cycle_count)
VALUES ('robot_davinci_synthetic', 'synthetic-demo', 'da Vinci (Synthetic Demo)', 'Intuitive Surgical da Vinci', 'SYNTH-0001', 'Demo OR-1', 'demo', 'online', 98, 100, '{}'::jsonb, ARRAY['intuitive-davinci'], 'SYNTHETIC', 'demo-only', 0)
ON CONFLICT (id) DO NOTHING;""")

def clear_synthetic():
    run("DELETE FROM medical_telemetry WHERE robot_id='robot_davinci_synthetic';")
    run("DELETE FROM robots WHERE id='robot_davinci_synthetic';")
    print("Cleared synthetic da Vinci robot + telemetry.")

def get_adapter():
    out = run("SELECT mapping_config::text FROM medical_device_adapters WHERE platform_slug='intuitive-davinci' AND enabled;")
    # extract the json between first { and matching }
    s = out[out.find('{'):out.rfind('}')+1]
    return json.loads(s)

def gen_series(mapping, n, rng):
    """Return list of (value, severity) traversing normal->warning->critical->recover."""
    warn, crit = mapping.get("warning"), mapping.get("critical")
    unit = mapping.get("unit")
    name = mapping["target_field"]
    samples = []
    # baseline normal ~ 60% of warning (or for 'count' lower-bound signals, low)
    if unit == "count":
        base = max(0.0, (warn or 10) * 0.4)
        peak = (crit or (warn or 10) * 1.2)
        vals = [base + (peak - base) * (0.5 - 0.5 * math.cos((i / (n - 1)) * 6.28)) for i in range(n)]
    else:
        base = (warn or 1.0) * 0.5
        peak = (crit or (warn or 1.0) * 2.0) * 1.15
        # sine that pushes through warning+critical then recovers
        vals = []
        for i in range(n):
            t = i / max(1, n - 1)
            v = base + (peak - base) * (0.5 - 0.5 * math.cos(t * 6.2831))
            vals.append(round(v + rng.uniform(-0.02, 0.02) * peak, 4))
    for v in vals:
        sev = "info"
        if crit is not None and v >= crit:
            sev = "critical"
        elif warn is not None and v >= warn:
            sev = "warning"
        samples.append((round(float(v), 4), sev))
    return samples

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--samples", type=int, default=120)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--clear", action="store_true")
    ap.add_argument("--seed", type=int, default=None)
    args = ap.parse_args()
    rng = random.Random(args.seed)

    if args.clear:
        if args.dry_run:
            print("DRY-RUN: would clear synthetic da Vinci robot + telemetry.")
            return
        clear_synthetic()
        return

    cfg = get_adapter()
    mappings = cfg["signal_mappings"]
    topic_map = cfg.get("ros_topics", {})

    if args.dry_run:
        print(f"DRY-RUN: would generate {args.samples} samples for {len(mappings)} signals "
              f"from dVRK adapter '{cfg.get('notes','')[:40]}...'")
        for k, m in mappings.items():
            print(f"  signal={m['target_field']:24} unit={m.get('unit'):7} warn={m.get('warning')} crit={m.get('critical')}")
        return

    ensure_robot()
    rows = []
    now = datetime.datetime.now(datetime.timezone.utc)
    for sig_i, (k, m) in enumerate(mappings.items()):
        series = gen_series(m, args.samples, rng)
        topic = None
        for tk, tv in topic_map.items():
            if tv == m.get("source_topic"):
                topic = tv
        for i, (val, sev) in enumerate(series):
            ts = (now - datetime.timedelta(seconds=(args.samples - i) * 5)).isoformat()
            rows.append((m["target_field"], val, m.get("unit"), sev, topic,
                         json.dumps({"synthetic": True, "source_topic": topic, "transform": m.get("transform")})))
    # build bulk insert
    parts = []
    for idx, (name, val, unit, sev, topic, raw) in enumerate(rows):
        ts = (now - datetime.timedelta(seconds=(len(rows) - idx) * 5)).isoformat()
        parts.append(
            f"('robot_davinci_synthetic','intuitive-davinci','{ts}',"
            f"'{name}',{val},'{unit}','{sev}','{topic or ''}','{raw}'::jsonb)")
    sql = ("INSERT INTO medical_telemetry "
           "(robot_id, platform_slug, timestamp, signal_name, signal_value, unit, severity, source_device, raw_payload) VALUES "
           + ",\n".join(parts) + ";")
    run(sql)
    print(f"Inserted {len(rows)} synthetic telemetry rows for robot_davinci_synthetic "
          f"({len(mappings)} signals x {args.samples} samples).")

if __name__ == "__main__":
    main()
