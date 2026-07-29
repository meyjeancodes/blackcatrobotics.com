#!/usr/bin/env python3
"""Apply seeds-staging/*.json to Supabase platforms + failure_modes.
Idempotent: fills gaps only. Usage (from TechMedix-standalone dir):
python3 ~/blackcatrobotics-repo/seeds-staging/apply_seeds.py [--dry-run]
"""
import re, json, subprocess, sys, glob, os

DRY = '--dry-run' in sys.argv
SEED_DIR = os.path.dirname(os.path.abspath(__file__))
env = {}
for l in open('.env.local'):
    m = re.match(r'([^=#]+)=(.*)', l.strip())
    if m: env[m.group(1).strip()] = m.group(2).strip().strip('"\'')
URL = env['NEXT_PUBLIC_SUPABASE_URL']
KEY = env.get('SUPABASE_SERVICE_ROLE_KEY') or env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

def req(method, path, body=None):
    cmd = ['curl','-s','-X',method,f"{URL}/rest/v1/{path}",
        '-H',f'apikey: {KEY}','-H',f'Authorization: Bearer {KEY}',
        '-H','Content-Type: application/json','-H','Prefer: return=representation']
    if body is not None: cmd += ['-d', json.dumps(body)]
    out = subprocess.run(cmd, capture_output=True, text=True)
    try: return json.loads(out.stdout) if out.stdout.strip() else []
    except Exception: return {"_error": out.stdout[:300]}

sample = req('GET', "failure_modes?select=*&limit=1")
fm_cols = set(sample[0].keys()) if isinstance(sample, list) and sample else set()
print("failure_modes columns:", sorted(fm_cols))

for fn in sorted(glob.glob(os.path.join(SEED_DIR, '*.json'))):
    seed = json.load(open(fn))
    slug = seed.get('slug')
    if not slug: continue
    rows = req('GET', f"platforms?slug=eq.{slug}&select=*")
    if not (isinstance(rows, list) and rows):
        print(f"!! {slug}: no platform row, SKIP"); continue
    p = rows[0]
    patch = {}
    for k in ('specs_json','notes','introduced_year'):
        if k in seed and p.get(k) in (None,'',{},[]):
            patch[k] = seed[k]
    # promote flat spec fields into platform scalar columns if empty
    sj = seed.get('specs_json') or {}
    for col in ('motor_power_w','top_speed_kmh','range_km','ip_rating','tire_type'):
        if col in sj and p.get(col) in (None,'',[]) and sj[col] not in (None,''):
            patch[col] = sj[col]
    if patch:
        print(f"{slug}: PATCH {list(patch)}")
        if not DRY:
            r = req('PATCH', f"platforms?slug=eq.{slug}", patch)
            if isinstance(r, dict): print("   error:", r)
    fms = seed.get('failure_modes') or []
    if fms:
        existing = req('GET', f"failure_modes?platform_id=eq.{p['id']}&select=id")
        if isinstance(existing, list) and existing:
            print(f"{slug}: has {len(existing)} FMs, skip inserts"); continue
        payload = []
        for f in fms:
            root = f.get('name','')
            if f.get('mitigation'): root += f"; mitigation: {f['mitigation']}"
            row = {
                'platform_id': p['id'],
                'component': f.get('component'),
                'severity': f.get('severity'),
                'mtbf_hours': f.get('mtbf_hours_est'),
                'symptom': f.get('symptoms'),
                'root_cause': root,
                'confidence': 'low' if seed.get('slug')=='asimov-here-be-dragons' else 'medium',
                'source_urls': ['fmea-engineering-estimate'],
                'tags': [seed.get('slug','')],
            }
            payload.append({k:v for k,v in row.items() if v is not None})
        print(f"{slug}: INSERT {len(payload)} failure_modes")
        if not DRY:
            r = req('POST', "failure_modes", payload)
            if isinstance(r, dict): print("   error:", r)
print("done", "(dry-run)" if DRY else "")
