# L2 Technician Curriculum

Five sections covering diagnostic tools, actuator systems, sensor systems, software, and repair procedures.

---

## Section 1: Diagnostic Tools and Signal Analysis

L2 technicians use electronic diagnostic tools to identify faults that are invisible to visual inspection.

### Multimeter (CAT III, 600V Rated)

Bus voltage measurement specifications:
- 12V bus (legacy sensors, some peripheral loads): expect 11.5-12.6V under load
- 24V bus (mid-power actuators, computing boards): expect 23.0-25.2V
- 48V bus (primary humanoid drive actuators): expect 46.0-50.4V

Motor winding resistance: measure between any two motor terminals with motor disconnected:
- Healthy winding resistance range: 0.1 - 2.0 Ohm depending on motor size
- Open circuit (infinite resistance): wire break or burned winding
- Short to ground (< 0.1 Ohm): insulation failure — motor must be replaced

### Oscilloscope (PWM Analysis)

Motor control signals use PWM (Pulse Width Modulation):
- Standard servo PWM: 50Hz carrier, 1-2ms pulse width (1ms = full reverse, 1.5ms = stop, 2ms = full forward)
- High-frequency FOC drive: 8-20kHz switching frequency; use oscilloscope to verify switching waveform quality
- Faulty drive symptoms: asymmetric PWM duty cycles, ringing at switching transitions, flatline (no PWM = driver fault)

### CAN Bus Diagnostics (candump)

```bash
# List available CAN interfaces
ip link show type can

# Capture live CAN traffic (save to file)
candump -l can0

# View traffic on screen
candump can0

# Filter to specific arbitration ID (e.g., 0x141 = Unitree G1 right knee motor)
candump can0 | grep ' 141 '
```

CANopen rates on humanoid platforms: 1 Mbit/s typical. Set interface before capture:
```bash
ip link set can0 type can bitrate 1000000
ip link set can0 up
```

Arbitration ID structure on Unitree platforms:
- IDs 0x001-0x007: NMT (network management)
- IDs 0x181-0x1FF: PDO Transmit (robot publishing sensor data)
- IDs 0x201-0x27F: PDO Receive (operator sending commands)
- IDs 0x581-0x5FF: SDO (parameter access, configuration)

### ROS 2 Diagnostics

```bash
# List all active nodes
ros2 node list

# List all topics with types
ros2 topic list -t

# Check publish rate on a topic
ros2 topic hz /joint_states

# Echo topic data (Ctrl+C to stop)
ros2 topic echo /joint_states

# Check for communication issues
ros2 doctor

# View topic info (publishers, subscribers, QoS)
ros2 topic info /imu/data -v
```

Key G1 topics:
- `/joint_states` — 500Hz, all 43 joint positions, velocities, torques
- `/imu/data` — 200Hz, acceleration and angular velocity
- `/camera/depth` — 30fps, depth image from front stereo camera
- `/diagnostics` — 10Hz, hardware health summary

---

## Section 2: Actuator Systems

### BLDC Motor Principles

Brushless DC motors (BLDC) dominate robotic actuators due to high power density and long service life. Key principles:
- Three-phase electrical drive; motor controller (ESC or servo driver) commutates phases electronically
- Position sensing via encoder or Hall effect sensors determines commutation angle
- Field-oriented control (FOC) enables smooth torque control at all speeds

### Harmonic Drives

Harmonic drives provide high gear reduction with zero backlash, critical for precise joint control:
- Components: wave generator (input shaft with elliptical cam), flex spline (thin-walled gear, output), circular spline (rigid ring gear, fixed)
- Gear ratios: 50:1 to 160:1 typical for humanoid joint applications
- Advantages: zero backlash, high torque-to-weight ratio, compact
- Failure modes: flex spline fatigue fracture (catastrophic, usually preceded by increasing noise), tooth wear (gradual, detectable by backlash measurement)

### Joint Telemetry — Unitree G1 Knee Example

The G1 knee joint (a 43 DOF platform uses knees as highest-load joints):
- Position range: +/- 2.7 radians from center
- Velocity range: +/- 10 rad/s maximum
- Torque range: +/- 45 Nm continuous

Telemetry interpretation:
- Position spikes (single frame outlier): encoder noise — normal if isolated
- Velocity exceeding 10 rad/s: flag for investigation — may indicate control fault
- Torque above 40 Nm sustained: overload condition — check for mechanical binding

### Bearing Defect Frequency Formula

Surface defects on bearing races produce vibration at characteristic frequencies:
- BPFO (ball pass frequency outer race) = (N/2) * RPM/60 * (1 - d/D * cos(a))
- Where N = number of balls, d = ball diameter, D = pitch diameter, a = contact angle
- Use an accelerometer + FFT to identify BPFO peaks indicating outer race wear

---

## Section 3: Sensor Systems

### IMU (Inertial Measurement Unit)

Common IMU: MPU-9250 (or equivalent) used in many humanoid platforms:
- Accelerometer range: +/- 16g
- Gyroscope range: +/- 2000 degrees/second
- Magnetometer: +/- 4800 uT

Calibration procedure:
1. Place robot on a stable, level surface
2. Run `ros2 topic echo /imu/data` — verify [0, 0, 9.81 +/- 0.1 m/s2] on Z axis at rest
3. If Z-axis reading deviates > 0.1 m/s2, run platform IMU calibration tool (platform-specific)
4. After calibration, record calibration timestamp in TechMedix

### Force/Torque Sensors

Wrist and foot F/T sensors enable contact detection and safe interaction:
- Six-axis measurement: Fx, Fy, Fz (forces in N) and Mx, My, Mz (moments in Nm)
- Zero-point calibration: with sensor unloaded, values should be < 0.5N / < 0.05 Nm
- Drift over time: recalibrate at 500-hour intervals

### Camera Cleaning

- Use only lens-grade microfiber cloths and isopropyl alcohol (>90%)
- Apply alcohol to cloth, not lens
- Single-pass wipe from center outward — do not circular-scrub (introduces micro-scratches)
- Clean stereo cameras as a pair — dirty left lens with clean right lens causes depth calibration errors

### LiDAR Point Cloud Density

Healthy LiDAR: 100,000+ points/second at 10-15Hz scan rate. Degraded cloud density indicates:
- Lens contamination: clean aperture with compressed air first, then optical cloth
- Internal mirror fault: service required (L3+)
- Environmental absorption: normal near glass, matte black surfaces, and heavy rain

---

## Section 4: Software and Firmware

### Firmware Update Procedure

Standard procedure for any BCR-supported platform:
1. Verify current firmware version: `ros2 param get /firmware_manager current_version`
2. Download target firmware from BCR firmware repository (verify SHA256 hash before flashing)
3. Put robot in firmware update mode (platform-specific command)
4. Flash firmware using OEM updater tool
5. Verify update: re-check version after reboot
6. Run post-update validation: joint range of motion test, IMU calibration check, network connectivity

Never flash firmware to a robot with battery below 40% SoC. Power loss during flash can brick the controller.

### ROS 2 Node Health

Healthy node indicators:
- Node publishing at specified frequency (+/- 10%)
- No error messages in `ros2 doctor` output
- No stuck subscribers (old message timestamps in topic info)

Unhealthy indicators:
- Topic publishing at < 80% of expected rate: check CPU load, bus utilization
- Node crash/restart: check `journalctl -u ros2_*` for error logs
- Missing node: check if launch file is running correctly

---

## Section 5: Repair Procedures

### Actuator R&R Torque Sequence

When replacing a joint actuator module:
1. Confirm LOTO — hardwired E-stop, battery disconnected, network isolated
2. Support the affected limb mechanically before disconnecting actuator
3. Disconnect motor power and encoder connectors in that order
4. Remove mounting fasteners in reverse torque sequence (center-out pattern)
5. Install new actuator, hand-tighten all fasteners before any torquing
6. Torque in center-out pattern to specification (see platform-specific values)
7. Reconnect encoder before motor power
8. Power on and verify joint registers correct position

### Cable Management

- Minimum bend radius: 10x cable outer diameter (OD)
- After R&R, verify cables are not pinched at joint extremes — manually articulate through full range while observing cable routing
- Use OEM-specified cable tie positions — do not add ties that restrict intended flex points

### Post-Repair Validation

Every actuator R&R requires TechMedix post-repair validation log:
- Joint position range: verify reaches specification endpoints (+/- 2.7 rad for G1 knee)
- Joint velocity: verify able to reach 5 rad/s in a controlled move
- Torque calibration: verify torque reading matches calibration fixture
- Temperature at 10 minutes of operation: must not exceed 60C
- No new fault codes generated

All validation data must be uploaded to TechMedix before work order is closed.
