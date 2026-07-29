#!/usr/bin/env python3
import re, json, ssl, subprocess, sys

env = {}
for l in open('.env.local'):
    m = re.match(r'([^=#]+)=(.*)', l.strip())
    if m:
        env[m.group(1).strip()] = m.group(2).strip().strip('"\'')

url = env['NEXT_PUBLIC_SUPABASE_URL']
key = env.get('SUPABASE_SERVICE_ROLE_KEY') or env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

out = subprocess.run(['curl', '-s',
    f"{url}/rest/v1/platforms?select=slug,name,type,manufacturer&order=slug",
    '-H', f'apikey: {key}', '-H', f'Authorization: Bearer {key}'],
    capture_output=True, text=True)
try:
    rows = json.loads(out.stdout)
except Exception:
    print("RAW:", out.stdout[:400], out.stderr[:200]); sys.exit(1)
print(len(rows), "platforms")
for r in rows:
    print(f"{r['slug']:34} {str(r.get('type','')):24} {r.get('manufacturer','')}")
