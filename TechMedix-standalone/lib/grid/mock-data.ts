// ─── Types ────────────────────────────────────────────────────────────────────

export type NodeType        = "solar" | "charger" | "ev" | "datacenter";
export type NodeStatus      = "online" | "warning" | "offline" | "idle";
export type TradeStatus     = "completed" | "pending";
export type TradeType       = "sell" | "buy";
export type GridMode        = "selling" | "buying" | "balanced";
export type RatePeriodType  = "off-peak" | "solar" | "peak" | "mid";
export type ScheduleType    = "charge" | "solar" | "hold";

export interface GridStatus {
  currentRate:       number;       // $/kWh
  sellFloor:         number;       // $/kWh
  buyRate:           number;       // $/kWh
  surplus:           number;       // kWh
  autoTradeEnabled:  boolean;
  mode:              GridMode;
  netThisMonth:      number;       // $
  lastUpdated:       Date;
}

export interface GridNode {
  id:                string;
  name:              string;
  type:              NodeType;
  location:          string;
  status:            NodeStatus;
  revenueThisMonth:  number;
  costThisMonth:     number;
  netThisMonth:      number;
  // solar
  outputKwh?:        number;
  capacityKw?:       number;
  health?:           number;
  // charger
  sessionsToday?:    number;
  // ev
  batteryPct?:       number;
  rangeRemaining?:   number;
  chargeTargetPct?:  number;
  chargeByTime?:     string;
  // datacenter
  robots?:           number;
  avgHealth?:        number;
  uptimeSLA?:        number;
}

export interface ScheduleBlock {
  startHour:   number;
  endHour:     number;
  type:        ScheduleType;
  ratePeriod:  RatePeriodType;
  kwhPlanned:  number;
  approved:    boolean;
}

export interface Trade {
  id:           string;
  timestamp:    Date;
  type:         TradeType;
  kwhAmount:    number;
  pricePerKwh:  number;
  total:        number;
  status:       TradeStatus;
  nodeId:       string;
}

export interface RatePeriod {
  hour:    number;
  rate:    number;
  period:  RatePeriodType;
}

// ─── Grid Status ──────────────────────────────────────────────────────────────

export const GRID_STATUS_INITIAL: GridStatus = {
  currentRate:      0.087,
  sellFloor:        0.065,
  buyRate:          0.094,
  surplus:          14.2,
  autoTradeEnabled: true,
  mode:             "selling",
  netThisMonth:     847,
  lastUpdated:      new Date(),
};

// ─── Nodes ────────────────────────────────────────────────────────────────────

export const NODES: GridNode[] = [
  {
    id: "solar-habitat-tx01", name: "HABITAT-TX-01", type: "solar",
    location: "Austin, TX", status: "online",
    outputKwh: 18.4, capacityKw: 22, health: 96,
    revenueThisMonth: 312, costThisMonth: 0, netThisMonth: 312,
  },
  {
    id: "solar-unit-101", name: "HABITAT Unit 101", type: "solar",
    location: "Austin, TX", status: "online",
    outputKwh: 18.4, capacityKw: 22, health: 94,
    revenueThisMonth: 298, costThisMonth: 0, netThisMonth: 298,
  },
  {
    id: "solar-unit-202", name: "HABITAT Unit 202", type: "solar",
    location: "Austin, TX", status: "warning",
    outputKwh: 14.2, capacityKw: 22, health: 78,
    revenueThisMonth: 201, costThisMonth: 0, netThisMonth: 201,
  },
  {
    id: "charger-bay1", name: "DC Fast Charger Bay 1", type: "charger",
    location: "Dallas, TX", status: "online",
    outputKwh: 0, capacityKw: 150, health: 99,
    sessionsToday: 7,
    revenueThisMonth: 1840, costThisMonth: 620, netThisMonth: 1220,
  },
  {
    id: "ev-fleet-01", name: "Tesla Model Y — Fleet-01", type: "ev",
    location: "Austin HQ", status: "idle",
    batteryPct: 82, rangeRemaining: 248, health: 97,
    revenueThisMonth: 0, costThisMonth: 44, netThisMonth: -44,
    chargeTargetPct: 90, chargeByTime: "07:00",
  },
  {
    id: "dc-dal01", name: "DAL-01 Dallas", type: "datacenter",
    location: "Dallas, TX", status: "online",
    robots: 8, avgHealth: 96, uptimeSLA: 99.8,
    revenueThisMonth: 2392, costThisMonth: 0, netThisMonth: 2392,
  },
  {
    id: "dc-nyc02", name: "NYC-02 New York", type: "datacenter",
    location: "New York, NY", status: "warning",
    robots: 12, avgHealth: 91, uptimeSLA: 99.4,
    revenueThisMonth: 3588, costThisMonth: 0, netThisMonth: 3588,
  },
  {
    id: "dc-lax01", name: "LAX-01 Los Angeles", type: "datacenter",
    location: "Los Angeles, CA", status: "online",
    robots: 6, avgHealth: 94, uptimeSLA: 99.1,
    revenueThisMonth: 1794, costThisMonth: 0, netThisMonth: 1794,
  },
];

// ─── Charge Schedule ──────────────────────────────────────────────────────────

export const CHARGE_SCHEDULE: ScheduleBlock[] = [
  { startHour: 1,  endHour: 4,  type: "charge", ratePeriod: "off-peak", kwhPlanned: 28, approved: true  },
  { startHour: 9,  endHour: 11, type: "solar",  ratePeriod: "solar",    kwhPlanned: 14, approved: true  },
  { startHour: 14, endHour: 15, type: "hold",   ratePeriod: "peak",     kwhPlanned: 0,  approved: true  },
  { startHour: 19, endHour: 20, type: "charge", ratePeriod: "mid",      kwhPlanned: 8,  approved: false },
];

// ─── Trade History ────────────────────────────────────────────────────────────

const now = Date.now();
const mins = (m: number) => new Date(now - m * 60 * 1000);

export const TRADE_HISTORY: Trade[] = [
  { id: "t-001", timestamp: mins(4),   type: "sell", kwhAmount: 12.4, pricePerKwh: 0.089, total: 1.10, status: "completed", nodeId: "solar-habitat-tx01" },
  { id: "t-002", timestamp: mins(12),  type: "sell", kwhAmount: 8.2,  pricePerKwh: 0.091, total: 0.75, status: "completed", nodeId: "solar-unit-101"      },
  { id: "t-003", timestamp: mins(18),  type: "sell", kwhAmount: 14.2, pricePerKwh: 0.087, total: 1.24, status: "pending",   nodeId: "solar-habitat-tx01" },
  { id: "t-004", timestamp: mins(35),  type: "buy",  kwhAmount: 22.0, pricePerKwh: 0.094, total: 2.07, status: "completed", nodeId: "ev-fleet-01"         },
  { id: "t-005", timestamp: mins(52),  type: "sell", kwhAmount: 9.6,  pricePerKwh: 0.088, total: 0.84, status: "completed", nodeId: "solar-unit-202"      },
  { id: "t-006", timestamp: mins(71),  type: "sell", kwhAmount: 11.3, pricePerKwh: 0.086, total: 0.97, status: "completed", nodeId: "solar-unit-101"      },
  { id: "t-007", timestamp: mins(95),  type: "buy",  kwhAmount: 14.8, pricePerKwh: 0.094, total: 1.39, status: "completed", nodeId: "charger-bay1"        },
  { id: "t-008", timestamp: mins(118), type: "sell", kwhAmount: 7.4,  pricePerKwh: 0.092, total: 0.68, status: "completed", nodeId: "solar-habitat-tx01" },
  { id: "t-009", timestamp: mins(140), type: "sell", kwhAmount: 16.1, pricePerKwh: 0.085, total: 1.37, status: "completed", nodeId: "solar-unit-101"      },
  { id: "t-010", timestamp: mins(165), type: "sell", kwhAmount: 10.8, pricePerKwh: 0.090, total: 0.97, status: "completed", nodeId: "solar-unit-202"      },
];

// ─── Rate Forecast ────────────────────────────────────────────────────────────

function ratePeriodForHour(hour: number): RatePeriodType {
  if (hour < 6)             return "off-peak";
  if (hour < 9)             return "mid";
  if (hour < 15)            return "solar";
  if (hour < 22)            return "peak";
  return "off-peak";
}

function rateForHour(hour: number): number {
  const period = ratePeriodForHour(hour);
  // deterministic pseudo-random using hour as seed
  const frac = ((hour * 17 + 7) % 97) / 97;
  switch (period) {
    case "off-peak": return parseFloat((0.062 + frac * 0.012).toFixed(3));
    case "mid":      return parseFloat((0.074 + frac * 0.011).toFixed(3));
    case "solar":    return parseFloat((0.071 + frac * 0.014).toFixed(3));
    case "peak":     return parseFloat((0.094 + frac * 0.024).toFixed(3));
  }
}

export const RATE_FORECAST: RatePeriod[] = Array.from({ length: 24 }, (_, hour) => ({
  hour,
  rate:   rateForHour(hour),
  period: ratePeriodForHour(hour),
}));
