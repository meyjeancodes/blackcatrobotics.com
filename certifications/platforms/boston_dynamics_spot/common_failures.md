# Boston Dynamics Spot — Common Failures

Top 10 failure modes from BCR field service operations. Boston Dynamics limits independent servicing — escalate to BD service for faults beyond Level 2 repair authority.

---

## Failure 1: Battery Degradation (High Frequency)

**Symptoms:** Estimated runtime drops below 60 minutes (from 90-minute specification). Battery temperatures uneven across cells. SoC readings inconsistent.

**Root Cause:** Li-Ion cell cycle aging. Spot batteries typically last 300-500 full charge cycles. High ambient temperature environments accelerate degradation.

**Repair Procedure:**
1. Perform capacity test (see diagnostic guide).
2. If SoC < 55% at 30 minutes on standard walk test, order replacement battery.
3. Power off, remove battery cover (4x T30 Torx, rear of body).
4. Disconnect battery connector (pull tab — do not pry).
5. Install new battery, reconnect, verify SDK reports charge correctly.
6. First charge must be completed to 100% before returning to service.

**OEM Part Numbers:** Spot battery: BD P/N GS60-00000-0 (contact BD for authorized reseller access)
**Estimated Repair Time:** 20 minutes (swap), 2.5 hours (including capacity test)
**Required Level:** L2

---

## Failure 2: Foot Sensor False Contact Detection (Medium Frequency)

**Symptoms:** Spot stumbles on flat ground — gait planning errors from incorrect foot contact state. SDK shows foot_contact_state reporting contact when foot is in swing phase. Spot may stop unexpectedly and request manual assist.

**Root Cause:** Contamination of foot contact sensors with mud, grease, or debris. Foot contact is detected via load cells in the foot pad — debris bridging the gap causes false contact signal.

**Repair Procedure:**
1. Power off, lower to sitting position, engage estop.
2. Inspect each foot pad — wipe with damp cloth to remove debris.
3. Inspect foot pad for physical damage (cracks, punctures) — a damaged foot pad can permanently short the contact sensor.
4. Power on, verify gait is stable on flat ground.
5. If false contact persists after cleaning: replace foot pad module.

**OEM Part Numbers:** Spot foot pad (replaceable): BD P/N FP-01-00000-0 (specify HD or standard)
**Estimated Repair Time:** 20 minutes (cleaning), 45 minutes (foot pad replacement)
**Required Level:** L1 (cleaning), L2 (foot pad replacement)

---

## Failure 3: Hip Joint Overtemperature During High-Gradient Terrain

**Symptoms:** SDK fault: MOTOR_TEMP_CRITICAL on one or more hip joints (fl_hx, fl_hy or equivalent). Robot reduces gait and eventually sits down for thermal protection. Motor temperature > 80C on affected joints.

**Root Cause:** Extended deployment on steep terrain (> 20 degree grade) with full payload forces hip abduction/adduction motors to sustained high torque. Also occurs in high ambient temperature environments (> 35C).

**Repair Procedure:**
1. Remove robot from the task environment and allow to cool for 20 minutes.
2. Verify fault clears after cooling: `state_client.get_robot_state().system_fault_state.faults`
3. If fault clears: adjust mission profile — reduce grade or payload, add rest intervals.
4. If fault recurs at low temperature: inspect hip joint for mechanical binding (debris ingress).
5. Spot hip joint R&R requires BD service authorization — escalate beyond cleaning and inspection.

**OEM Part Numbers:** Hip joint servicing beyond cleaning requires BD field service.
**Estimated Repair Time:** 30 minutes (cooling + inspection), BD service for joint R&R
**Required Level:** L2 (assessment), BD service (repair)

---

## Failure 4: GraphNav Localization Failure

**Symptoms:** Autonomous navigation fails — robot stops with "cannot localize" fault. SDK returns ROBOT_COMMAND_ERROR_LOST. Maps that previously worked correctly are no longer recognized.

**Root Cause:** Environmental changes (furniture moved, lighting changed, temporary obstacles) cause visual feature mismatch between stored map and current environment. Also caused by firmware updates that change the visual localization algorithm.

**Repair Procedure:**
1. Verify lighting conditions match the map recording session (daylight vs. artificial light).
2. Clear recent obstacles from the navigation path.
3. Re-localize by walking the robot manually to a known location on the map and using `graph_nav_client.set_localization()`.
4. If re-localization fails: delete the map and record a new map under current conditions.
5. After firmware update: always re-record maps — localization models may have changed.

**OEM Part Numbers:** Software fix — no hardware parts required.
**Estimated Repair Time:** 30 minutes (re-localization), 2 hours (map re-recording)
**Required Level:** L2

---

## Failure 5: E-Stop Not Releasing After Software Command

**Symptoms:** E-stop state remains ESTOPPED in SDK even after `estop_client.allow()` command is sent. Robot will not power motors.

**Root Cause:** Multiple e-stop sources must all be released before motors enable: (1) hardware button e-stop, (2) software e-stop client, (3) any third-party e-stop integration. If any one source remains in ESTOPPED state, the robot stays stopped.

**Repair Procedure:**
1. Check hardware e-stop button — physically verify it is not pressed/locked. The button is on the back of the robot body.
2. List all e-stop sources: `estop_client.get_status().stop_level_details`
3. For each source showing ESTOPPED: release with the corresponding client.
4. If a software e-stop client is orphaned (process crashed without releasing), clear with `estop_client.clear_fault()`.
5. Verify all sources show ESTOP_LEVEL_NONE before attempting motor power.

**OEM Part Numbers:** Hardware e-stop button (if physically damaged): BD service required.
**Estimated Repair Time:** 15 minutes (software resolution), BD service (hardware e-stop button)
**Required Level:** L2

---

## Failure 6: Payload Rail Mount Failure

**Symptoms:** Customer payload (camera, gripper arm, sensor pack) visibly shifted or loose on the payload rail. SDK may show payload configuration errors if payload mass exceeds declared weight.

**Root Cause:** Payload rail mounting bolts are M5 stainless, requiring 6 Nm torque with Loctite 243. In vibration-heavy environments (rough terrain, industrial floors), bolts back out without thread-locking compound.

**Repair Procedure:**
1. Power off, engage e-stop, remove payload from rail.
2. Inspect rail mounting posts — clean threads with IPA.
3. Apply one drop of Loctite 243 to each M5 bolt thread.
4. Reinstall payload, torque bolts to 6 Nm using a calibrated torque wrench.
5. Verify payload is rigid — zero movement under 50N lateral force test.
6. Update payload mass declaration in SDK if payload weight has changed.

**OEM Part Numbers:** Payload rail mounting bolt M5x20 SS: BD P/N H-BOLT-M5-20SS; Loctite 243 (standard commercial)
**Estimated Repair Time:** 30 minutes
**Required Level:** L1

---

## Failure 7: Wireless Communication Dropout (Intermittent)

**Symptoms:** SDK connection intermittently disconnected. TechMedix shows `spot_*` signals going STALE for 5-30 second intervals. Robot continues operation autonomously during dropout (if in mission mode) but loses remote monitoring.

**Root Cause:** WiFi interference from warehouse equipment (barcode scanners, conveyor motor VFDs), thick concrete walls, or distant AP placement.

**Repair Procedure:**
1. Log RSSI during dropout events: monitor `iwconfig wlan0` on the laptop connecting to Spot's AP.
2. If RSSI < -70 dBm during dropouts: add a WiFi repeater or relocate Spot AP coverage.
3. Check for co-channel interference: scan WiFi channels and ensure Spot AP is on a clear channel (1, 6, or 11 for 2.4GHz).
4. If interference is from industrial equipment: schedule operations during equipment downtime or add RF shielding.

**OEM Part Numbers:** Spot WiFi AP replacement: BD service required.
**Estimated Repair Time:** 1-2 hours (RF survey and configuration)
**Required Level:** L2

---

## Failure 8: Automatic Dock Homing Failure

**Symptoms:** Spot approaches the Spot Dock but fails to dock — stops 0.5-2m from dock and reports DOCK_STATUS_ERROR. Body LED shows amber during failed dock attempt.

**Root Cause:** Fiducial marker on dock is obstructed or damaged. Dock position moved since last successful dock. Lighting conditions changed (direct sunlight or low ambient light).

**Repair Procedure:**
1. Inspect dock fiducial (QR-code-like marker on dock face) — wipe clean with dry cloth.
2. Verify dock has not been physically moved — measure distance from last known position.
3. Check ambient lighting: Spot's camera-based dock detection works best at 200-2000 lux. Avoid direct sunlight on the dock fiducial.
4. Manually dock the robot and set the dock position as the new reference.
5. If dock failure persists in good conditions: inspect Spot's front cameras for lens contamination.

**OEM Part Numbers:** Spot Dock fiducial marker (replacement): BD P/N DOCK-FIDUCIAL-001
**Estimated Repair Time:** 30 minutes
**Required Level:** L1

---

## Failure 9: Software Fault After Firmware Update

**Symptoms:** After a firmware update, robot enters fault state immediately on boot. SDK shows unfamiliar fault codes not present in previous firmware. Pre-update missions fail to execute.

**Root Cause:** Firmware updates may deprecate SDK features, change fault code enumerations, or require reconfiguration of previously-implicit parameters.

**Repair Procedure:**
1. Read full fault list via SDK — note exact fault code strings.
2. Check BD firmware release notes for the new version — identify breaking changes.
3. Update Spot SDK on all client computers to the matching version.
4. Re-record any maps that use deprecated features.
5. Rewrite any mission scripts using deprecated SDK calls.
6. If robot is in an unrecoverable boot fault state: contact BD field service for recovery procedure.

**OEM Part Numbers:** Software fix — no hardware parts.
**Estimated Repair Time:** 1-4 hours depending on scope of changes
**Required Level:** L2

---

## Failure 10: Knee Joint Actuator Fault (Low Frequency, High Impact)

**Symptoms:** SDK fault JOINT_FAULT on one knee joint. Robot limps or sits down. Abnormal gait with one leg in reduced-function mode. Motor temperature on affected knee normal, ruling out thermal fault.

**Root Cause:** Knee joint actuator internal fault — typically encoder position error or driver overcurrent protection triggered. Less commonly: joint bearing failure.

**Repair Procedure:**
1. Read exact fault details: `fault.name` and `fault.error_code` from SDK.
2. Clear the fault and attempt motor re-enable: `power_client.power_on()` after clearing.
3. If fault immediately returns on power-on: the actuator hardware has an unrecoverable internal fault.
4. Spot knee actuator R&R requires BD service authorization. Do not attempt to open the joint housing without BD service agreement.
5. Contact BD field service with the fault code, robot serial number, and hours of operation since last service.

**OEM Part Numbers:** Knee actuator: BD factory service component — not available for independent purchase.
**Estimated Repair Time:** 4+ hours (BD field service)
**Required Level:** L2 (assessment and documentation), BD service (repair)
