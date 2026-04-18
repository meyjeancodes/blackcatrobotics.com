# L1 Operator Curriculum

Five sections covering the foundational knowledge required to safely inspect and maintain BCR-monitored robots.

---

## Section 1: Robot Safety Fundamentals

Safe operation near autonomous and semi-autonomous robots requires a different mental model than conventional industrial machinery. Robots can move unpredictably, restart from software commands without physical operator action, and apply significant forces at unexpected speeds.

### LOTO Adapted for Robotic Systems

Lockout/Tagout (LOTO) procedures protect technicians from hazardous energy release during maintenance. Standard electrical LOTO applies fully to robots, but robotic systems add complexity:

- **Stored mechanical energy:** Springs, gas-charged actuators, and gravity-loaded arm positions retain energy after power cutoff. Always confirm all joints are at rest position or physically supported before working under or near them.
- **Battery energy:** Robot batteries remain hazardous after power-off. Lithium cells can discharge at high current even without a connected load. Battery isolation requires physical disconnection at the main battery connector, not just software shutdown.
- **Software restart risk:** Robots connected to a management system can restart remotely. Network isolation (disconnecting the robot from WiFi and Ethernet) must accompany physical LOTO.

Standard LOTO procedure for BCR-monitored robots:
1. Issue software stop via TechMedix dispatch interface.
2. Press hardware E-stop button (red, located on torso or base depending on platform).
3. Disconnect main battery connector.
4. Attach lockout hasp and tag with technician name and date.
5. Verify zero-energy state: attempt to power on (should fail), check all joint positions for stored energy.

### Safe Approach Protocols

**Humanoid robots (powered):** Maintain a 2-meter exclusion zone from any humanoid robot that is powered on and not in a confirmed stopped state. The 2m radius accounts for maximum arm reach plus a 0.5m safety margin. Never stand directly in front of the face or chest camera as this can trigger motion responses.

**Drones (armed):** Maintain a 10-meter exclusion zone from any drone with motors armed, regardless of whether it is airborne. Propellers can inflict serious injury at any RPM above threshold.

**Approaching a stopped robot:** Approach from the side or rear where possible. Announce your presence verbally even though robots cannot hear — this is a procedural habit that prevents complacency.

### E-Stop Hierarchy

The E-stop system has three layers, with hardwired taking highest priority:

1. **Hardwired E-stop (highest priority):** Physical red button wired directly to motor power contactor. Cannot be overridden by software. Forces all motors off within 10-50ms depending on platform.
2. **Software E-stop:** API command or TechMedix interface stop. Takes 100-500ms to execute due to software stack latency. Should not be relied upon for emergency stops.
3. **Communication cutoff:** Removing network connectivity causes robots to enter safe-stop mode after a configurable timeout (typically 3-10 seconds). Useful for remote situations but unreliable as primary emergency stop.

### Situational Awareness

Always know the robot's current state before approaching:
- Check TechMedix alert panel for active faults before entering the work area.
- Note the robot's battery state of charge — low battery (<15%) can trigger unpredictable shutdown sequences.
- Confirm the robot is not in an active job or autonomous task. Check dispatch queue in TechMedix.

---

## Section 2: Basic Mechanical Inspection

A thorough pre-deployment visual inspection catches the majority of preventable field failures. L1 operators perform this inspection before every deployment and after any incident.

### Visual Inspection Checklist

Complete the inspection in a defined sequence to avoid skipping items:

**Structural integrity:**
- Inspect all visible joints for cracks, deformation, or unusual wear marks
- Check housing panels for fractures — especially high-stress areas at joint interfaces
- Verify all fasteners are present and show no signs of backing out (Loctite should be visible at thread exit)
- Inspect cable routing for pinch points, abrasion, or excessive bend radius (minimum 10x cable diameter)

**Actuator condition:**
- Rotate each accessible joint through a portion of its range while powered off — feel for grinding, catching, or binding
- Check harmonic drive output flanges for grease seepage (slight is normal, heavy seepage = overdue service)
- Listen for any dry or metallic sounds during manual articulation

**Sensor integrity:**
- Verify all camera lenses are clean and unscratched
- Check LiDAR apertures for contamination or physical damage
- Confirm IMU housings show no impact damage

### Wear Indicators and Thresholds

**Joint play (backlash):**
- Nominal acceptable play on Unitree G1 knee: < 0.5 degrees
- Greater than 2 degrees of play = bearing wear — schedule for L2 inspection before next deployment
- Test by firmly grasping the limb above and below the joint and attempting to rock it perpendicular to the rotation axis

**Lubrication status:**
- Harmonic drive lubricant: Harmonic Grease SK-2 (specified by Unitree)
- Service interval: 500 hours of operation or 12 months, whichever comes first
- Visual indicator: grease should be visible at seal edges but not extruding heavily; dry or discolored = overdue

**Torque verification:**
- Critical fasteners should be torque-checked at each 250-hour service
- L1 operators verify fasteners are present and not obviously loose; L2+ technicians perform torque verification with calibrated tools

---

## Section 3: Battery and Power Systems

Lithium-based batteries are the energy source for all current-generation humanoid robots and most drones. Safe handling requires understanding the electrochemistry, failure modes, and operating limits.

### Battery Chemistry

**LiPo (Lithium Polymer):** Used in most drones and some light humanoid platforms. High energy density, fast discharge, but sensitive to puncture, overcharge, and deep discharge. Requires LiPo-rated charging equipment and storage bags.

**Li-ion (Lithium-Ion):** Cylindrical cells (18650, 21700 format). More robust than LiPo. Used in some humanoid platforms and many industrial applications. Lower risk of thermal runaway than LiPo under abuse conditions.

**NMC (Nickel Manganese Cobalt):** Most advanced humanoid robot batteries, including Unitree G1. Balances energy density, cycle life, and safety better than older Li-ion chemistries.

### State of Health (SoH) Indicators

SoH indicates remaining battery capacity relative to rated new capacity.

- **SoH > 80%:** Serviceable. Continue normal operation.
- **SoH 70-80%:** Marginal. Monitor closely. Schedule replacement at next maintenance window.
- **SoH < 70%:** Replace. Reduced range will affect robot mission completion.

**Cell imbalance thresholds:**
- Healthy pack: < 20mV imbalance between highest and lowest cell voltage
- Investigate at: > 50mV imbalance (indicates damaged cell or balancing circuit failure)
- Replace at: > 100mV persistent imbalance

### Cell Voltage Ranges

Standard NMC cell specifications:
- Nominal voltage: 3.6 - 3.7V per cell
- Maximum charge voltage: 4.2V per cell
- Storage voltage: 3.8V per cell (ideal for long-term storage)
- Minimum discharge cutoff: 3.0V per cell (controller should cut off at 3.2V for safety margin)
- Deep discharge threshold: < 3.0V — cell may be damaged; assess before recharging

### Charging Safety

- Never charge damaged, swollen, or excessively hot batteries
- Maintain visual monitoring during initial charge of any battery that has been discharged below 3.0V/cell
- Charge in a designated charging area away from flammable materials
- Set charge rate to 1C maximum for field charging; 0.5C preferred for long-term battery health
- Never leave batteries on charge unattended overnight without automatic cutoff

---

## Section 4: TechMedix Dashboard Basics

TechMedix is the BCR fleet management and dispatch platform. L1 operators must be able to navigate the dashboard, interpret alerts, log findings, and escalate appropriately.

### Fleet Health Overview

The main dashboard shows:
- **Fleet health score:** Aggregate 0-100 score across all monitored robots. Below 70 = investigate. Below 50 = immediate attention required.
- **Active robot count:** Robots currently online and reporting telemetry.
- **Open jobs:** Dispatch jobs assigned, en route, or onsite.
- **Critical alerts:** P1 alerts requiring immediate response.

### Alert Severity Levels

TechMedix uses a three-tier alert priority system:

- **P1 — Critical:** Requires technician response within 2 hours. Examples: motor overtemperature, battery cell imbalance > 100mV, E-stop fault, joint position out of range. P1 alerts page the assigned technician immediately via SMS and email.
- **P2 — Warning:** Requires attention within 24 hours. Examples: elevated joint temperature (within normal range but trending up), battery SoH 70-80%, firmware version mismatch. P2 alerts appear in the dispatch queue.
- **P3 — Informational:** Schedule for next maintenance window. Examples: lubrication interval approaching, battery approaching 80% SoH, sensor calibration due.

### Logging Requirements

Each L1 site visit requires a TechMedix log entry containing:
- Robot ID and site location
- Arrival and departure timestamp
- Battery SoH readings before and after service (if battery accessed)
- All inspection points completed (check against the platform's inspection template)
- Any anomalies found (describe symptom, not assumed cause at L1)
- Photos: minimum one pre-service and one post-service, plus close-up of any anomalies

### Escalation Criteria

Escalate to L2 or above when:
- Any joint play exceeds 2 degrees
- Battery imbalance > 50mV
- Any unusual sounds during powered articulation
- Visual damage to actuator housings, cables, or sensors
- Any fault code not listed in the L1 field reference guide
- P1 alert that cannot be resolved by battery swap or E-stop reset

---

## Section 5: Documentation and Compliance

Accurate field documentation protects technicians, fleet operators, and BCR's liability position. All documentation must be completed before leaving the service site.

### Work Order Required Fields

Every TechMedix work order must contain:
- Work order ID (system-generated)
- Technician ID and certification level
- Robot ID and current firmware version
- Service type: inspection / repair / battery service / emergency response
- Arrival timestamp (GPS-verified if possible)
- Parts used: part number, quantity, serial number if applicable
- Findings: objective description of conditions found
- Actions taken: objective description of work performed
- Post-service validation: confirmation the robot passed post-service checks
- Departure timestamp

### Photo Naming Convention

Photos uploaded to TechMedix must follow this naming format:

`{ROBOT_ID}_{DATE_YYYYMMDD}_{SEQUENCE}_{DESCRIPTION}.jpg`

Example: `G1-TXA-007_20260402_001_PRE_SERVICE.jpg`

Accepted description keywords: PRE_SERVICE, POST_SERVICE, ANOMALY, BATTERY, JOINT, SENSOR, DAMAGE

### Incident Reporting

Any incident involving:
- Uncontrolled robot movement during service
- Injury to any person within 10 meters
- Property damage caused by the robot
- Dropped or mishandled battery
- Activation of fire suppression or evacuation

...requires an incident report filed within 4 hours via the TechMedix incident form and a direct call to the BCR operations line. Do not wait until the end of the work day.

### Chain of Custody

When removing parts from a robot for transport (dead battery, failed sensor, etc.):
- Tag the part with the robot ID, removal date, and technician ID
- Photograph the part before removal and after installation of replacement
- Log the serial number of both the removed and installed part
- Transport defective parts in appropriate packaging (LiPo bag for batteries, anti-static bag for electronics)
- Return defective parts to the BCR parts depot within 5 business days
