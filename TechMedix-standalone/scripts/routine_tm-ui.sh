#!/bin/bash
# Per-bot resilient routine: tm-ui daily TechMedix Dashboard UX check.
# Builds the REAL deployed app (TechMedix-standalone, which owns CHASSIS_REGISTRY
# + the /knowledge/blueprint routes served at blackcatrobotics.com) and verifies
# the parts registry is intact. Fails safe: a build error is reported, not fatal.
set -u
REPO="$HOME/blackcatrobotics-repo/TechMedix-standalone"
REGISTRY="$REPO/lib/platforms/archetypes.ts"
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

  echo "[2/3] Verifying archetype registry integrity..."
    if [ -f "$REGISTRY" ]; then
      ARCH=$(grep -cE '^  [a-z-]+:' "$REGISTRY")
      echo "archetype entries: $ARCH"
    else
      echo "registry not found at $REGISTRY"
    fi

    echo "[3/3] Blueprint route presence..."
    BP=$(find app -type d -iname '*blueprint*' 2>/dev/null | wc -l)
    echo "blueprint route dirs: $BP"
} > "$REPORT" 2>&1

cat "$REPORT"
