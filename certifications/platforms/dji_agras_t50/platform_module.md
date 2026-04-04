# DJI Agras T50 — Platform Module

BCR canonical platform reference for the DJI Agras T50 agricultural spray drone. Validated against T50 firmware v08.01.00 and DJI Pilot 2 app v5.9.x.

---

## Physical Specifications

| Parameter | Value |
|---|---|
| Maximum Takeoff Weight | 103.6 kg (fully loaded) |
| Payload Capacity | 40 kg spray payload (liquid + solid) |
| Spray Tank Capacity | 40L liquid tank |
| Hopper Capacity (dry) | 50L dry material hopper |
| Spray Width | 9 m (nominal at 3 m altitude, 7 m/s speed) |
| Maximum Flight Speed | 10 m/s (spray mode), 15 m/s (transit mode) |
| Operating Radius | 7 km from controller |
| Battery | Two 30,000 mAh 51.8V LiPo batteries (dual-battery system) |
| Flight Time | 10 minutes (full payload), 23 minutes (empty) |
| IP Rating | IP67 (fully waterproof and dust-tight) |
| Operating Temperature | -10C to 45C |
| GPS | Dual GNSS: GPS + BeiDou + GLONASS |
| Regulatory Classification | UAS Category III (EU), FAA Part 137 (US agricultural operations) |

---

## Communication Topology

### DJI OcuSync 3.0 Radio Link

T50 uses DJI's OcuSync 3.0 for control link and telemetry:
- Frequency: 2.4 GHz and 5.8 GHz (auto-switch based on interference)
- Control link: 7 km maximum range (regulatory limit may be lower)
- Video link: 1080p/30fps FPV camera stream
- Telemetry: real-time flight data at 10 Hz to DJI RC Plus controller

### CAN Bus (Internal)

Internal DJI Agras T50 CAN bus connects:
- Flight controller to ESCs (4 motors, individual CAN nodes)
- Flight controller to spray controller
- Spray controller to nozzle solenoids (8 nozzles)
- Spray controller to flow sensors
- Battery management systems (2 independent BMS)

CAN bus is not externally accessible via standard ports on T50 — access is through DJI Agricultural Management Platform (DAMP) or DJI SDK for authorized enterprise integrators.

### DJI Mobile SDK / MSDK 5.0

For enterprise TechMedix integration:
```swift
// iOS SDK example
import DJISDK

DJISDKManager.registerApp(with: self)

// Get spray system data
let sprayManager = DJISDKManager.product()?.payload as? DJISprayManager
sprayManager?.getFlowRate(completion: { rate, error in
    // rate in L/min per nozzle
})
```

---

## BCR Canonical Signal ID Mapping

| BCR Signal ID | Source | Unit | Rate | Normal Range | P2 | P1 |
|---|---|---|---|---|---|---|
| t50_battery1_charge_pct | DJI SDK battery1.chargeRemainingInPercent | % | 1 Hz | 20-100% | < 20% | < 10% |
| t50_battery2_charge_pct | DJI SDK battery2.chargeRemainingInPercent | % | 1 Hz | 20-100% | < 20% | < 10% |
| t50_battery1_temp_c | DJI SDK battery1.temperature | C | 1 Hz | 15-55 C | > 58 C | > 65 C |
| t50_battery2_temp_c | DJI SDK battery2.temperature | C | 1 Hz | 15-55 C | > 58 C | > 65 C |
| t50_motor1_rpm | DJI SDK motors[0].rpm | RPM | 10 Hz | 1,800-4,500 RPM | < 1,600 | < 1,400 |
| t50_motor_rpm_asymmetry_pct | max(rpm)-min(rpm)/mean(rpm)*100 | % | 10 Hz | < 3% | > 5% | > 10% |
| t50_spray_flow_total_lpm | DJI DAMP spray.totalFlowRate | L/min | 5 Hz | 4-16 L/min | deviation > 10% | deviation > 20% |
| t50_nozzle_1_flow_lpm | DJI DAMP spray.nozzle[0].flowRate | L/min | 5 Hz | 0.5-2.0 L/min | deviation > 15% | deviation > 25% |
| t50_gps_satellite_count | DJI SDK flightController.satelliteCount | count | 1 Hz | >= 12 | < 8 | < 6 |
| t50_gps_hdop | DJI SDK flightController.HDOP | float | 1 Hz | < 1.5 | > 2.0 | > 3.0 |
| t50_payload_remaining_kg | DJI DAMP spray.tankWeight | kg | 2 Hz | 0-40 kg | N/A | N/A |
| t50_wind_speed_ms | DJI SDK flightController.windSpeed | m/s | 5 Hz | 0-7 m/s | > 7 m/s | > 10 m/s |

---

## Integration Notes

- T50 requires FAA Part 137 Agricultural Aircraft Operator Certificate for all commercial spray operations in the US.
- Spray operations require FIFRA-registered pesticide labels specifying aerial application is permitted.
- Maintain spray records: date, GPS coordinates of application area, product name and EPA registration number, application rate, pilot certificate number.
- DJI Agras Management Platform (DAMP) provides the most complete telemetry — some signals not available via mobile SDK.
- T50 is IP67 — rated for rain and washdown. Use low-pressure water only (< 10 psi) for exterior cleaning. Never spray at joints or electrical connectors.
- Battery temperature must be > 10C before flight — cold batteries reduce capacity significantly and can trigger BMS protection.
