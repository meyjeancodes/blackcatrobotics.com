# BlackCat Robotics Certification Glossary

Reference definitions for all certification levels. Terms appear throughout curriculum documents, assessment questions, and platform modules.

---

## A

**Actuator**
A device that converts a control signal (electrical, hydraulic, or pneumatic) into mechanical motion. In humanoid robots, actuators are typically BLDC motors combined with harmonic drives or planetary gearboxes.

**ARN (Availability, Reliability, Maintainability)**
A triad of engineering metrics. Availability = MTBF / (MTBF + MTTR). Reliability focuses on failure-free operation over time. Maintainability measures how quickly a system can be restored after failure.

---

## B

**BLDC (Brushless DC Motor)**
A synchronous DC motor driven by an electronic commutator rather than mechanical brushes. Advantages: higher efficiency, longer service life, better torque density. Used in virtually all modern robot joints.

**BMS (Battery Management System)**
Electronic system that monitors and protects a battery pack. Functions include: cell voltage monitoring, SoH estimation, thermal protection, charge/discharge control, and cell balancing. Critical for LiPo/NMC pack safety.

**BDF (Bearing Defect Frequency)**
The characteristic frequency at which a bearing fault generates vibration spikes. Formula: BDF = (n_balls / 2) x (RPM / 60) x (1 - d_ball / D_pitch). Detected via FFT of vibration signal.

---

## C

**CAN (Controller Area Network)**
A robust serial communication protocol designed for noisy industrial environments. Used in virtually all robotic systems for inter-module communication. Standard speeds: 125 kbps to 1 Mbps; robot typical: 500 kbps to 1 Mbps. Physical layer: differential CANH/CANL pair with 120-ohm termination resistors at each bus end.

**CANopen**
An application layer protocol built on CAN. Defines object dictionary, NMT state machine, PDO for real-time data, SDO for configuration, and Heartbeat for node health monitoring.

**Candump**
Linux command-line tool for capturing CAN bus traffic. Output format: (timestamp) interface arbitration_id#data. Example: (1711234567.123456) can0 181#0102030405060708.

**CAN Bus-Off**
A fault condition where a CAN node's transmit error counter exceeds 255, causing the node to remove itself from the bus. Caused by persistent frame errors, often due to wiring faults or missing termination.

---

## D

**DOF (Degrees of Freedom)**
The number of independent motion axes in a robotic system. The Unitree G1 has 43 DOF (6 per leg x2, 7 per arm x2, 3 torso). Higher DOF enables more dexterous movement but increases control complexity.

**DTC (Diagnostic Trouble Code)**
Standardized fault code that identifies a specific failure mode. In TechMedix, fault codes follow the pattern {platform_prefix}.{subsystem}.{fault_type}.

---

## E

**E-Stop (Emergency Stop)**
A safety mechanism that immediately halts robot motion. Hierarchy: hardwired E-stop (cuts motor power physically) > software E-stop (sends motor disable command) > communication E-stop (breaks link). Important: software E-stop does NOT cut power in most systems — actuators may still be energized.

**EOQ (Economic Order Quantity)**
Formula for optimal parts ordering: EOQ = sqrt(2 x D x S / H), where D = annual demand, S = ordering cost per order, H = annual holding cost per unit. Used at L4 for spare parts optimization.

---

## F

**FFT (Fast Fourier Transform)**
Algorithm that converts a time-domain signal into its frequency components. Essential for bearing analysis, vibration diagnostics, and identifying resonances. Frequency resolution = sample_rate / N_samples.

**FMEA (Failure Mode and Effects Analysis)**
Systematic method to identify potential failure modes, their causes, and effects. Each failure mode is scored: Severity (1-10), Occurrence (1-10), Detectability (1-10). RPN = S x O x D (max 1000). Action required when RPN > 200 or Severity >= 9.

**Firmware**
Embedded software stored in non-volatile memory that controls hardware operation. Robot firmware updates carry risk of bricking; always verify checksum, maintain rollback capability, and never interrupt power during flash.

---

## G

**G1 (Unitree G1)**
Unitree Robotics humanoid robot. Specs: 130 cm, 35 kg, 43 DOF, up to 2 m/s walking speed, 2 kWh battery pack, $13,500 MSRP. Uses three CAN buses: left leg, right leg, upper body.

**Grease (Harmonic SK-2)**
Specialized lubricant for harmonic drive strain waves. Interval: every 500 operating hours or 6 months. Under-greasing leads to stiction and accelerated wave generator wear. Over-greasing causes heat buildup and seal failure.

---

## H

**H1-2 (Unitree H1-2)**
Unitree Robotics full-size humanoid. Specs: 1.8 m, 70 kg, 31 DOF, price range $29,900-$68,900. Designed for industrial deployment. Different CAN topology and joint count from G1.

**Harmonic Drive**
A compact, zero-backlash gear mechanism consisting of wave generator, flex spline, and circular spline. Achieves high reduction ratios (30:1 to 320:1) in a small package. Used in precision robot joints. Susceptible to grease starvation and wave generator bearing wear.

**Heartbeat (CANopen)**
Periodic message sent by each CANopen node to confirm it is alive. Arbitration ID: 0x700 + NodeID. Payload 0x05 = operational state. Missing heartbeat indicates node dropout or bus fault.

---

## I

**IMU (Inertial Measurement Unit)**
Sensor combining accelerometer and gyroscope (and often magnetometer) to measure linear acceleration, angular velocity, and orientation. Common model: MPU-9250 (±16g, ±2000 deg/s). Used for balance control and motion estimation.

**IP Rating (Ingress Protection)**
International standard (IEC 60529) for enclosure resistance to solids and liquids. Format: IP{solids}{liquids}. Boston Dynamics Spot: IP54 (dust protected, splash resistant). IP67 = fully dustproof, immersion to 1m.

---

## J

**Joint Encoder**
Sensor that measures rotational position of a motor shaft. Types: magnetic (Hall effect), optical (incremental or absolute). Encoder drift occurs when zero-point calibration shifts, causing position tracking errors.

---

## L

**Li-ion (Lithium-Ion)**
Rechargeable battery chemistry. Cell nominal voltage: 3.6-3.7V, max 4.2V, cutoff 3.0V. Lower energy density than LiPo but more stable. Standard in most robot base units.

**LiPo (Lithium Polymer)**
High-energy-density battery chemistry using polymer electrolyte. Lighter than Li-ion for same capacity. More susceptible to thermal runaway if punctured, over-charged, or over-discharged. Used in DJI drones.

**LOTO (Lockout/Tagout)**
OSHA-mandated energy isolation procedure (29 CFR 1910.147). For robots: key distinction from standard LOTO is that robots can be back-driven through their joints even when powered off (gravity, external forces). Physical restraint is required in addition to de-energization.

---

## M

**MTBF (Mean Time Between Failures)**
Average operating time between failures for a repairable system. MTBF = Total uptime / Number of failures. Higher MTBF indicates higher reliability. Used to calculate availability and plan maintenance intervals.

**MTTR (Mean Time To Repair)**
Average time to restore a failed system to operation. Includes diagnosis, parts retrieval, repair, and testing. MTTR = Total downtime / Number of failures.

**MPU-9250**
9-axis IMU (3-axis accel, 3-axis gyro, 3-axis compass) by InvenSense. Accel range: ±2/4/8/16g; Gyro range: ±250/500/1000/2000 deg/s. Used in Unitree G1 for balance control.

---

## N

**NMC (Nickel Manganese Cobalt)**
Lithium battery cathode chemistry. Higher energy density than LFP, more thermally stable than pure cobalt. Common in large robot battery packs.

**NMT (Network Management)**
CANopen service for managing node states. Message ID: 0x000. State machine: Initialising -> Pre-operational -> Operational -> Stopped. L4+ technicians configure NMT boot behavior.

**Nyquist Theorem**
To reconstruct a signal up to frequency f_max, sample at f_s >= 2 x f_max. Sampling below this rate causes aliasing. In practice, sample at 4-10x the target frequency and apply an anti-aliasing filter.

---

## P

**PDO (Process Data Object)**
CANopen mechanism for high-speed, periodic real-time data exchange. Transmit PDOs (TPDO) send data from node; Receive PDOs (RPDO) accept data to node. Default mapping: TPDO1 at 0x180+NodeID, RPDO1 at 0x200+NodeID.

**PPE (Personal Protective Equipment)**
Required for robot maintenance: safety glasses, steel-toe boots, anti-static wrist strap (for electronics), cut-resistant gloves (for mechanical work). Hard hat required when working under raised robot.

**P1/P2/P3 Priority**
TechMedix alert priority classification. P1: safety-critical, respond within 2 hours. P2: performance-impacting, respond within 24 hours. P3: scheduled maintenance, address at next service window.

---

## R

**ROS 2 (Robot Operating System 2)**
Open-source middleware framework for robot software. Uses DDS for pub/sub communication. Key topics on Unitree G1: /joint_states at 500 Hz, /imu/data at 200 Hz, /camera/depth/image_raw at 30 fps.

**RPN (Risk Priority Number)**
FMEA scoring metric: RPN = Severity x Occurrence x Detectability. Maximum 1000. Action required when RPN > 200. Escalation to L4+ required when RPN > 500 or Severity >= 9 (potential for injury or fire).

---

## S

**SDO (Service Data Object)**
CANopen mechanism for reading/writing node configuration parameters (object dictionary). Used for firmware parameter updates, sensor calibration. Slower than PDO; not suitable for real-time data.

**SoH (State of Health)**
Battery capacity relative to rated capacity as a percentage. SoH < 80%: replace battery pack. SoH measurement requires full discharge cycle or Coulomb counting BMS with calibrated estimation.

**Strain Wave Gear**
Alternative name for harmonic drive. The wave generator deforms the flex spline into an elliptical shape, engaging teeth with the circular spline at two points. Provides high torque in small volume with zero backlash.

---

## T

**TechMedix**
BlackCat Robotics fleet management and diagnostic platform. Provides real-time telemetry, alert management, work order dispatch, AR-guided repair, and certification tracking for robot maintenance teams.

**TOPS (Tera Operations Per Second)**
Measure of AI accelerator compute performance. Nvidia Jetson AGX Thor: 275 TOPS. Used for edge AI inference in autonomous robotic systems.

**Thermal Runaway**
Uncontrolled self-heating in a battery cell where increasing temperature causes increasing heat generation. Visible symptoms: swelling, venting of electrolyte vapors, smoke, fire. Triggers: overcharge, internal short, physical damage.

---

## W

**Weibull Analysis**
Statistical method for reliability analysis and life data analysis. The Weibull distribution shape parameter (beta) indicates failure pattern: beta < 1 = infant mortality, beta = 1 = random failures, beta > 1 = wear-out failures. Used at L4 for fleet-level maintenance planning.

**Work Order**
Formal maintenance task record in TechMedix. Required fields: job ID, robot ID, platform, technician, fault code, date/time, parts used, photos, resolution, labor hours. Must be completed before leaving site.

---

## Z

**Zero Backlash**
Property of a gear system where there is no angular play between input and output shafts. Harmonic drives achieve near-zero backlash. Critical for precise robot joint positioning. Backlash increases as grease degrades and wave generator bearings wear.

---

*Last updated: 2026-03-31 | BlackCat Robotics Certification Program v1.0*
