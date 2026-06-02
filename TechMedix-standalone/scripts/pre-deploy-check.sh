#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "== TechMedix pre-deploy health check =="
echo "Project: ${PROJECT_ROOT##*/}"
echo "Branch:  $(git branch --show-current)"
echo "Commit:  $(git rev-parse --short HEAD)"
echo "Date:    $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo

fail=0

check() {
  local label="$1"
  local cmd="$2"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "  [ok] $label"
  else
    echo "  [FAIL] $label"
    fail=$((fail + 1))
  fi
}

echo "1) Git state"
check "clean working tree" "git diff --exit-code"
check "no untracked files" "test -z '\$(git ls-files --others --exclude-standard)'"

echo
echo "2) Build"
check "Next.js build" "npm run -s build"

echo
echo "3) TypeScript"
check "typecheck" "npm run -s typecheck"

echo
echo "4) Environment (local)"
check "NEXT_PUBLIC_SUPABASE_URL set" "test -n '\${NEXT_PUBLIC_SUPABASE_URL:-}'"
check "NEXT_PUBLIC_SUPABASE_ANON_KEY set" "test -n '\${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}'"

echo
echo "5) Supabase connectivity (if reachable)"
if command -v curl >/dev/null 2>&1 && test -n "${NEXT_PUBLIC_SUPABASE_URL:-}"; then
  if curl -sf --max-time 10 -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" >/dev/null 2>&1; then
    echo "  [ok] Supabase REST reachable"
  else
    echo "  [warn] Supabase REST unreachable from this machine"
  fi
else
  echo "  [skip] Supabase check skipped (no curl or no URL)"
fi

echo
echo "6) Route smoke checks (local dev server)"
DEV_PID=""
cleanup() {
  if [ -n "$DEV_PID" ] && kill -0 "$DEV_PID" 2>/dev/null; then
    kill "$DEV_PID" >/dev/null 2>&1 || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

PORT=37889
BASE="http://127.0.0.1:${PORT}"

if command -v lsof >/dev/null 2>&1; then
  if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "  [skip] port $PORT already in use"
  else
    NODE_ENV=production npx next start -p "$PORT" >/tmp/techmedix-next-$$.log 2>&1 &
    DEV_PID=$!
    for i in $(seq 1 60); do
      if curl -sf "$BASE" >/dev/null 2>&1; then
        break
      fi
      sleep 1
    done
  fi
fi

if [ -n "${BASE:-}" ] && curl -sf "$BASE" >/dev/null 2>&1; then
  check "GET /" "curl -sf '$BASE/' >/dev/null"
  check "GET /api/health" "curl -sf '$BASE/api/health' | grep -q status"
  check "GET /api/skills" "curl -sf '$BASE/api/skills' | grep -q ok"
  check "GET /api/techmedix/memory" "curl -sf '$BASE/api/techmedix/memory' | grep -q ok"
else
  echo "  [skip] local server not started; route checks skipped"
fi

echo
echo "== Summary =="
if [ "$fail" -eq 0 ]; then
  echo "PASS: all pre-deploy checks passed"
  exit 0
else
  echo "FAIL: $fail check(s) failed"
  exit 1
fi
