#!/usr/bin/env python3
"""Apply seeds/pending/*.json to Supabase platforms + failure_modes.
HOLD: run only after the other DB agent is done. Idempotent:
 - PATCHes platforms row by slug (specs_json/notes/introduced_year, only filling gaps unless --force)
 - INSERTs failure_modes only if the platform currently has none.
Usage: python3 scripts/apply_seeds.py [--dry-run] [--force]
"""
import re, json, subprocess, sys, glob

DRY = '--dry-run' in sys.argv
FORCE = '--force' in sys.argv

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

# discover failure_modes columns from an existing row
sample = req('GET', "failure_modes?select=*&limit=1")
fm_cols = set(sample[0].keys()) if isinstance(sample, list) and sample else set()
print("failure_modes columns:", sorted(fm_cols) or "(none found)")

for fn in sorted(glob.glob('seeds/pending/*.json')):
    seed = json.load(open(fn))
    slug = seed['slug']
    rows = req('GET', f"platforms?slug=eq.{slug}&select=*")
    if not (isinstance(rows, list) and rows):
        print(f"!! {slug}: no platform row, SKIP"); continue
    p = rows[0]
    patch = {}
    for k in ('specs_json','notes','introduced_year'):
        if k in seed and (FORCE or p.get(k) in (None,'',{},[])):
            patch[k] = seed[k]
    if patch:
        print(f"{slug}: PATCH {list(patch)}")
        if not DRY:
            r = req('PATCH', f"platforms?slug=eq.{slug}", patch)
            if isinstance(r, dict): print("   error:", r)
    fms = seed.get('failure_modes') or []
    if fms:
        existing = req('GET', f"failure_modes?platform_id=eq.{p['id']}&select=id")
        if isinstance(existing, list) and existing and not FORCE:
            print(f"{slug}: has {len(existing)} failure_modes, skip inserts")
        else:
            payload = []
            for f in fms:
                row = {'platform_id': p['id']}
                mapping = {'name':'name','component':'component','severity':'severity',
                           'mtbf_hours_est':'mtbf_hours','symptoms':'symptoms','mitigation':'mitigation'}
                for src,dst in mapping.items():
                    if src in f and (not fm_cols or dst in fm_cols):
                        row[dst] = f[src]
                payload.append(row)
            print(f"{slug}: INSERT {len(payload)} failure_modes")
            if not DRY:
                r = req('POST', "failure_modes", payload)
                if isinstance(r, dict): print("   error:", r)
print("done", "(dry-run)" if DRY else "")
