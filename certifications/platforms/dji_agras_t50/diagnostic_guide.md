# DJI Agras T50 — Diagnostic Guide

Field diagnostics for L2+ technicians. T50 maintenance involves agricultural chemicals — always wear appropriate PPE (nitrile gloves, eye protection) before handling tanks or nozzles. Ensure the T50 is powered off and propellers are removed before performing any maintenance.

---

## Boot LED Sequence

T50 has an arm LED system (one per motor arm) and a body indicator.

| Phase | Arm LEDs | Body LED | Meaning |
|---|---|---|---|
| Power on | All red | Red | System initializing |
| 0-5s | Amber chase | Amber | Flight controller booting |
| 5-15s | Red/green alternating | Amber | GPS acquiring and IMU initializing |
| 15-30s | Slow green flash | Green flash | Searching for GPS satellites (> 12 required) |
| 30-60s | Solid green | Solid green | Ready for flight (GPS lock acquired) |
| Flying | Green pulse | Off | Normal flight |
| Low battery | Rapid amber flash | Amber | Battery < 20% — return to home |
| Critical battery | Rapid red flash | Red | Battery < 10% — auto-landing imminent |
| Fault | Red flash pattern | Red | Fault — count flashes, refer to DJI error code table |

If LEDs do not reach solid green within 90 seconds outdoors: check GPS satellite count in DJI Pilot 2 app. If satellite count < 12 or HDOP > 1.5, wait or relocate to open sky area. Do not fly.

---

## Joint Health Check — Motor/ESC Diagnostics

Connect to T50 via DJI Pilot 2 app on the RC Plus controller. Navigate to Aircraft Status → Motors.

**Step 1 — Pre-flight motor check:**
1. Ensure propellers are NOT installed.
2. In DJI Pilot 2, navigate to: Menu → Safety → Motor Idle Check.
3. Spin each motor individually at low RPM.
4. Listen for: smooth operation (no clicking, grinding, or irregular rhythmic noise).
5. Observe: LED on that motor arm should pulse green during test.
6. Record RPM for each motor — should be within 5% of each other.

**Step 2 — ESC health:**
In DJI Pilot 2: Aircraft → Advanced → ESC Status. Expected status: NORMAL for all 4 ESCs. FAULT or WARNING requires investigation before flight.

**Step 3 — Spray pump check:**
1. Fill tank with clean water (minimum 1L).
2. Power on spray pump via DJI Pilot 2: Menu → Spray → Manual Spray Mode.
3. Set flow rate to 8 L/min.
4. Observe all 8 nozzles — each should produce an even fan spray pattern.
5. Measure flow rate with graduated container and timer if flow deviation alert is active.

---

## IMU Calibration Verification

T50 IMU is calibrated automatically during power-on if the aircraft is stationary for 30 seconds.

**IMU status check:**
In DJI Pilot 2: Aircraft → IMU Status. Expected: Calibration Status = Calibrated, all axes showing green.

**Manual IMU check via DAMP:**
```
GET /api/v1/aircraft/{serial}/telemetry/imu
Response: {
  "accel_z": 9.82,
  "accel_x": 0.02,
  "accel_y": -0.01,
  "gyro_z": 0.001,
  "status": "calibrated"
}
```

Expected Z-axis acceleration: 9.71-9.91 m/s2 with aircraft level and stationary.

If IMU shows "Needs Calibration" status:
1. Place aircraft on level surface (verify with digital level on landing legs — must be < 1 degree).
2. In DJI Pilot 2: Aircraft → IMU → Calibrate IMU.
3. Follow on-screen rotation sequence (6-point IMU calibration).
4. Re-verify status: should show Calibrated within 3 minutes.

---

## CAN Bus Heartbeat — Internal Diagnostics via DAMP

T50's internal CAN bus is not directly accessible. Use DJI Agriculture Management Platform (DAMP) for equivalent heartbeat verification:

**In DAMP web portal:**
1. Navigate to Fleet → [T50 Aircraft] → System Health.
2. Verify all subsystems show green status:
   - Flight Controller: ONLINE
   - Spray Controller: ONLINE
   - ESC 1-4: ONLINE
   - BMS 1: ONLINE
   - BMS 2: ONLINE
   - GNSS Module: ONLINE

**Via DAMP API:**
```
GET /api/v1/aircraft/{serial}/system_health
Response: {"components": [{"name": "spray_controller", "status": "ONLINE"}, ...]}
```

Any component showing OFFLINE or ERROR requires investigation before flight.

---

## TechMedix Signal Verification

After powering T50 and connecting to DJI cloud sync:
1. Open TechMedix → Robots → [T50 Unit] → Signal Feed
2. Filter by prefix `t50_`
3. Verify all signals update within the expected intervals
4. Pay particular attention to `t50_motor_rpm_asymmetry_pct` — this should be < 3% on ground test
5. Verify `t50_gps_satellite_count` >= 12 before any outdoor operation

---

## Pre-Flight Checklist

- [ ] Aircraft powered off — remove and inspect all 8 propellers for chips, cracks, or deformation
- [ ] Reinstall propellers — verify positive lock (CW to CCW match on each motor)
- [ ] Boot sequence completes to solid green on all arm LEDs
- [ ] GPS: >= 12 satellites, HDOP < 1.5
- [ ] IMU: Calibrated status, Z-axis 9.71-9.91 m/s2
- [ ] Both batteries > 40% SoC and temperature > 10C
- [ ] Both battery temperatures < 55C
- [ ] All ESCs: NORMAL status in DJI Pilot 2
- [ ] Spray system: pump operates, all 8 nozzles produce even spray pattern
- [ ] Flow sensor calibrated against reference measurement (within 5%)
- [ ] Tank level sensor reads correctly (compare to dipstick measurement)
- [ ] Wind speed < 7 m/s at operation altitude
- [ ] All DAMP system components show ONLINE
- [ ] FAA Part 137 records prepared for this operation
- [ ] Work order documentation complete
