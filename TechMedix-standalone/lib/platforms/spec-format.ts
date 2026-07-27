/**
 * Spec formatting.
 *
 * Supabase `specs_json` is raw and inconsistent — keys like `max_flight_time_min`,
 * `weight_kg`, `top_speed_ms`, values that are booleans, nulls, arrays, or long
 * prose strings. Dumped straight onto a card that reads as noise.
 *
 * This module:
 *  - picks the specs that are genuinely comparable/useful per card
 *  - splits the unit out of the key so it can be rendered small
 *  - drops nulls, uninformative booleans, placeholders and prose blobs
 *  - orders specs so the most decision-relevant ones come first
 *  - guarantees a non-empty result (lenient fallback pass)
 */

export interface FormattedSpec {
  label: string;
  value: string;
  unit?: string;
}

/** key suffix → display unit */
const UNIT_SUFFIX: [RegExp, string][] = [
  [/_kg$/, "kg"],
  [/_g$/, "g"],
  [/_lb$/, "lb"],
  [/_wh$/, "Wh"],
  [/_w$/, "W"],
  [/_kmh$/, "km/h"],
  [/_kph$/, "km/h"],
  [/_mph$/, "mph"],
  [/_ms$/, "m/s"],
  [/_km$/, "km"],
  [/_mi$/, "mi"],
  [/_m$/, "m"],
  [/_min$/, "min"],
  [/_h$/, "h"],
  [/_l$/, "L"],
  [/_c$/, "°C"],
  [/_pct$/, "%"],
];

/** Units for keys whose unit isn't a clean trailing suffix. */
const UNIT_OVERRIDES: Record<string, string> = {
  range_mi_one_way: "mi",
  speed_kph_max: "km/h",
  max_speed_m_s: "m/s",
  wind_resistance_m_s: "m/s",
  max_gust_m_s: "m/s",
  spray_rate_l_min: "L/min",
  max_spray_rate_l_min: "L/min",
  spread_rate_kg_min: "kg/min",
  max_spread_rate_kg_min: "kg/min",
  operating_temp_c: "°C",
  cart_lift_capacity_kg: "kg",
};

/** Nicer short labels for keys that would otherwise be ugly or too long. */
const LABEL_OVERRIDES: Record<string, string> = {
  dof: "DOF",
  hand_dof: "Hand DOF",
  weight_kg: "Weight",
  weight_lb: "Weight",
  weight_no_battery_kg: "Dry weight",
  weight_with_batteries_kg: "Weight",
  aircraft_weight_lb: "Weight",
  battery_wh: "Battery",
  payload_kg: "Payload",
  payload_lb: "Payload",
  max_payload_kg: "Max payload",
  spray_payload_kg: "Spray payload",
  spread_payload_kg: "Spread payload",
  cart_lift_capacity_kg: "Lift capacity",
  max_rider_kg: "Max rider",
  runtime_min: "Runtime",
  runtime_h: "Runtime",
  endurance_h: "Endurance",
  max_flight_time_min: "Flight time",
  max_hover_time_min: "Hover time",
  top_speed_ms: "Top speed",
  top_speed_kmh: "Top speed",
  speed_kph_max: "Top speed",
  max_speed_kmh: "Top speed",
  max_speed_m_s: "Top speed",
  walking_speed_ms: "Walk speed",
  range_km: "Range",
  range_mi_one_way: "Range",
  range_mi: "Range",
  height_m: "Height",
  motor_power_w: "Motor",
  ip_rating: "Ingress",
  price_usd_est: "Est. price",
  spray_tank_l: "Tank",
  spray_rate_l_min: "Spray rate",
  max_spray_rate_l_min: "Spray rate",
  spread_rate_kg_min: "Spread rate",
  max_spread_rate_kg_min: "Spread rate",
  max_takeoff_weight_kg: "MTOW",
  max_takeoff_weight_spray_kg: "MTOW spray",
  max_takeoff_weight_spread_kg: "MTOW spread",
  service_ceiling_m: "Ceiling",
  wind_resistance_m_s: "Wind limit",
  max_gust_m_s: "Gust limit",
  operating_temp_c: "Op. temp",
  arms: "Arms",
  cameras: "Cameras",
  actuators: "Actuators",
  tire_type: "Tires",
  brakes: "Brakes",
  drive: "Drive",
  pilot_accuracy_pct: "Accuracy",
  pilot_holes_drilled: "Holes drilled",
  ndaa_compliant: "NDAA",
  fda_cleared: "FDA",
  haptic: "Haptics",
  eye_tracking: "Eye tracking",
  ct_planning: "CT planning",
  endowrist: "EndoWrist",
  lidar: "LiDAR",
  modular_carts: "Modular carts",
  minimally_invasive: "MIS",
  small_footprint: "Compact",
  fleet_capable: "Fleet",
  ecosystem: "Ecosystem",
  class: "Class",
};

/** Priority ordering — decision-relevant physical specs first. */
const PRIORITY = [
  "dof",
  "arms",
  "height",
  "weight",
  "payload",
  "lift capacity",
  "max payload",
  "battery",
  "runtime",
  "endurance",
  "flight time",
  "hover time",
  "top speed",
  "walk speed",
  "range",
  "motor",
  "tank",
  "spray rate",
  "spread rate",
  "mtow",
  "ingress",
  "cameras",
  "actuators",
  "hand dof",
];

/** Keys that are prose/meta rather than a spec — never show on a card. */
const DROP_KEYS = new Set([
  "manufacturer", "category", "type", "notes", "placeholder", "confidence",
  "per", "use", "market", "outcome_claim", "function", "operation",
  "deployment", "qa", "research_kit", "indications", "procedures",
  "payloads", "sensors", "compute", "navigation", "positioning",
  "transmission", "charging", "safety", "autonomy_level", "operating",
  "cargo_bay", "delivery_mechanism", "noise_design", "cruise",
  "task", "dust_extraction", "remote_monitoring", "pilot_phases",
  "weeks_saved_pilot", "speed_vs_traditional", "batteries", "radar",
  "vision", "mapping", "gnss", "link", "charge_time",
  "obstacle_avoidance", "sterilization", "battery", "battery_swappable",
]);

function humanKey(k: string): string {
  if (LABEL_OVERRIDES[k]) return LABEL_OVERRIDES[k];
  let s = k;
  for (const [re] of UNIT_SUFFIX) s = s.replace(re, "");
  s = s.replace(/_/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function unitFor(k: string): string | undefined {
  if (UNIT_OVERRIDES[k]) return UNIT_OVERRIDES[k];
  const sorted = [...UNIT_SUFFIX].sort((a, b) => b[0].source.length - a[0].source.length);
  for (const [re, u] of sorted) if (re.test(k)) return u;
  return undefined;
}

function prettyNumber(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString("en-US");
  return String(Math.round(n * 100) / 100);
}

/**
 * Format a PlatformProfile.specs list ({label, value}) into card-ready specs.
 */
export function formatSpecs(specs: { label: string; value: string }[]): FormattedSpec[] {
  const out: FormattedSpec[] = [];

  for (const s of specs) {
    const key = s.label.toLowerCase().replace(/\s+/g, "_");
    if (DROP_KEYS.has(key)) continue;

    const raw = (s.value ?? "").trim();
    if (!raw || raw === "null" || raw === "undefined" || raw === "NaN") continue;
    if (raw.length > 26) continue;
    if (raw.startsWith("[") || raw.startsWith("{")) continue;

    let value = raw;
    let unit = unitFor(key);

    if (raw === "true") {
      value = "Yes";
      unit = undefined;
    } else if (raw === "false") {
      continue; // "No" adds nothing to a spec grid
    } else {
      const n = Number(raw);
      if (!Number.isNaN(n) && raw !== "") {
        value = prettyNumber(n);
        if (key.includes("price") && n > 0) {
          value = `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
          unit = undefined;
        }
      } else {
        value = raw.replace(/_/g, " ");
        if (value.length > 18) continue;
        unit = undefined;
      }
    }

    out.push({ label: humanKey(key), value, unit });
  }

  const seen = new Set<string>();
  const deduped = out.filter((s) => {
    const k = s.label.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  deduped.sort((a, b) => {
    const ai = PRIORITY.indexOf(a.label.toLowerCase());
    const bi = PRIORITY.indexOf(b.label.toLowerCase());
    const av = ai === -1 ? 999 : ai;
    const bv = bi === -1 ? 999 : bi;
    if (av !== bv) return av - bv;
    return a.label.localeCompare(b.label);
  });

  // Lenient second pass: some platforms (e.g. barn/ag robots) describe
  // themselves entirely in short descriptive strings that the strict filter
  // drops. Never render an empty spec grid.
  if (deduped.length === 0) {
    for (const s of specs) {
      const key = s.label.toLowerCase().replace(/\s+/g, "_");
      const raw = (s.value ?? "").trim();
      if (!raw || raw === "null" || raw.startsWith("[") || raw.startsWith("{")) continue;
      if (raw.length > 30) continue;
      const v = raw.replace(/_/g, " ");
      deduped.push({ label: humanKey(key), value: v.charAt(0).toUpperCase() + v.slice(1) });
      if (deduped.length >= 6) break;
    }
  }

  return deduped;
}
