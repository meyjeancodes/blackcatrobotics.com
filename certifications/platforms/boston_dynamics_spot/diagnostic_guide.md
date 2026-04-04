# Boston Dynamics Spot — Diagnostic Guide

Field diagnostics for L2+ technicians. The Spot SDK is required for all programmatic diagnostics. Have the SDK authentication credentials ready before beginning.

---

## Boot LED Sequence

Spot has two indicator lights: the top body indicator bar (multi-color strip) and the belly indicator (single LED).

| Phase | Body Bar | Belly LED | Meaning |
|---|---|---|---|
| Power on | Solid white | Off | Computing hardware initializing |
| 0-15s | White chase | Off | Linux kernel and SDK server booting |
| 15-30s | Amber pulse | Off | E-stop and safety initialization |
| 30-45s | Yellow/green pulse | Off | Motor initialization and joint calibration |
| 45-60s | Solid blue | Blue | Ready but not powered (motors off) |
| Operational | Solid green | Green | Motors powered, fully operational |
| Fault | Red + amber alternating | Red | Fault state — check SDK fault list |
| E-stop engaged | Solid red | Red | Hardware e-stop pressed or software estop triggered |
| Low battery | Blue pulse (slow) | Blue | Battery < 15% — return to dock immediately |

If body bar does not reach solid green/blue within 90 seconds, check network connectivity to robot WiFi (SSID: SpotAP_XXXXXX) and verify SDK can authenticate.

---

## Joint Health Commands

**Step 1 — Authenticate and connect:**
```python
import bosdyn.client
from bosdyn.client.robot_state import RobotStateClient

sdk = bosdyn.client.create_standard_sdk('BCRDiagnostic')
robot = sdk.create_robot('192.168.80.3')
robot.authenticate('bcr_technician', '<BCR_SPOT_CREDENTIAL>')
state_client = robot.ensure_client(RobotStateClient.default_service_name)
```

**Step 2 — Get all joint states:**
```python
state = state_client.get_robot_state()
for joint in state.kinematic_state.joint_states:
    print(f"{joint.name}: pos={joint.position.value:.4f}rad "
          f"vel={joint.velocity.value:.4f}rad/s "
          f"load={joint.load.value:.2f}Nm "
          f"temp={joint.temperature.value:.1f}C")
```
Expected: 12 joints listed (fl_hx, fl_hy, fl_kn, fr_hx, fr_hy, fr_kn, rl_hx, rl_hy, rl_kn, rr_hx, rr_hy, rr_kn). Each should show non-zero position values when Spot is standing.

**Step 3 — Check for active faults:**
```python
state = state_client.get_robot_state()
faults = state.system_fault_state.faults
if not faults:
    print("No active faults")
else:
    for fault in faults:
        print(f"FAULT: {fault.name} | Severity: {fault.severity} | "
              f"Duration: {fault.duration.ToSeconds():.1f}s")
```
Any fault with severity FAULT_SEVERITY_CRITICAL must be resolved before returning to service.

---

## IMU Calibration Verification

```python
state = state_client.get_robot_state()
imu = state.kinematic_state.inertial_state

# Linear acceleration in robot body frame — Z axis at rest should be ~9.81 m/s2
az = imu.linear_acceleration.z
print(f"IMU Z-axis acceleration: {az:.4f} m/s2")
spec_lo, spec_hi = 9.71, 9.91
print(f"Specification: {spec_lo} - {spec_hi} m/s2")
print("PASS" if spec_lo <= az <= spec_hi else "FAIL - recalibration required")
```

Note: Spot must be standing on a level surface with motors powered for accurate IMU measurement.

Spot does not have a user-accessible IMU calibration service. If IMU Z-axis is out of specification: verify the robot is on a level surface (use digital level on foot pads). If out of spec on confirmed level surface, escalate to Boston Dynamics service.

---

## Battery Health Check

```python
state = state_client.get_robot_state()
power = state.power_state

print(f"Battery charge: {power.locomotion_charge_percentage:.1f}%")
print(f"Estimated runtime: {power.locomotion_estimated_runtime.seconds:.0f}s "
      f"({power.locomotion_estimated_runtime.seconds/60:.1f} min)")

# Check battery temperatures
for i, temp in enumerate(power.battery_temperatures):
    status = "OK" if temp < 45 else "HIGH"
    print(f"Battery cell {i+1} temp: {temp:.1f}C [{status}]")
```

**Battery capacity degradation test:** Fully charge to 100%, run a standard 30-minute walk at 0.8 m/s on flat ground, record SoC at end. If SoC < 55% after 30 minutes, battery capacity has degraded significantly and replacement is indicated.

---

## CAN/Internal Bus Equivalent — SDK Keepalive Check

Spot does not use CAN bus externally. SDK connectivity serves the equivalent diagnostic purpose:

```python
import time

# Test SDK keepalive — SDK connection must remain active during operation
start = time.time()
for _ in range(10):
    state = state_client.get_robot_state()
    elapsed = time.time() - start
    print(f"SDK response {elapsed:.3f}s - OK" if state else "TIMEOUT")
    time.sleep(1.0)
```

Expected: All 10 responses return within 500ms. Responses > 500ms indicate network or SDK server issues.

---

## Pre-Deployment Checklist

- [ ] Boot sequence completes to solid green/blue within 90 seconds
- [ ] 12 joints present with non-zero positions at standing pose
- [ ] Zero active faults in SDK fault list
- [ ] IMU Z-axis: 9.71-9.91 m/s2 (standing, level surface)
- [ ] Battery SoC > 40%
- [ ] Battery cell temperatures all < 45C
- [ ] Estimated runtime > 900 seconds (15 minutes minimum)
- [ ] Maximum motor temperature < 65C
- [ ] All BCR signal IDs populating in TechMedix
- [ ] 5-minute walk validation with payload at rated weight — no faults
- [ ] E-stop test: engage and disengage e-stop, verify state transitions correctly
- [ ] Work order documentation complete
