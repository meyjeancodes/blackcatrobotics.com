/**
 * Demo drone data for offline / mock-mode development.
 * Returned when Supabase is not configured.
 */

export const MOCK_DRONES = [
  {
    id: "demo-dji-001",
    serial_number: "1ZNBC1234567",
    model: "DJI Mavic 3 Pro",
    purchase_date: "2024-03-15",
    care_refresh_plan: "ONE_YEAR",
    care_refresh_activated_at: "2024-03-16",
    care_refresh_expires_at: "2025-03-16T00:00:00.000Z",
    replacements_used: 0,
    replacements_remaining: 2,
    fleet_id: null,
    created_at: "2024-03-15T00:00:00.000Z",
    updated_at: "2024-03-15T00:00:00.000Z",
    latest_health_score: 87,
    last_flight_date: "2026-04-20",
    active_alerts_count: 0,
    expiry_warning: null,
  },
  {
    id: "demo-dji-002",
    serial_number: "1ZNBC7654321",
    model: "DJI Air 3",
    purchase_date: "2024-06-01",
    care_refresh_plan: "TWO_YEAR",
    care_refresh_activated_at: "2024-06-02",
    care_refresh_expires_at: "2026-06-02T00:00:00.000Z",
    replacements_used: 1,
    replacements_remaining: 2,
    fleet_id: null,
    created_at: "2024-06-01T00:00:00.000Z",
    updated_at: "2024-06-01T00:00:00.000Z",
    latest_health_score: 72,
    last_flight_date: "2026-04-18",
    active_alerts_count: 1,
    expiry_warning: null,
  },
  {
    id: "demo-dji-003",
    serial_number: "1ZNBC9998887",
    model: "DJI Mini 4 Pro",
    purchase_date: "2024-01-10",
    care_refresh_plan: "NONE",
    care_refresh_activated_at: null,
    care_refresh_expires_at: null,
    replacements_used: 0,
    replacements_remaining: 0,
    fleet_id: null,
    created_at: "2024-01-10T00:00:00.000Z",
    updated_at: "2024-01-10T00:00:00.000Z",
    latest_health_score: 94,
    last_flight_date: "2026-04-21",
    active_alerts_count: 0,
    expiry_warning: null,
  },
];

export const MOCK_FLEET_HEALTH = {
  total_drones: 3,
  active_care_refresh: 2,
  expiring_soon: [],
  health_distribution: { excellent: 1, good: 1, fair: 0, poor: 0 },
  open_claims: 1,
  drones_requiring_attention: [
    {
      id: "demo-dji-002",
      serial_number: "1ZNBC7654321",
      model: "DJI Air 3",
      latest_health_score: 72,
    },
  ],
  fleet_health_score: 84,
  replacement_units_used_this_period: 1,
};
