#!/usr/bin/env python3
"""Dedupe duplicate platform rows. HOLD until other DB agent finishes.
Keeps the row WITH child data (or older row if tie), repoints failure_modes,
merges missing scalar fields from loser into keeper, deletes loser.
Usage: python3 scripts/dedupe_platforms.py [--dry-run]
"""
import re, json, subprocess, sys
from collections import defaultdict

DRY = '--dry-run' in sys.argv
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

# explicit pairs: (loser_slug, keeper_slug)
PAIRS = [
    ("figure_02", "figure-02"),
    ("serve_rs2", "serve-rs2"),
    ("unitree_h1_2", "unitree-h1-2"),
    ("rad_commercial", "radcommercial"),  # verify keeper choice before running
]

for loser_slug, keeper_slug in PAIRS:
    L = req('GET', f"platforms?slug=eq.{loser_slug}&select=*")
    K = req('GET', f"platforms?slug=eq.{keeper_slug}&select=*")
    if not (isinstance(L,list) and L and isinstance(K,list) and K):
        print(f"pair {loser_slug}/{keeper_slug}: one side missing, skip"); continue
    loser, keeper = L[0], K[0]
    lf = req('GET', f"failure_modes?platform_id=eq.{loser['id']}&select=id")
    kf = req('GET', f"failure_modes?platform_id=eq.{keeper['id']}&select=id")
    # safety: if loser has MORE child data than keeper, swap
    if isinstance(lf,list) and isinstance(kf,list) and len(lf) > len(kf):
        loser, keeper = keeper, loser
        lf, kf = kf, lf
        print(f"  (swapped: keeping {keeper['slug']})")
    print(f"KEEP {keeper['slug']} ({len(kf)} FMs)  DELETE {loser['slug']} ({len(lf)} FMs)")
    if DRY: continue
    if lf:
        r = req('PATCH', f"failure_modes?platform_id=eq.{loser['id']}", {"platform_id": keeper['id']})
        print(f"  repointed {len(r) if isinstance(r,list) else r} failure_modes")
    merge = {k: v for k, v in loser.items()
             if k not in ('id','slug','created_at','updated_at')
             and v not in (None,'',{},[]) and keeper.get(k) in (None,'',{},[])}
    if merge:
        req('PATCH', f"platforms?slug=eq.{keeper['slug']}", merge)
        print(f"  merged fields: {list(merge)}")
    r = req('DELETE', f"platforms?id=eq.{loser['id']}")
    print(f"  deleted {loser['slug']}: {r if isinstance(r,dict) else 'ok'}")
print("done", "(dry-run)" if DRY else "")
