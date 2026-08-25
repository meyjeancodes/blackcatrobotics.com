#!/bin/bash
# Per-bot resilient routine: tm-ui daily TechMedix Dashboard UX check.
# Builds the REAL deployed app (TechMedix-standalone, which owns CHASSIS_REGISTRY
# + the /knowledge/blueprint routes served at blackcatrobotics.com) and verifies
# the parts registry is intact. Fails safe: a build error is reported, not fatal.
set -u
REPO="$HOME/blackcatrobotics-repo/TechMedix-standalone"
REGISTRY="$REPO/lib/platforms/parts-catalog.ts"
OUT="$HOME/.hermes/bot-dropzone"
mkdir -p "$OUT"
TS="$(date +%F)"
REPORT="$OUT/pipeline-tm-ui-$TS.txt"

cd "$REPO" || { echo "[tm-ui] repo missing at $REPO" > "$REPORT"; exit 0; }

{
  echo "TechMedix Dashboard UX check — $TS"
  echo "==================================="

  echo "[1/3] Running next build (headless)..."
  if npm run build > /tmp/tm-ui-build.log 2>&1; then
    echo "BUILD: ok"
  else
    echo "BUILD: FAILED (see tail)"
    tail -25 /tmp/tm-ui-build.log
    echo ""
    echo "Verdict: build broken — fixes required before any UX pass."
    exit 0
  fi

  echo "[2/3] Verifying CHASSIS_REGISTRY integrity..."
  if [ -f "$REGISTRY" ]; then
    CHASSIS=$(awk '/export const CHASSIS_REGISTRY/,/^\};/' "$REGISTRY" | grep -cE "^\s*\"?[a-z0-9-]+\"?\s*:\s*[A-Z_][A-Z0-9_]*\s*,")
    EMPTY_SIL=$(grep -cE 'silhouette:\s*""' "$REGISTRY")
    TOTAL_SIL=$(grep -cE 'silhouette:' "$REGISTRY")
    echo "CHASSIS_REGISTRY chassis entries: $CHASSIS"
    echo "silhouette fields: $TOTAL_SIL | empty (blank backdrop): $EMPTY_SIL"
  else
    echo "CHASSIS_REGISTRY not found at $REGISTRY"
  fi

  echo "[3/3] Blueprint route presence..."
  BP=$(find app -type d -iname '*blueprint*' 2>/dev/null | wc -l)
  echo "blueprint route dirs: $BP"

  echo ""
  if [ "${EMPTY_SIL:-0}" -gt 0 ]; then
    echo "Verdict: build green; $CHASSIS chassis verified. $EMPTY_SIL chassis have blank-backdrop silhouettes (cosmetic, not broken) — author silhouette art to finish them."
  else
    echo "Verdict: build green; $CHASSIS chassis verified, all silhouettes present."
  fi
} > "$REPORT" 2>&1

cat "$REPORT"
