# FMEA Methodology for Robot Field Service

Failure Mode and Effects Analysis (FMEA) is a structured, proactive method for identifying potential failure modes, their causes, and their effects before failures occur in the field. Required reading for L3+ certification.

---

## FMEA Structure

Each FMEA table row captures one failure cause (not one failure mode — a single mode may have multiple independent causes, each requiring its own row):

| Column | Description |
|---|---|
| Component | The physical or software component being analyzed |
| Function | What the component is supposed to do |
| Failure Mode | How the component can fail to perform its function |
| Failure Effect | What happens when this failure mode occurs (local, system, end-user) |
| Failure Cause | The specific root cause mechanism producing this failure mode |
| Severity (S) | How serious is the failure effect? 1-10 |
| Occurrence (O) | How likely is this cause to produce the failure? 1-10 |
| Detectability (D) | How detectable is the failure before it reaches the customer? 1-10 |
| RPN | Risk Priority Number = S * O * D |
| Current Controls | Existing prevention or detection measures |
| Recommended Action | Corrective action to reduce RPN |
| Responsibility | Who owns the corrective action |
| Target Date | When corrective action will be complete |
| Post-Action RPN | Recalculated RPN after corrective action |

---

## Scoring Scales

### Severity (S) — 1 to 10

Severity scores the consequence of the failure effect if it occurs. Severity is fixed by the nature of the failure — it cannot be reduced without changing the design.

| Score | Description | Robot Example |
|---|---|---|
| 1 | No effect — customer unaware | Cosmetic scratch on robot housing |
| 2 | Very minor — customer notices, slight annoyance | Telemetry display formatting error |
| 3 | Minor — slight performance degradation, customer slightly dissatisfied | Joint position error of 0.01 rad (barely perceptible) |
| 4 | Minor — some performance loss, customer dissatisfied | Joint torque slightly above spec (5% over) |
| 5 | Moderate — significant performance loss but system still functional | Robot walking speed reduced 20% |
| 6 | Moderate — customer unable to complete task, no safety risk | Robot cannot pick up objects (gripper failure) |
| 7 | High — major system function lost | Robot unable to walk — mission abort |
| 8 | High — major function lost, secondary damage to equipment | Robot falls and damages payload |
| 9 | Very high — safety risk to personnel or critical equipment damage | Robot falls on a person (injury risk) |
| 10 | Catastrophic — personnel injury or death, regulatory violation | Robot contacts electrical hazard, causing electrocution |

### Occurrence (O) — 1 to 10

Occurrence scores the probability that the specific cause will produce the failure mode in a defined time period.

| Score | Probability | Approximate Failure Rate | Robot Example |
|---|---|---|---|
| 1 | Extremely rare | < 1 in 1,000,000 | Cosmetically perfect LED fails on first power-on |
| 2 | Very rare | 1 in 100,000 | Hardware watchdog reset on first boot |
| 3 | Rare | 1 in 10,000 | New bearing fails within 10 hours of installation |
| 4 | Relatively low | 1 in 2,000 | Joint calibration fails after firmware update |
| 5 | Occasional | 1 in 400 | Battery cell imbalance developing within 200 cycles |
| 6 | Moderate | 1 in 80 | CAN connector loosens after 6 months of operation |
| 7 | High | 1 in 20 | Nozzle blockage occurring within 10 operating hours |
| 8 | Very high | 1 in 8 | IMU drift requiring recalibration within 30 days |
| 9 | Extremely high | 1 in 3 | Harmonic drive grease depleting within 100 hours if under-filled |
| 10 | Near certain | > 1 in 2 | Rubber seal degrading within 30 days of chemical exposure |

### Detectability (D) — 1 to 10

Detectability scores the effectiveness of current controls to detect the failure before it reaches the customer/operator.

| Score | Detection Capability | Robot Example |
|---|---|---|
| 1 | Absolute certainty — failure always detected automatically | CAN bus error triggers immediate P1 alert in TechMedix |
| 2 | Almost certain — automated detection with very high reliability | Temperature sensor triggers alert before damage occurs |
| 3 | High — multiple automated controls detect the failure | Torque deviation + thermal alert + vibration — redundant detection |
| 4 | High — single automated control detects most cases | TechMedix P2 alert on torque deviation |
| 5 | Moderate — automated detection misses some cases | Intermittent CAN error only alerts when sustained |
| 6 | Moderate — visual inspection by trained technician | Technician sees grease depletion on quarterly inspection |
| 7 | Low — human inspection under defined conditions | Operator detects unusual sound during pre-shift check |
| 8 | Very low — human detection unreliable | Random auditory check — may miss intermittent sound |
| 9 | Very unlikely — no formal detection control | No monitoring of this failure mode |
| 10 | Undetectable — failure hidden until catastrophic event | Battery internal short with no external indicator |

---

## RPN — Risk Priority Number

```
RPN = Severity × Occurrence × Detectability
```

RPN ranges from 1 (lowest risk) to 1,000 (highest risk).

### BCR RPN Action Thresholds

| RPN Range | Classification | Required Action |
|---|---|---|
| 1-100 | Acceptable risk | Monitor — no immediate action required |
| 101-200 | Low priority | Include in next scheduled maintenance review |
| 201-500 | Priority maintenance | Schedule corrective action within 30 days |
| > 500 | High priority | Immediate corrective action required — escalate to L4 |
| Any, Severity >= 9 | Immediate escalation | Escalate immediately regardless of RPN — safety-critical |

---

## Escalation Rules

Two independent escalation triggers apply:

1. **RPN > 500:** The combined risk from frequency and detectability creates unacceptable risk. Immediate corrective action required.

2. **Severity >= 9:** Near-catastrophic or catastrophic consequence. Immediate escalation to L4+ and BCR engineering, regardless of how low the occurrence and detectability scores are. High Severity + Low Occurrence + Low Detectability may produce RPN as low as 9 (S=9, O=1, D=1 = 9), but must still be escalated immediately.

When both triggers apply: escalate to BCR engineering and notify the customer.

---

## Corrective Action Leverage

The most efficient RPN reduction strategies:

**Improving Detectability (highest leverage for chronic failures):**
- Adding sensors (vibration, temperature, current monitoring)
- Adding automated alert rules in TechMedix
- Reducing inspection intervals
- Adding mandatory pre-task checklists

**Reducing Occurrence:**
- Preventive maintenance schedule optimization
- Design change (more reliable component)
- Better environmental protection (sealing, covers)
- Operator training and procedure improvement

**Reducing Severity (requires design change):**
- Adding redundant systems
- Implementing protective interlocks
- Speed/force limiting in protective mode
- Adding energy-absorbing structures

Note: Severity reduction typically requires engineering change — field technicians cannot reduce Severity through maintenance actions. Focus corrective actions on Occurrence and Detectability.

---

## FMEA Process for Robot Field Service

1. **Define scope:** One assembly (e.g., knee joint actuator) or one subsystem (e.g., spray system). Do not attempt to FMEA the whole robot at once.

2. **List functions:** For each component in scope, list what it must do. (e.g., "Knee joint must provide 0-90 degree range of motion with < 0.5 rad position error")

3. **Identify failure modes:** For each function, identify ways it can fail. (e.g., "Cannot achieve > 60 degrees of flexion")

4. **Identify effects:** For each failure mode, identify local, system, and end-user effects.

5. **Identify causes:** For each failure mode, identify all plausible root causes. Create one FMEA row per cause.

6. **Score S, O, D:** Use the scoring scales above. Score independently — do not let current controls affect Severity or Occurrence scores.

7. **Calculate RPN:** S * O * D.

8. **Prioritize and assign corrective actions:** Focus on RPN > 200 and all Severity >= 9 items first.

9. **Re-score after actions:** Estimate the new S, O, D after the corrective action is implemented. Calculate post-action RPN.

10. **Document and review:** FMEA is a living document — update when failures occur, when design changes are made, or at the quarterly FMEA review.
