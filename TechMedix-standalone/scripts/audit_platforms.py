#!/usr/bin/env python3
import re, json, subprocess
from collections import defaultdict
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
plats = get("platforms?select=id,slug,type,techmedix_status,specs_json,notes,image_url&order=slug")
fm = defaultdict(int)
for r in get("failure_modes?select=platform_id"):
    fm[r['platform_id']] += 1
print(len(plats), "platforms")
for p in plats:
    print(f"{p['slug']:34} {str(p['type'])[:22]:22} {p['techmedix_status']:15} FM={fm[p['id']]:2} specs={'Y' if p.get('specs_json') else '-'} notes={'Y' if p.get('notes') else '-'} img={'Y' if p.get('image_url') else '-'}")
