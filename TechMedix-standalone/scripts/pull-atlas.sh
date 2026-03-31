#!/usr/bin/env bash
# scripts/pull-atlas.sh — Pull all Atlas CLI data for BlackCat OS
# Usage: bash scripts/pull-atlas.sh

set -euo pipefail

ATLAS_DIR=".atlas"
mkdir -p "$ATLAS_DIR"

echo "🔍 Pulling Atlas CLI data..."

# Companies
echo "  → companies..."
atlas companies --json > "$ATLAS_DIR/companies.json"

# Components
echo "  → components..."
atlas components --json > "$ATLAS_DIR/components.json"

# Relationships
echo "  → relationships..."
atlas relationships --json > "$ATLAS_DIR/relationships.json"

# Find Unitree company ID
UNITREE_ID=$(python3 -c "
import json, sys
data = json.load(open('$ATLAS_DIR/companies.json'))
matches = [c['id'] for c in data if 'unitree' in c.get('id','').lower() and c.get('id') == 'unitree']
print(matches[0] if matches else 'unitree')
")
echo "  → Unitree company ID: $UNITREE_ID"

# Unitree-specific data
echo "  → supply-chain for $UNITREE_ID..."
atlas supply-chain --json "$UNITREE_ID" > "$ATLAS_DIR/unitree_supply_chain.json"

echo "  → company profile for $UNITREE_ID..."
atlas company "$UNITREE_ID" --json > "$ATLAS_DIR/unitree_profile.json"

echo "  → H1 query..."
atlas query --json "Unitree H1 actuators motors sensors" > "$ATLAS_DIR/h1_query.json"

echo ""
echo "✅ Atlas data saved to $ATLAS_DIR/"
ls -lh "$ATLAS_DIR/"
echo ""
echo "Next: run  npx ts-node scripts/atlas-to-seed.ts  to generate seed.sql"
