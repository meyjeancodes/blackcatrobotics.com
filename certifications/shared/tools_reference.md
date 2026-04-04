# Tools Reference for Robot Field Technicians

Standard tools used in BCR field service operations. Required for L2+ certification. Platform-specific tool requirements are listed in each platform module.

---

## Diagnostic Tools

### CAN Bus Analyzer — Peak PCAN-USB

- **Purpose:** Connect laptop to robot CAN bus for frame capture and transmission
- **Connection:** DSUB-9 to laptop USB-A
- **Software:** `can-utils` (Linux) — provides `candump`, `cansend`, `canfdtest`
- **Installation:** `sudo apt install can-utils`
- **Setup:**
  ```bash
  # Bring up CAN interface at 1 Mbps (G1/H1-2)
  sudo ip link set can0 type can bitrate 1000000
  sudo ip link set up can0
  # Verify: ip link show can0
  ```
- **Termination:** PCAN-USB has a built-in software-selectable 120-ohm terminator. Enable via pcan software when the laptop is at one end of the bus.
- **BCR Part Number:** BCR-TOOL-PCAN-USB-001

### Digital Multimeter — Fluke 117

- **Purpose:** Voltage, resistance, and continuity measurements on power rails and CAN bus
- **Key measurements:**
  - CAN-H to CAN-L resistance (bus off): expect 55-65 ohm (two 120-ohm terminators)
  - Battery terminal voltage: expect 43-54.6V for 48V Li-Ion systems
  - Motor winding resistance: expect 0.1-2.0 ohm between terminals (0 ohm = short, OL = open)
- **Safety:** Never use on circuits above the multimeter's rating. Fluke 117 is rated CAT III 600V.
- **BCR Part Number:** BCR-TOOL-DMM-FLUKE117-001

### Oscilloscope — Rigol DS1054Z (4-channel, 50 MHz)

- **Purpose:** Waveform analysis of CAN bus signals, power rail ripple, and motor back-EMF
- **CAN Bus Probing:**
  - Probe 1 (Channel 1): CAN-H to signal ground
  - Probe 2 (Channel 2): CAN-L to signal ground
  - Use Math channel: CH1 - CH2 = differential CAN signal
  - Set trigger: CH1, rising edge, ~3.0V (CAN-H dominant level)
  - Expected: 2.5V recessive, 3.5V dominant on CAN-H
- **Power Rail Ripple:**
  - Set AC coupling to remove DC offset
  - Set vertical scale: 50mV/div for 48V bus ripple measurement
  - Set trigger: external, at PWM switching frequency (look for 50 kHz for DC-DC converters)
- **BCR Part Number:** BCR-TOOL-SCOPE-DS1054Z-001

### Laptop — Dell Latitude 5540 (Ubuntu 22.04)

- **Purpose:** ROS 2 diagnostics, CAN bus monitoring, SDK access, TechMedix dashboard
- **Required software:**
  - ROS 2 Humble (ros-humble-desktop-full)
  - can-utils (sudo apt install can-utils)
  - Python 3.10 with unitree_sdk, bosdyn packages
  - Spot SDK: pip install bosdyn-client bosdyn-mission
- **Network:** Configured with static IP 192.168.123.100 for Unitree platform access; 192.168.80.100 for Spot access
- **BCR Part Number:** BCR-TOOL-LAPTOP-001

---

## Mechanical Tools

### Torque Wrench — Wiha 28562 (2-25 Nm)

- **Purpose:** Actuator mounting fasteners, cover panel fasteners, battery compartment fasteners
- **Calibration:** Verify at beginning of each workday — apply to calibration fixture and confirm within ±3% of setting
- **Common settings:**
  - M3 fasteners (cover panels, sensors): 2-3 Nm
  - M4 fasteners (bracket mounts): 4-5 Nm
  - M5 fasteners (actuator mounts, battery): 6-8 Nm
  - M6 fasteners (structural): 10-12 Nm
  - Always verify torque specification in OEM service manual before applying
- **BCR Part Number:** BCR-TOOL-TORQUE-WIHA-001

### Allen Key Set — Wera 950/9 Hex-Plus (1.5mm-10mm)

- **Purpose:** M2-M12 socket head cap screws used throughout all robot platforms
- **Note:** G1 and H1-2 use primarily M3-M6 fasteners. T50 uses M4-M8. Spot uses T30 Torx for battery cover.
- **BCR Part Number:** BCR-TOOL-ALLEN-WERA-001

### Torx Driver Set — Wiha 362 (T6-T30)

- **Purpose:** Boston Dynamics Spot battery cover (T30), some cover panel fasteners
- **BCR Part Number:** BCR-TOOL-TORX-WIHA-001

### Precision Tweezers — ESD-safe (4-piece set)

- **Purpose:** Connector manipulation, small fastener handling in tight spaces
- **ESD rating:** Required for all electronics work
- **BCR Part Number:** BCR-TOOL-TWEEZERS-ESD-001

---

## Calibration and Measurement

### Digital Level — Starrett 98-18 (18-inch, 0.0005"/inch sensitivity)

- **Purpose:** Verifying robot is level before IMU calibration. Placed on robot foot pads or a reference surface.
- **Specification:** Level must be within 0.5 degrees for IMU calibration to be valid
- **Conversion:** 0.5 degrees ≈ 0.0087 radians ≈ 0.0017 inches per inch reading
- **BCR Part Number:** BCR-TOOL-LEVEL-STARRETT-001

### Flow Rate Meter — Graduated cylinder 2L with stopwatch

- **Purpose:** Verifying DJI Agras T50 nozzle flow rates against specification
- **Procedure:** Collect spray output for exactly 60 seconds with graduated cylinder, read volume in mL, convert to L/min
- **Specification:** Each nozzle: 500-2,000 mL/min depending on operating pressure and nozzle type
- **BCR Part Number:** BCR-TOOL-FLOW-CYLINDER-001

---

## Cleaning and Maintenance Materials

| Material | Use | Specification |
|---|---|---|
| Isopropyl alcohol (IPA) 99% | Connector cleaning, lens cleaning | Electronics grade, < 1% water |
| DeoxIT D5 contact cleaner | Oxidized connector contacts | Fader/contact restoration formula |
| Harmonic Grease SK-1A | Harmonic drive flex spline lubrication | OEM-specified — Harmonic Drive AG |
| Corrosion-X HD | Connector and seal protection in corrosive environments | Aviation grade |
| Loctite 243 (blue) | Bolt thread locking — medium strength (removable) | For all structural robot fasteners |
| Loctite 271 (red) | Bolt thread locking — high strength (permanent) | Only where specified in OEM manual |
| Lint-free optical wipes | Camera lens and LiDAR dome cleaning | Individually wrapped |
| Compressed air (filtered, dry) | Debris removal from joint gaps and connectors | < 30 psi; filtered to prevent moisture |

---

## Field Tool Kit — Required Contents (BCR Standard)

Every BCR technician must carry the following tools on all field service visits:

- Fluke 117 multimeter
- Allen key set (1.5-10mm)
- Torx driver set (T6-T30)
- Calibrated torque wrench (2-25 Nm)
- Peak PCAN-USB CAN analyzer
- ESD-safe tweezers
- Digital level
- IPA 99%, lint-free wipes
- DeoxIT D5
- Loctite 243 (blue)
- BCR LOTO tags and locks (2 sets)
- PPE: safety glasses, nitrile gloves, ESD wrist strap
- Spare fasteners: M3x8, M4x10, M4x12, M5x16 stainless socket head (10 of each)
- Laptop with diagnostics software installed
- USB-A to USB-C cable for PCAN-USB connection

**Do not perform field service without this complete kit.** Missing tools require mission abort and a return trip — document kit completeness before departing for each visit.
