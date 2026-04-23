# L1 Operator Lab Exercises

Five practical exercises required before sitting the L1 written exam. Each exercise requires assessor presence and sign-off. Use a training unit, not production fleet hardware.

---

## Lab 1: Pre-Deployment Visual Inspection — Unitree G1

**Objective:** Perform a complete pre-deployment visual inspection on a Unitree G1 and produce a compliant TechMedix log entry.

**Equipment Required:**
- Unitree G1 training unit (powered off, battery installed)
- TechMedix technician account
- Flashlight (min 200 lumen)
- Inspection checklist (printout from platform module)
- Camera or phone for documentation photos

**Safety Prerequisites:**
- Confirm robot is in LOTO state: hardware E-stop pressed, battery connector verified disconnected
- Don nitrile gloves before handling any robot surfaces
- Assessor must be present within 3 meters throughout

**Procedure:**

1. Receive the robot in an unknown pre-service state (assessor will configure 2-3 intentional defects).
2. Begin at the head: inspect camera lenses for contamination or scratches. Photograph findings.
3. Move to the torso: inspect panel fasteners (all 8 visible), cable routing at shoulder junctions. Record any loose fasteners by position.
4. Inspect right arm from shoulder to end-effector: check joint housings for cracks, grease seepage at harmonic drive seals. Manually articulate elbow and wrist (powered off) and note any grinding or catching.
5. Repeat for left arm.
6. Inspect both legs from hip to ankle: check knee joint for play by firmly grasping above and below the knee and testing for perpendicular rocking. Record any play in degrees (estimate; use a degree reference card if available).
7. Inspect battery compartment seal (do not remove battery if it was not part of the scope — note seal condition only).
8. Photograph: one full front view, one full rear view, one close-up of each defect found.
9. Log findings in TechMedix using the correct work order format.
10. Present work order to assessor before submitting.

**Expected Outcomes:**
- All intentional defects identified and documented
- Zero false-positive findings (assessor will verify)
- TechMedix log entry complete with photos and all required fields

**Common Errors:**
- Skipping the torso-to-shoulder cable inspection (most technicians rush past this)
- Logging subjective cause rather than objective finding ("bearing worn" vs "grinding felt in elbow joint during manual articulation")
- Missing the battery compartment seal in the inspection sequence

**Assessor Sign-off Criteria:**
All intentional defects found. Log entry accepted (no fields missing). Safety procedure followed throughout (no approach within 2m of powered robot, LOTO verified at start).

---

## Lab 2: Battery Swap and SoH Check — DJI Agras T50

**Objective:** Safely swap a DJI Agras T50 agriculture drone battery and perform and log a SoH assessment.

**Equipment Required:**
- DJI Agras T50 training unit (disarmed)
- Replacement battery (training battery, partially discharged)
- DJI battery tester or multimeter (CAT III, 600V rated)
- Anti-static work mat
- LiPo-safe storage bag
- TechMedix account

**Safety Prerequisites:**
- Motors must be confirmed disarmed (DJI app shows DISARMED state)
- Maintain 3-meter clearance from propellers throughout
- No open flames or hot surfaces within 5 meters
- Assessor present throughout

**Procedure:**

1. Confirm drone is disarmed. Open DJI Pilot 2 and verify Motors DISARMED status. Do not proceed until confirmed.
2. Press battery release and slide the battery pack out of the T50 battery bay. Note battery orientation before removal.
3. Place removed battery on anti-static mat. Do not set on concrete or bare metal.
4. Using the battery tester, measure individual cell voltages. Record all cell readings.
5. Calculate max - min cell voltage. If > 50mV imbalance, flag in the SoH assessment.
6. Check the battery indicator LED: 4 solid = 80-100%, 3 = 60-80%, 2 = 40-60%, 1 = 20-40%, blinking = <20%.
7. Using the DJI app's battery health check, record the reported SoH percentage.
8. If SoH < 80%, mark battery for replacement in TechMedix.
9. Install replacement battery. Confirm correct orientation. Press until latch clicks (audible).
10. Power on the T50 briefly to confirm battery detected correctly, then power off.
11. Log battery swap in TechMedix: include SoH of removed battery, cell voltage readings, and replacement battery serial number.

**Expected Outcomes:**
- Battery removed and replaced without damage
- SoH assessment correctly categorized (serviceable / marginal / replace)
- TechMedix log entry complete with all cell voltage readings

**Common Errors:**
- Approaching propeller radius before confirming DISARMED state
- Misidentifying the battery orientation (T50 battery is asymmetric — only fits one way but technicians sometimes force it)
- Logging pack voltage instead of individual cell voltages

**Assessor Sign-off Criteria:**
Safe procedure throughout. Battery correctly assessed. TechMedix log complete with individual cell data.

---

## Lab 3: Log a P2 Alert and Escalation Workflow in TechMedix

**Objective:** Respond to a simulated P2 alert in TechMedix, perform the appropriate field assessment, and correctly escalate to P1 when criteria are met.

**Equipment Required:**
- TechMedix technician account (training environment)
- Assessor with admin account (to inject simulated alert)
- Unitree G1 training unit
- Multimeter

**Safety Prerequisites:**
- Robot in training safe-stop mode
- No live battery required for this lab (robot can be powered down)

**Procedure:**

1. Assessor injects a P2 alert: "Elevated knee joint temperature — right knee, 58C, trending up."
2. Technician acknowledges the alert in TechMedix within the 24-hour SLA window (assessor confirms acknowledgment timestamp).
3. Navigate to the robot profile and review the last 24 hours of telemetry for the right knee temperature signal.
4. Document the trend: is temperature still rising, plateauing, or recovering?
5. Physically inspect the right knee joint for external heat signs (housing warm to touch, discolored grease, unusual smell).
6. Log findings: temperature reading trend, physical findings, actions taken.
7. Assessor will then inject an escalation event: temperature crosses 70C threshold.
8. Technician must reassign alert to P1, update work order priority, and initiate escalation to L2 (select from technician roster in TechMedix dispatch).
9. Draft escalation notes: current findings, recommendation, urgency.
10. Submit. Assessor reviews the escalation entry.

**Expected Outcomes:**
- Alert acknowledged within SLA window
- Telemetry trend correctly interpreted
- Escalation to P1 triggered at the correct threshold
- Escalation notes meet completeness standard

**Common Errors:**
- Escalating before threshold is met (jumping to P1 prematurely)
- Writing subjective cause in escalation notes ("motor burning up") rather than objective data
- Failing to include the temperature trend chart screenshot

**Assessor Sign-off Criteria:**
SLA met. Alert correctly managed. Escalation triggered at correct threshold. Notes complete and objective.

---

## Lab 4: Emergency Stop Activation and System Recovery

**Objective:** Practice E-stop activation in a simulated emergency and execute the recovery procedure correctly.

**Equipment Required:**
- Unitree G1 training unit (powered on, in standby)
- TechMedix technician account
- Timer (phone stopwatch)

**Safety Prerequisites:**
- Assessor positioned at secondary E-stop (if available)
- 3m clearance in all directions from the robot during powered operation
- Technician briefed on recovery procedure before starting

**Procedure:**

**E-stop activation:**
1. With robot in standby (not moving), assessor announces a simulated emergency scenario.
2. Technician activates hardwired E-stop. Timer starts on assessor's signal.
3. Technician must reach E-stop within 5 seconds of signal (this simulates emergency response).
4. Confirm E-stop engaged: robot should not respond to any commands.
5. Attempt to move a joint manually — confirm no resistance from active motor (if motors properly killed).
6. Note timestamp of E-stop activation in work order.

**Recovery procedure:**
7. Identify and resolve simulated fault (assessor provides fault scenario — e.g., "obstacle cleared").
8. Confirm 3m clearance in all directions.
9. Release E-stop: twist and pull on button (or per platform-specific procedure).
10. Power cycle the robot via TechMedix dispatch interface.
11. Wait for boot sequence to complete (Unitree G1: approximately 45 seconds to standby-ready).
12. Verify TechMedix shows the robot online and no residual fault codes.
13. Log the E-stop event: timestamp, scenario, recovery actions, confirmation of normal state.

**Expected Outcomes:**
- E-stop engaged within 5 seconds
- Recovery procedure completed without skipping steps
- Log entry complete

**Common Errors:**
- Releasing E-stop before clearing the fault cause
- Skipping the 3m clearance check before power-on
- Not logging the E-stop event (all E-stop activations require a log entry, even if no damage occurred)

**Assessor Sign-off Criteria:**
E-stop response time under 5 seconds. Recovery procedure completed correctly. Event logged.

---

## Lab 5: Complete a Work Order End-to-End

**Objective:** Complete an entire work order from dispatch acceptance through field service and final submission, using TechMedix.

**Equipment Required:**
- TechMedix technician account
- Unitree G1 training unit
- Full inspection toolkit (flashlight, multimeter, camera)
- Assessor with dispatcher account (to create and assign the work order)

**Safety Prerequisites:**
- Standard LOTO as per Lab 1

**Procedure:**

1. Assessor creates and assigns a work order: "Scheduled maintenance inspection — Unitree G1, Unit G1-TX-001."
2. Technician accepts the work order in TechMedix mobile interface. Note acceptance timestamp.
3. Navigate to the site (simulated — within the training area).
4. On arrival: update work order status to "Onsite" in TechMedix. Log GPS location.
5. Perform full L1 visual inspection (as per Lab 1). Assessor will have configured 1-2 defects.
6. Log all findings in the work order findings field (objective descriptions only).
7. Take and upload all required photos: PRE_SERVICE, POST_SERVICE, and one per defect found.
8. Complete battery SoH check and log results.
9. For any defect requiring escalation, initiate the escalation workflow within TechMedix before closing.
10. Mark work order status to "Complete."
11. Submit work order.
12. Assessor reviews submitted work order for completeness.

**Expected Outcomes:**
- Work order accepted, updated, and submitted within the same session
- All defects found and documented
- All required photos uploaded with correct naming convention
- Escalation triggered if any defect exceeds L1 resolution threshold

**Common Errors:**
- Forgetting to update status to "Onsite" on arrival (this is used for SLA tracking)
- Submitting work order before escalation is initiated (escalation should be complete or acknowledged before submission)
- Photo file names not following convention

**Assessor Sign-off Criteria:**
Work order submitted with all required fields. All defects documented. Escalation workflow correctly used if applicable. No safety violations during the lab.
