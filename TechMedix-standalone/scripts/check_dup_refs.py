#!/usr/bin/env python3
"""Check what references the duplicate platform rows before dedupe."""
import re, json, subprocess

env = {}
for l in open('.env.local'):
    m = re.match(r'([^=#]+)=(.*)', l.strip())
    if m: env[m.group(1).strip()] = m.group(2).strip().strip('"\'')
URL = env['NEXT_PUBLIC_SUPABASE_URL']
KEY = env.get('SUPABASE_SERVICE_ROLE_KEY') or env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

def get(path):
    out = subprocess.run(['curl','-s',f"{URL}/rest/v1/{path}",
        '-H',f'apikey: {KEY}','-H',f'Authorization: Bearer {KEY}'],capture_output=True,text=True)
    try: return json.loads(out.stdout)
    except Exception: return {"_error": out.stdout[:200]}

dup_ids = {
 "figure_02":"535e7197-4bd7-48be-8f9a-251add74751b",
 "serve_rs2":"cb64d153-8f45-4053-ad26-9aba8d6a177c",
 "unitree_h1_2":"691aed3f-b2d5-48d0-b773-621836b2057b",
 "unitree-h1-2":"07e008d0-b112-4e8f-9db2-8fc622097572",
}
dup_slugs = ["figure_02","serve_rs2","unitree_h1_2","unitree-h1-2","rad_commercial","radcommercial"]

# robots referencing platforms via platforms_supported (string array of slugs?)
robots = get("robots?select=id,name,platforms_supported")
print("=== robots.platforms_supported hits ===")
if isinstance(robots, list):
    for r in robots:
        ps = r.get('platforms_supported') or []
        hits = [s for s in ps if s in dup_slugs]
        if hits: print(r['id'], r['name'], hits)
    print(f"(scanned {len(robots)} robots)")
else:
    print(robots)

# tables that might reference platform id
for t in ["failure_modes","medical_device_adapters","telemetry_snapshots","case_studies","platform_documents"]:
    rows = get(f"{t}?select=platform_id&limit=1")
    if isinstance(rows, dict):
        print(f"{t}: {rows.get('_error') or rows.get('message')}")
        continue
    allrows = get(f"{t}?select=platform_id")
    hit = [r for r in allrows if r.get('platform_id') in dup_ids.values()]
    print(f"{t}: {len(allrows)} rows, {len(hit)} referencing dup ids")

# rad pair full rows
print("\n=== rad pair ===")
for s in ["rad_commercial","radcommercial"]:
    r = get(f"platforms?slug=eq.{s}&select=id,slug,name,created_at")
    print(r)
