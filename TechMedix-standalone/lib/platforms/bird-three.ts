/**
 * Bird Three Scooter — detailed platform config
 */

import type { MaintenanceInterval } from "./lime-gen4";

export interface BirdThreeConfig {
  platformId: string;
  displayName: string;
  manufacturer: string;
  category: "micromobility";
  specs: {
    motor: string;
    battery: string;
    range: string;
    connectivity: string;
  };
  failureSignatures: {
    id: string;
    severity: "critical" | "warning" | "info";
    threshold: string;
    escalate: boolean;
  }[];
  maintenanceIntervals: Record<string, MaintenanceInterval>;
  maxMileage: number;
  sdkAccess: { portal: string; requiresAgreement: boolean; apiDocs: string };
}

const BIRD_THREE: BirdThreeConfig = {
  platformId: "bird-three",
  displayName: "Bird Three Scooter",
  manufacturer: "Bird",
  category: "micromobility",
  specs: {
    motor: "350W rear hub",
    battery: "36V 10.5Ah integrated",
    range: "25+ miles",
    connectivity: "Cellular + BLE",
  },
  failureSignatures: [
    { id: "battery-cell-drift",       severity: "warning",  threshold: "±50mV cell delta",          escalate: true  },
    { id: "battery-thermal",          severity: "critical", threshold: ">60°C BMS cutoff",           escalate: false },
    { id: "hub-motor-bearing",        severity: "warning",  threshold: "vibration >0.8g RMS",        escalate: true  },
    { id: "hub-motor-draw",           severity: "warning",  threshold: "current >10A sustained",     escalate: true  },
    { id: "stem-fold-wear",           severity: "critical", threshold: "torque <8Nm",                escalate: false },
    { id: "brake-pad-thin",           severity: "warning",  threshold: "<2mm estimated",             escalate: true  },
    { id: "connectivity-loss",        severity: "info",     threshold: ">15min offline",             escalate: false },
    { id: "tire-pressure-drop",       severity: "warning",  threshold: ">8 PSI/day loss",            escalate: true  },
    { id: "firmware-drift",           severity: "info",     threshold: "version delta >2 builds",    escalate: false },
    { id: "alarm-drain",              severity: "warning",  threshold: "overnight SOC drop >15%",    escalate: false },
    { id: "brake-lever-corrosion",    severity: "warning",  threshold: "lever force delta >25%",     escalate: true  },
  ],
  maintenanceIntervals: {
    batteryInspect:   { interval: "6 months or 2,000 rides", signal: "battery-cell-drift"    },
    brakeInspect:     { interval: "30 days or 500 rides",    signal: "brake-pad-thin"        },
    tirePressure:     { interval: "14 days",                 signal: "tire-pressure-drop"    },
    stemTorque:       { interval: "90 days",                 signal: "stem-fold-wear"        },
    motorCurrentBase: { interval: "1,000 rides",             signal: "hub-motor-draw"        },
    bearingVibration: { interval: "6 months",                signal: "hub-motor-bearing"     },
    alarmSystemCheck: { interval: "Monthly",                 signal: "alarm-drain"           },
    brakeCorrosion:   { interval: "60 days or wet season",   signal: "brake-lever-corrosion" },
    frameCrack:       { interval: "12 months",               signal: null                    },
    firmwareAudit:    { interval: "Monthly",                 signal: "firmware-drift"        },
    fullBenchTest:    { interval: "Annual or 8,000 miles",   signal: null                    },
  },
  maxMileage: 8000,
  sdkAccess: {
    portal: "Bird Ops Console",
    requiresAgreement: true,
    apiDocs: "internal",
  },
};

export default BIRD_THREE;
