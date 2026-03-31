/**
 * Lime Gen 4 eBike — detailed platform config
 * Used by MaintenanceSchedule and the platforms registry.
 */

export interface MaintenanceInterval {
  interval: string;
  signal: string | null;
}

export interface LimeGen4Config {
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
  sdkAccess: { portal: string; requiresAgreement: boolean; apiDocs: string };
}

const LIME_GEN4: LimeGen4Config = {
  platformId: "lime-gen4",
  displayName: "Lime Gen 4 eBike",
  manufacturer: "Lime",
  category: "micromobility",
  specs: {
    motor: "250W rear hub",
    battery: "36V swappable",
    range: "40+ miles",
    connectivity: "Proprietary cellular",
  },
  failureSignatures: [
    { id: "battery-cell-drift",  severity: "warning",  threshold: "±50mV cell delta",         escalate: true  },
    { id: "battery-thermal",     severity: "critical", threshold: ">45°C at rest",             escalate: false },
    { id: "hub-motor-bearing",   severity: "warning",  threshold: "vibration >0.8g RMS",       escalate: true  },
    { id: "hub-motor-draw",      severity: "warning",  threshold: "current >7A sustained",     escalate: true  },
    { id: "stem-fold-wear",      severity: "critical", threshold: "torque <8Nm",               escalate: false },
    { id: "brake-pad-thin",      severity: "warning",  threshold: "<2mm estimated",            escalate: true  },
    { id: "connectivity-loss",   severity: "info",     threshold: ">15min offline",            escalate: false },
    { id: "tire-pressure-drop",  severity: "warning",  threshold: ">8 PSI/day loss",           escalate: true  },
    { id: "firmware-drift",      severity: "info",     threshold: "version delta >2 builds",   escalate: false },
  ],
  maintenanceIntervals: {
    batterySwap:      { interval: "500 cycles or 6 months",  signal: "battery-cell-drift"  },
    brakeInspect:     { interval: "30 days or 500 rides",    signal: "brake-pad-thin"      },
    tirePressure:     { interval: "14 days",                 signal: "tire-pressure-drop"  },
    stemTorque:       { interval: "90 days",                 signal: "stem-fold-wear"      },
    motorCurrentBase: { interval: "1,000 rides",             signal: "hub-motor-draw"      },
    bearingVibration: { interval: "6 months",                signal: "hub-motor-bearing"   },
    frameCrack:       { interval: "12 months",               signal: null                  },
    firmwareAudit:    { interval: "Monthly",                 signal: "firmware-drift"      },
    fullBenchTest:    { interval: "Annual",                  signal: null                  },
    wheelTruing:      { interval: "3 months or 300 rides",   signal: null                  },
  },
  sdkAccess: {
    portal: "Lime DASH",
    requiresAgreement: true,
    apiDocs: "internal",
  },
};

export default LIME_GEN4;
