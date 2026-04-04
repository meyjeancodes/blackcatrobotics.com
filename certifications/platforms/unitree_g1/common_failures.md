# Unitree G1 — Common Failures

Top 10 failure modes encountered in BCR field service operations. Sorted by frequency. Each entry includes symptoms, root cause, repair procedure, OEM part number where available, estimated repair time, and required certification level.

---

## Failure 1: Knee Joint Torque Overload (High Frequency)

**Symptoms:**
- TechMedix P2 alert: `g1_knee_left_torque_nm` or `g1_knee_right_torque_nm` sustained above 45 Nm during normal walking
- Robot reduces walking speed autonomously (firmware protective response)
- Possible audible whining from knee joint under load

**Root Cause:**
- Most common: mechanical binding from joint grease depletion or contamination
- Less common: flex spline wear in harmonic drive producing increased internal friction
- Rare: bearing race damage causing uneven load distribution

**Repair Procedure:**
1. Power off robot, engage LOTO lockout on battery connector
2. Remove knee joint cover panel (4x M4 fasteners, 3 Nm torque)
3. Inspect for debris in joint gap — clear with compressed air
4. Check grease coverage on harmonic drive flex spline — reapply Harmonic Grease SK-1A if thin or discolored
5. Reinstall cover panel to 3 Nm
6. Power on and run 30-minute walking validation — verify torque returns to < 40 Nm
7. If torque remains elevated after lubrication, escalate to L3 for harmonic drive assessment

**OEM Part Numbers:**
- Harmonic Grease SK-1A: Unitree P/N HG-SK1A-50G (50g tube)
- Knee joint cover panel gasket: Unitree P/N G1-KNEE-GSKT-001

**Estimated Repair Time:** 45 minutes (lubrication), 3 hours (harmonic drive R&R if escalated)
**Required Level:** L2 (lubrication), L3 (harmonic drive replacement)

---

## Failure 2: Battery Cell Degradation (High Frequency)

**Symptoms:**
- Runtime decreasing progressively over weeks — currently < 60% of original runtime
- TechMedix alert: `g1_battery_voltage_v` drops to < 42V under load (was previously stable)
- Battery temperature (g1_battery_temp_c) elevated by 5-8C vs. historical baseline during charge
- SoC jumps or drops suddenly (more than 10% in under 5 minutes)

**Root Cause:**
- Li-Ion cell capacity fade from cycle aging (typically appears after 300-500 full cycles or 2 years)
- Accelerated by: operation below 10% SoC, charging in temperatures > 40C, storage at > 80% SoC for extended periods

**Repair Procedure:**
1. Perform battery capacity test: fully charge to 100% SoC, discharge at rated current to 20% SoC, record total Ah discharged
2. Compare to nameplate capacity (5.0 Ah nominal) — if < 3.5 Ah (70% of nominal), replacement is indicated
3. Power off, LOTO, remove battery module (4x M5 fasteners on battery bay door, slide out)
4. Replace with new battery module, reconnect positive then negative terminal
5. Verify BMS communication on /battery_state topic
6. Perform initial charge cycle to 100% SoC before return to service

**OEM Part Numbers:**
- G1 Battery Module 48V 5Ah: Unitree P/N G1-BAT-48V5AH-001
- Battery bay door: Unitree P/N G1-BAY-DOOR-001

**Estimated Repair Time:** 30 minutes (swap), 2 hours (if including capacity test)
**Required Level:** L1 (identification and reporting), L2 (replacement)

---

## Failure 3: CAN Bus Intermittent Communication Loss (Medium Frequency)

**Symptoms:**
- TechMedix alert: `g1_can0_error_rate_pct` > 1% or rising trend
- Intermittent joint state gaps in /joint_states (missing frames visible in topic echo timestamps)
- candump shows ERRORFRAME entries
- Robot enters protective mode with reduced joint response

**Root Cause:**
- Most common: loose CAN connector at diagnostic port or internal harness
- Secondary: damaged CAN cable with intermittent continuity (often from repeated flexing during locomotion)
- Less common: failing CAN transceiver on joint drive module

**Repair Procedure:**
1. Power off, LOTO
2. Inspect diagnostic port CAN connector for bent pins or loose locking clip — reseat firmly
3. Measure termination resistance: 55-65 ohm between CAN-H and CAN-L with bus powered off (two 120-ohm terminators in parallel)
4. If < 55 ohm: an extra terminator has been added somewhere — trace and remove
5. If > 65 ohm: one terminator is missing or failed — identify and replace
6. Inspect the internal CAN harness along the leg channels for chafing or pinch points
7. Power on and monitor error rate for 30 minutes — must remain < 0.5% for 30 minutes to pass
8. If error rate persists with correct termination and intact harness, escalate to L3 for CAN transceiver assessment

**OEM Part Numbers:**
- CAN termination resistor 120 ohm: Unitree P/N G1-CAN-TERM-120R
- CAN harness replacement (full leg): Unitree P/N G1-CAN-HARNESS-LEG-001

**Estimated Repair Time:** 30 minutes (connector inspection), 2 hours (harness replacement)
**Required Level:** L2

---

## Failure 4: IMU Calibration Drift (Medium Frequency)

**Symptoms:**
- Robot exhibits increasing gait instability or balance correction frequency over time
- IMU Z-axis reads outside 9.71-9.91 m/s2 on pre-deployment check
- Gyroscope bias > 0.01 rad/s on any axis at rest
- TechMedix shows increasing standard deviation of IMU readings vs. historical baseline

**Root Cause:**
- Thermal shock from rapid temperature changes (field deployment in cold weather followed by warm facility)
- Physical impact to the head unit (IMU mounted in head)
- Normal sensor aging (MEMS gyroscope bias drift over 2+ years)

**Repair Procedure:**
1. Run IMU recalibration: robot stationary and level, run `ros2 service call /imu/calibrate std_srvs/srv/Trigger`
2. Wait 60 seconds for calibration to complete
3. Verify Z-axis returns to 9.71-9.91 m/s2
4. If calibration does not converge (LED flashes amber during calibration), inspect head unit for physical damage
5. If head unit is undamaged but calibration consistently fails, replace IMU module
6. Post-replacement: run full calibration and verify all axes within specification

**OEM Part Numbers:**
- IMU module (head unit): Unitree P/N G1-IMU-MODULE-001
- Head unit mounting gasket: Unitree P/N G1-HEAD-GSKT-001

**Estimated Repair Time:** 15 minutes (recalibration), 90 minutes (module replacement)
**Required Level:** L1 (recalibration attempt), L2 (module replacement)

---

## Failure 5: Ankle Joint Binding After Debris Ingress (Medium Frequency)

**Symptoms:**
- Elevated ankle torque (> 20 Nm on flat ground, specification is < 15 Nm)
- Audible grinding or clicking sound from ankle joint during stance phase
- Visible debris at ankle joint gap (dust, gravel, or small particulates)

**Root Cause:**
- IP42 rating provides only splash protection — the G1 is not sealed against particulate ingress
- Ankle joints are lowest on the robot and most exposed during outdoor deployments
- Particulate lodges between the ankle roll mechanism and housing, causing friction

**Repair Procedure:**
1. Power off, LOTO
2. Visually inspect ankle joint gap — identify debris location
3. Use compressed air (< 30 psi) to blow debris out of joint gap. Direct airflow from protected side to exposed side.
4. If debris is packed: use a wooden toothpick (non-conductive, non-abrasive) to dislodge packed material — never use metal tools in the joint gap
5. Manually rotate ankle through full range of motion to confirm smooth travel
6. Power on, run joint range test, verify ankle torque < 15 Nm
7. Apply protective spray (Corrosion-X HD) to joint gap on outdoor deployment units

**OEM Part Numbers:**
- Corrosion-X HD (protective spray): not OEM-specific — use any water-displacing spray rated for electronics

**Estimated Repair Time:** 20 minutes
**Required Level:** L1

---

## Failure 6: Power Board Over-Temperature Shutdown (Lower Frequency)

**Symptoms:**
- Robot shuts down unexpectedly with error code PBOARD_TEMP_OT in /robot_state.error_flags
- LED flashes rapid red at time of shutdown
- Power board (located in torso, accessible via rear panel) is hot to touch after shutdown

**Root Cause:**
- Cooling fan failure in torso compartment — fan bearing seizure
- Blocked ventilation path (dense particulate environment)
- Power board failure causing excessive heat generation (rare)

**Repair Procedure:**
1. Allow robot to cool for 15 minutes before opening
2. Remove torso rear panel (6x M4 fasteners, 3 Nm)
3. Inspect cooling fan — manually spin fan blade. If it does not spin freely, the fan bearing is seized — replace fan
4. Inspect ventilation inlet and outlet for blockage — clear with compressed air
5. Reconnect power, power on, verify fan starts spinning within 5 seconds of boot
6. Monitor power board temperature on /robot_state for 30 minutes
7. If fan is intact and vents are clear but shutdown recurs, escalate to L3 — power board requires assessment

**OEM Part Numbers:**
- Torso cooling fan (12V, 60mm): Unitree P/N G1-FAN-TORSO-001

**Estimated Repair Time:** 45 minutes
**Required Level:** L2

---

## Failure 7: Wrist Joint Position Error After Drop Impact (Lower Frequency)

**Symptoms:**
- Following a drop or fall incident, wrist joint reports position error > 0.15 radians
- Wrist does not return to home position during calibration
- Possible visible deformation of wrist housing or connector damage

**Root Cause:**
- Impact forces exceeding joint structural limits cause flex spline deformation in wrist harmonic drive
- Encoder connector disconnect from impact (recoverable without part replacement)
- Structural damage to wrist housing requiring OEM return

**Repair Procedure:**
1. Visually inspect wrist housing for visible cracks, deformation, or connector displacement
2. If encoder connector is disconnected: power off, reconnect encoder (3-pin JST), power on and re-run calibration
3. If calibration passes after connector reconnection: run full range motion test, document the incident
4. If connector is intact but position error persists: document impact severity and escalate to L3
5. Do not attempt harmonic drive repair on wrist joint — minimum L3 certification required

**OEM Part Numbers:**
- Wrist joint assembly (complete): Unitree P/N G1-WRIST-ASSY-L/R-001 (specify L or R)
- Encoder connector 3-pin JST 1.25mm: Unitree P/N G1-CONN-JST-3P-001

**Estimated Repair Time:** 15 minutes (connector reconnect), 2.5 hours (full wrist R&R — L3)
**Required Level:** L2 (connector check), L3 (wrist R&R)

---

## Failure 8: Battery BMS Communication Fault (Lower Frequency)

**Symptoms:**
- /battery_state topic stops publishing (node shows STALE in diagnostics)
- Battery SoC reads 0% despite battery being charged
- Robot enters protective shutdown due to loss of battery monitoring

**Root Cause:**
- I2C communication failure between battery BMS board and main computer
- Most common cause: connector fatigue at BMS board end of I2C cable
- Less common: BMS firmware exception requiring reset

**Repair Procedure:**
1. Power off, LOTO, allow 2 minutes for capacitors to discharge
2. Remove battery module — disconnect I2C cable at BMS connector
3. Inspect I2C cable connector for bent pins or green oxidation — clean with IPA if oxidized
4. Reseat connector firmly — should click
5. Reinstall battery module, power on
6. If /battery_state publishes correctly after reseat: monitor for 2 hours to verify stability
7. If fault recurs: replace I2C cable (BMS-to-mainboard harness)
8. If fault persists after cable replacement: replace BMS board (escalate to L3)

**OEM Part Numbers:**
- BMS-to-mainboard I2C harness: Unitree P/N G1-I2C-BMS-HARNESS-001
- BMS board: Unitree P/N G1-BMS-BOARD-001

**Estimated Repair Time:** 30 minutes (connector reseat), 90 minutes (cable replacement)
**Required Level:** L2

---

## Failure 9: Harmonic Drive Output Spline Wear (Rare, High Impact)

**Symptoms:**
- Joint position error with hysteresis (backlash detectable on manual wiggle test > 0.02 rad)
- Metallic powder (silver/grey) visible at joint seal gaps
- Audible clicking under load at specific angular positions (a worn tooth engaging)
- Torque fluctuation correlated with joint rotation frequency in FFT analysis

**Root Cause:**
- Harmonic drive flex spline tooth wear from insufficient lubrication over extended service life
- Typically appears after 2,500-4,000 operating hours
- Accelerated by operating with incorrect grease type or depleted grease

**Repair Procedure:**
- Harmonic drive R&R requires L3 certification minimum
- Remove and replace the complete joint actuator module
- Do not attempt to service the internal harmonic drive components — replace at actuator level
- Document hours at replacement for Weibull analysis

**OEM Part Numbers:**
- Knee actuator module (includes harmonic drive): Unitree P/N G1-KNEE-ACT-001
- Hip actuator module (large): Unitree P/N G1-HIP-ACT-001
- Ankle actuator module: Unitree P/N G1-ANKLE-ACT-001

**Estimated Repair Time:** 3-4 hours per joint
**Required Level:** L3

---

## Failure 10: Firmware Rollback After Failed Update (Rare)

**Symptoms:**
- Robot reverts to previous firmware version after update attempt
- LED shows rapid amber/green alternation (firmware mismatch state) during startup
- Update log at `/var/log/firmware_update.log` shows error code FW_VERIFY_FAIL or POWER_INTERRUPT

**Root Cause:**
- Battery SoC dropped below 30% during firmware flash (watchdog triggers rollback)
- Network interruption during OTA download caused corrupted firmware package
- Version incompatibility: new firmware requires configuration migration not performed

**Repair Procedure:**
1. Read `/var/log/firmware_update.log` to identify exact failure code
2. POWER_INTERRUPT: charge battery to 80%+, retry update. Do not interrupt.
3. FW_VERIFY_FAIL: re-download firmware package and verify SHA256 checksum against OEM published value before flashing
4. CONFIG_MIGRATION_REQUIRED: run `unitree_fw_tool --migrate --target v1.4.x` before flashing new version
5. After successful update: verify all joint calibration data is intact (calibration data is preserved across update but verify)

**OEM Part Numbers:**
- No hardware parts required

**Estimated Repair Time:** 1-2 hours (including battery charge wait if needed)
**Required Level:** L2
