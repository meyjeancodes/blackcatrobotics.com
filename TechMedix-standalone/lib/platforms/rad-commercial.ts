/**
 * RadCommercial eBike — detailed platform config
 */

import type { MaintenanceInterval } from "./lime-gen4";

export interface RadCommercialConfig {
  platformId: string;
  displayName: string;
  manufacturer: string;
  category: "micromobility";
  specs: {
    motor: string;
    battery: string;
    range: string;
    payload: string;
  };
  failureSignatures: {
    id: string;
    severity: "critical" | "warning" | "info";
    threshold: string;
    escalate: boolean;
  }[];
  maintenanceIntervals: Record<string, MaintenanceInterval>;
  sdkAccess: { portal: string; requiresAgreement: boolean; apiDocs: string };
}

const RAD_COMMERCIAL: RadCommercialConfig = {
  platformId: "radcommercial",
  displayName: "RadCommercial eBike",
  manufacturer: "Rad Power Bikes",
  category: "micromobility",
  specs: {
    motor: "750W rear hub",
    battery: "48V 14Ah 672Wh",
    range: "45+ miles",
    payload: "120 lbs",
  },
  failureSignatures: [
    { id: "battery-cell-drift",  severity: "warning",  threshold: "±60mV cell delta",         escalate: true  },
    { id: "battery-thermal",     severity: "critical", threshold: ">50°C at rest",             escalate: false },
    { id: "hub-motor-bearing",   severity: "warning",  threshold: "vibration >0.8g RMS",       escalate: true  },
    { id: "hub-motor-draw",      severity: "warning",  threshold: "current >13A sustained",    escalate: true  },
    { id: "stem-fold-wear",      severity: "critical", threshold: "torque <8Nm",               escalate: false },
    { id: "brake-pad-thin",      severity: "warning",  threshold: "<2mm estimated",            escalate: true  },
    { id: "connectivity-loss",   severity: "info",     threshold: ">15min offline",            escalate: false },
    { id: "tire-pressure-drop",  severity: "warning",  threshold: ">8 PSI/day loss",           escalate: true  },
    { id: "firmware-drift",      severity: "info",     threshold: "version delta >2 builds",   escalate: false },
    { id: "rack-mount-stress",   severity: "warning",  threshold: "mounting bolt torque <12Nm",escalate: false },
    { id: "range-degraded",      severity: "warning",  threshold: "<35mi reported per charge", escalate: true  },
  ],
  maintenanceIntervals: {
    batterySwap:      { interval: "500 cycles or 6 months",  signal: "battery-cell-drift"  },
    brakeInspect:     { interval: "30 days or 500 rides",    signal: "brake-pad-thin"      },
    tirePressure:     { interval: "14 days",                 signal: "tire-pressure-drop"  },
    stemTorque:       { interval: "90 days",                 signal: "stem-fold-wear"      },
    motorCurrentBase: { interval: "1,000 rides",             signal: "hub-motor-draw"      },
    bearingVibration: { interval: "6 months",                signal: "hub-motor-bearing"   },
    rackInspect:      { interval: "60 days or 200 deliveries",signal: "rack-mount-stress"  },
    rangeCalibration: { interval: "90 days",                 signal: "range-degraded"      },
    frameCrack:       { interval: "12 months",               signal: null                  },
    firmwareAudit:    { interval: "Monthly",                 signal: "firmware-drift"      },
    fullBenchTest:    { interval: "Annual",                  signal: null                  },
  },
  sdkAccess: {
    portal: "Rad Fleet API",
    requiresAgreement: false,
    apiDocs: "https://radpowerbikes.com/fleet",
  },
};

export default RAD_COMMERCIAL;
