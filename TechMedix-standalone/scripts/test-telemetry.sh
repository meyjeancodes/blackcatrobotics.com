#!/usr/bin/env bash
# test-telemetry.sh — Fire a test telemetry payload to the TechMedix API
# Usage: API_KEY=<your_key> ./scripts/test-telemetry.sh [base_url]
#   base_url defaults to http://localhost:3000

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
API_KEY="${API_KEY:-}"

if [ -z "$API_KEY" ]; then
  echo "Error: API_KEY environment variable is required."
  echo "Usage: API_KEY=<your_api_key> ./scripts/test-telemetry.sh [base_url]"
  exit 1
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ROBOT_ID="ROBOT-TEST-$(date +%s)"

PAYLOAD=$(cat <<EOF
{
  "robot_id": "${ROBOT_ID}",
  "timestamp": "${TIMESTAMP}",
  "joint_health": {
    "left_hip": { "wear_percent": 45, "temp_celsius": 38, "torque_nm": 120 },
    "right_hip": { "wear_percent": 48, "temp_celsius": 40, "torque_nm": 118 },
    "left_knee": { "wear_percent": 62, "temp_celsius": 42, "torque_nm": 95 },
    "right_knee": { "wear_percent": 58, "temp_celsius": 41, "torque_nm": 97 },
    "left_ankle": { "wear_percent": 30, "temp_celsius": 35, "torque_nm": 60 },
    "right_ankle": { "wear_percent": 32, "temp_celsius": 36, "torque_nm": 58 }
  },
  "battery": {
    "charge_percent": 72,
    "cycle_count": 180,
    "voltage": 48.2,
    "health_percent": 91
  },
  "error_codes": [],
  "uptime_hours": 1240,
  "firmware_version": "2.4.1"
}
EOF
)

echo "Sending telemetry to ${BASE_URL}/api/telemetry ..."
echo "Robot ID: ${ROBOT_ID}"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/telemetry" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Status: ${HTTP_CODE}"
echo "Response:"
echo "${BODY}" | python3 -m json.tool 2>/dev/null || echo "${BODY}"

# --- Critical payload test (should trigger alert) ---
echo ""
echo "Sending CRITICAL telemetry (high wear, low battery) ..."

CRITICAL_ROBOT_ID="ROBOT-CRIT-$(date +%s)"
CRITICAL_PAYLOAD=$(cat <<EOF
{
  "robot_id": "${CRITICAL_ROBOT_ID}",
  "timestamp": "${TIMESTAMP}",
  "joint_health": {
    "left_hip": { "wear_percent": 93, "temp_celsius": 88, "torque_nm": 80 }
  },
  "battery": {
    "charge_percent": 12,
    "cycle_count": 420,
    "voltage": 44.1,
    "health_percent": 71
  },
  "error_codes": ["E_OVERTEMP", "E_LOW_BATTERY"],
  "uptime_hours": 3200,
  "firmware_version": "2.3.0"
}
EOF
)

CRIT_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/telemetry" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${CRITICAL_PAYLOAD}")

CRIT_HTTP=$(echo "$CRIT_RESPONSE" | tail -n1)
CRIT_BODY=$(echo "$CRIT_RESPONSE" | head -n -1)

echo "HTTP Status: ${CRIT_HTTP}"
echo "Response:"
echo "${CRIT_BODY}" | python3 -m json.tool 2>/dev/null || echo "${CRIT_BODY}"
echo ""
echo "Done. Check your email for alert delivery."
