# L3 Specialist Curriculum

Five sections: multi-platform diagnostics, FFT analysis, fleet diagnostics, MTBF, and FMEA.

---

## Section 1: Multi-Platform Diagnostics

L3 specialists service robots across the full BCR-supported platform catalog. Each platform has unique CAN topology, ROS 2 topic structures, and mechanical characteristics.

### Platform Comparison: CAN Topology

| Platform | CAN Buses | Primary Rate | Key Arbitration IDs |
|---|---|---|---|
| Unitree G1 | 3 | 1 Mbit/s | 0x141-0x148 (motors), 0x601-0x607 (sensors) |
| Unitree H1-2 | 2 | 1 Mbit/s | 0x141-0x13F (motors — higher DOF range) |
| Boston Dynamics Spot | Internal (proprietary) | SDK access | REST + gRPC API (no raw CAN access) |
| DJI Agras T50 | DJI internal | DJI SDK | DJI MSDK v5 API |

Boston Dynamics Spot uses a proprietary internal bus. Field diagnostics use the Spot Python SDK:
```python
from bosdyn.client import create_standard_sdk
sdk = create_standard_sdk('TechMedixDiagnostic')
robot = sdk.create_robot('192.168.80.3')
robot.authenticate('admin', 'password')
state = robot.ensure_client('robot-state').get_robot_state()
```

### Approach Protocol Differences

- Unitree G1/H1-2: 2-meter exclusion zone when powered. Uses onboard voice commands for mode switching.
- Boston Dynamics Spot: 2-meter exclusion zone. Has sit/stand behavior — always command SIT before physical approach.
- DJI Agras T50: 10-meter exclusion zone when armed. Agriculture drone with large propeller span (>2.2m). Must be in LANDED state for battery/maintenance access.

---

## Section 2: FFT Analysis and Bearing Defect Detection

Fast Fourier Transform (FFT) converts a time-domain vibration signal into the frequency domain, revealing periodic fault signatures buried in noise.

### Sampling and Nyquist Theorem

- To capture a frequency of f Hz, sample at minimum 2f Hz (Nyquist theorem)
- For bearing defect detection up to 10 kHz, sample accelerometers at minimum 25 kHz
- Higher sampling rates reduce aliasing risk but increase data volume

### FFT Bin Resolution

- Frequency resolution = Sample rate / Number of FFT points
- Example: 25,000 Hz sample rate, 4096-point FFT: resolution = 6.1 Hz per bin
- Finer resolution requires more data points (longer capture time)

### Bearing Defect Frequency Formula (BPFO)

Ball Pass Frequency Outer Race:
```
BPFO = (N/2) * (RPM/60) * (1 - (d/D) * cos(alpha))
```
Where:
- N = number of rolling elements
- d = rolling element diameter (mm)
- D = pitch diameter (mm)
- alpha = contact angle (degrees)

Example (G1 knee bearing: N=14, d=6mm, D=40mm, alpha=15 deg, RPM=300):
- BPFO = (14/2) * (300/60) * (1 - (6/40) * cos(15°))
- BPFO = 7 * 5 * (1 - 0.145)
- BPFO = 35 * 0.855 = 29.9 Hz

A peak at ~30 Hz in the vibration FFT indicates outer race wear on this bearing.

---

## Section 3: Fleet-Level Diagnostics

### Fleet Health Dashboard Interpretation

TechMedix fleet health score aggregates:
- Individual robot health scores (weighted by fleet size)
- Active alert pressure (P1 = -10 pts, P2 = -3 pts each)
- SLA compliance rate (late responses reduce score)
- Maintenance currency (robots past service interval reduce score)

### Signal Correlation Across Fleet

When multiple robots show the same fault pattern:
- Check if the pattern correlates to a batch of robots from the same production date
- Check if the fault correlates to a recent firmware update
- Check if the fault is concentrated in a specific region (environmental factor)

Use TechMedix alert grouping: Filter > Group by Fault Code to identify fleet-wide patterns.

---

## Section 4: MTBF Analysis

Mean Time Between Failures (MTBF) is the statistical average time between robot failures.

### Calculation

```
MTBF = Total Operating Hours / Number of Failures
```

Example: 5 robots, each operated for 200 hours in 6 months, with 8 total failures:
- Total operating hours = 5 * 200 = 1,000 hours
- MTBF = 1,000 / 8 = 125 hours

### Predictive Maintenance Scheduling

If MTBF = 125 hours and robots operate 40 hours/week:
- Average failure interval = 3.1 weeks
- Schedule preventive maintenance at 80% of MTBF = 100 hours (every 2.5 weeks)

TechMedix automatically calculates fleet MTBF when telemetry is logged consistently. Access via Fleet > Analytics > MTBF Dashboard.

---

## Section 5: Advanced FMEA

### FMEA Structure

Failure Mode and Effects Analysis systematically catalogs failure modes and their risk:

| Column | Definition |
|---|---|
| Component | Part or subsystem |
| Failure Mode | How it can fail |
| Effect | What the failure causes |
| Severity (S) | 1-10 scale (10 = catastrophic) |
| Occurrence (O) | 1-10 scale (10 = almost certain) |
| Detectability (D) | 1-10 scale (1 = always detectable) |
| RPN | S * O * D (Risk Priority Number) |

### Escalation Thresholds

- RPN > 500 OR Severity >= 9: escalate to L4 and BCR engineering immediately
- RPN 200-500: flag for priority maintenance at next window
- RPN < 200: include in standard maintenance backlog

### TechMedix FMEA Integration

TechMedix automatically calculates RPN from telemetry:
- Severity: derived from fault impact on operation (P1 = S8-10, P2 = S5-7, P3 = S1-4)
- Occurrence: derived from failure frequency in fleet history
- Detectability: derived from sensor coverage for that failure mode

Navigate to Fleet > FMEA to review current RPN scores for all monitored failure modes.
