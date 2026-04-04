# DJI Agras T50 — Common Failures

Top 10 failure modes from BCR field service operations. Agricultural spray drones operate in harsh environments with chemical exposure — chemical residue is a factor in most maintenance failures.

---

## Failure 1: Nozzle Blockage (High Frequency)

**Symptoms:** Individual nozzle flow rate 15-30% below specification. TechMedix alert on `t50_nozzle_{n}_flow_lpm`. Uneven spray pattern visible — dry strips in the field.

**Root Cause:** Agrichemical crystallization in the nozzle orifice (0.5-1.2mm diameter). Herbicide concentrates, fungicides, and growth regulators crystallize when spray residue dries in the nozzle. Also caused by tank sediment (undissolved chemical particles) passing through the filter and lodging in the orifice.

**Repair Procedure:**
1. Power off, remove battery, engage safety clip.
2. Remove blocked nozzle — quarter-turn counterclockwise.
3. Inspect nozzle orifice under magnification — identify blockage location.
4. Soak in warm water for 5 minutes to dissolve water-soluble residues.
5. If residue remains: use ultrasonic cleaner (40 kHz, water + 1% dish soap, 5 minutes).
6. Rinse with clean water. Verify orifice is clear by holding to light.
7. Do not use metal probes or wires to clear the orifice — the orifice is precision-manufactured to tight tolerance.
8. Reinstall and test flow rate against reference measurement. Must be within 5% of specification.

**OEM Part Numbers:** Standard nozzle 110-02 (0.5mm orifice): DJI P/N 10010503 (pack of 10); Standard nozzle 110-04 (1.2mm orifice): DJI P/N 10010504
**Estimated Repair Time:** 30 minutes per nozzle
**Required Level:** L1

---

## Failure 2: Flow Sensor Calibration Drift (High Frequency)

**Symptoms:** DAMP reports total flow rate 10-15% above or below actual measured flow (verified by graduated container test). Automatic variable rate application uses incorrect application rate.

**Root Cause:** Hall-effect flow sensor calibration drifts from: chemical residue coating the sensor impeller, debris partially blocking the impeller, or temperature-induced zero-point drift after cold weather operation.

**Repair Procedure:**
1. Flush the spray system with 5L of clean water after each chemical application — prevents residue accumulation.
2. For existing drift: remove the inline flow sensor from the spray manifold (two quick-disconnect fittings).
3. Inspect and clean the impeller chamber — remove any visible debris.
4. Reassemble and perform DAMP flow calibration: Menu → Spray → Flow Calibration.
5. Verify calibration by comparing DAMP-reported flow against graduated container measurement.
6. If drift > 5% after calibration: replace flow sensor.

**OEM Part Numbers:** Inline flow sensor assembly: DJI P/N 10011205
**Estimated Repair Time:** 45 minutes (cleaning + calibration), 1 hour (replacement)
**Required Level:** L2

---

## Failure 3: Motor Propeller Strike Damage (Medium Frequency)

**Symptoms:** TechMedix alert: `t50_motor_rpm_asymmetry_pct` > 5% during flight. Aircraft vibrates excessively. Asymmetric propeller tip wear visible on inspection. One or more propellers show leading edge chip or bent tip.

**Root Cause:** Contact with vegetation, field obstacles, or debris during low-altitude operations. T50 operates at 2-5 m altitude over crop canopy — tree branches, fence posts, and GPS signal dropouts causing altitude hold failure are common causes.

**Repair Procedure:**
1. Power off, remove battery.
2. Inspect all 8 propellers (T50 has 4 motors with 2 props each — folding rotor system).
3. Any visible damage (chip > 2mm, visible crack, bend > 1mm at tip): replace propeller pair — always replace in matched pairs.
4. After reinstalling: perform ground spin test with DJI Pilot 2 and verify RPM asymmetry < 3%.
5. Inspect motor shaft for runout: hold propeller tip and feel for wobble. More than 0.5mm runout at tip indicates bent motor shaft — replace motor.

**OEM Part Numbers:** T50 propeller pair 1370 (folding, CW+CCW): DJI P/N 10010801; T50 motor 6010 replacement: DJI P/N 10010901
**Estimated Repair Time:** 20 minutes (propeller swap), 2 hours (motor replacement — L3)
**Required Level:** L1 (propeller replacement), L3 (motor R&R)

---

## Failure 4: Battery BMS Cell Balancing Fault (Medium Frequency)

**Symptoms:** One battery shows charge percentage significantly lower than the other (> 15% difference) at the end of a flight where both batteries should deplete equally. DJI Pilot 2 shows individual cell voltage imbalance > 0.1V.

**Root Cause:** Cell-to-cell variation in a LiPo battery pack aging unevenly. The T50 uses series-parallel cell configurations — a cell group with higher internal resistance charges and discharges faster, becoming out of balance with other groups.

**Repair Procedure:**
1. Charge both batteries to 100% SoC.
2. In DJI Pilot 2: Battery → [Affected Battery] → Cell Details. Check individual cell voltages.
3. Any cell > 0.05V from adjacent cells: perform balance charge cycle (DJI smart charger has balance mode).
4. If imbalance persists after 3 balance charge cycles: replace battery.
5. Document replacement date and cycle count for the replaced battery.

**OEM Part Numbers:** T50 intelligent flight battery 30000 mAh: DJI P/N 10010201 (each battery, specify Battery 1 or 2 position)
**Estimated Repair Time:** 30 minutes (assessment + balance charge setup), 45 minutes (replacement)
**Required Level:** L2

---

## Failure 5: GPS Signal Interference from Agricultural RF Sources (Medium Frequency)

**Symptoms:** TechMedix alert: `t50_gps_satellite_count` drops below 8 during operation near specific equipment. `t50_gps_hdop` rises above 2.0. Aircraft hovers inaccurately or drifts during automated missions.

**Root Cause:** Agricultural equipment with high-power RF emissions: combine harvesters with GPS trackers, soil moisture RF sensors, or irrigation control systems operating in GPS frequency bands.

**Repair Procedure:**
1. Identify interference source by mapping GPS signal quality vs. position relative to equipment.
2. Increase minimum altitude above interference source (GPS interference typically attenuates with altitude).
3. Temporarily power down interfering equipment during spray operation if operationally possible.
4. If interference is persistent: use RTK GPS mode (if T50 RTK module is installed) — RTK corrections from a local base station are immune to this type of interference.
5. Document interference source for customer site safety assessment.

**OEM Part Numbers:** T50 RTK module: DJI P/N 10010701 (required for RTK operation)
**Estimated Repair Time:** 1-2 hours (site survey and configuration)
**Required Level:** L2

---

## Failure 6: Spray Pump Motor Degradation (Lower Frequency)

**Symptoms:** Maximum achievable spray flow rate decreasing progressively over months. At specification setting of 16 L/min, actual measured flow is 12-13 L/min. Flow sensor calibration rules out sensor issues.

**Root Cause:** Centrifugal pump impeller wear from prolonged exposure to abrasive pesticide concentrations. Also from dry-running (operating pump without liquid in tank).

**Repair Procedure:**
1. Verify tank has > 2L of liquid during spray operations — pump should never run dry.
2. Remove spray pump assembly from manifold (quick-disconnect fittings + 4x M4 fasteners).
3. Inspect pump inlet screen for blockage — clean with water.
4. Disassemble pump head: remove impeller housing (3x M3 fasteners).
5. Inspect impeller for visible wear — smooth, ungrooved impeller surface should be visible. Wear appears as dull scoring on impeller face.
6. Replace pump assembly if impeller shows wear — individual impeller replacement is not cost-effective vs. pump assembly cost.

**OEM Part Numbers:** T50 spray pump assembly: DJI P/N 10011101
**Estimated Repair Time:** 1.5 hours
**Required Level:** L2

---

## Failure 7: Radar Altimeter Obstruction Sensor Fault (Lower Frequency)

**Symptoms:** Aircraft does not maintain consistent low-altitude operation over terrain variation. TechMedix alert: radar_alt deviation. Aircraft flies higher or lower than commanded altitude relative to crop canopy.

**Root Cause:** Radar altimeter dome contamination (mud or dense crop residue blocking the antenna). T50 uses a downward-facing radar altimeter for terrain following — critical for accurate spray height.

**Repair Procedure:**
1. Inspect the flat circular radar altimeter dome (bottom of aircraft body, 80mm diameter).
2. Clean with damp soft cloth — do not use abrasive materials.
3. Verify no physical damage (cracks, impact marks) to the dome.
4. Calibrate altimeter: DJI Pilot 2 → Aircraft → Radar → Calibrate. Aircraft must be at a known height (1.5m above level ground).
5. Test terrain following: manually fly over terrain with 0.5m elevation change and verify aircraft altitude varies appropriately.

**OEM Part Numbers:** Radar altimeter dome replacement: DJI P/N 10010601
**Estimated Repair Time:** 30 minutes (cleaning + calibration), 2 hours (dome replacement — L3)
**Required Level:** L1 (cleaning), L3 (dome replacement)

---

## Failure 8: Battery Connector Corrosion (Lower Frequency)

**Symptoms:** Battery connection warning in DJI Pilot 2 on startup. One battery shows voltage lower than expected at full charge. Visible green or white oxidation on battery connector pins.

**Root Cause:** Chemical exposure from spray mist settling on battery compartment. Agrichemical residues are corrosive — chloride-containing herbicides accelerate connector corrosion.

**Repair Procedure:**
1. Power off, remove battery.
2. Inspect connector contacts with magnification — identify oxidation.
3. Clean contacts with DeoxIT D5 contact cleaner and foam swab. Wipe with clean dry cloth.
4. If oxidation is deep (pitting visible under magnification): replace battery connector end (requires soldering — L3).
5. Preventive measure: apply thin layer of Corrosion-X to battery compartment seals after each maintenance to prevent chemical ingress.

**OEM Part Numbers:** Battery connector XT60 replacement: standard commercial; Corrosion-X (commercial aviation grade): standard commercial
**Estimated Repair Time:** 20 minutes (cleaning), 60 minutes (connector replacement — L3)
**Required Level:** L1 (cleaning), L3 (connector replacement)

---

## Failure 9: Tank Level Sensor Inaccuracy

**Symptoms:** Remaining payload display in DJI Pilot 2 significantly differs from actual tank level (> 10% deviation). Mission aborts prematurely because sensor shows empty before tank is actually empty, or runs out unexpectedly.

**Root Cause:** Chemical crystallization or film on the ultrasonic level sensor transducer face inside the tank. T50 uses an ultrasonic level sensor — residue changes the acoustic reflection characteristics.

**Repair Procedure:**
1. Drain and rinse tank with clean water (3 full rinse cycles).
2. Inspect ultrasonic transducer inside tank (round disc on inside wall, ~25mm diameter).
3. Clean transducer face with damp soft cloth — do not scratch the transducer surface.
4. Refill tank with known quantity of water (measured in calibrated container).
5. Perform level sensor calibration: DJI Pilot 2 → Spray → Tank Calibration. Enter actual volume.
6. Verify reported level matches measured level within 5%.

**OEM Part Numbers:** Tank level sensor assembly: DJI P/N 10011301
**Estimated Repair Time:** 45 minutes
**Required Level:** L1 (cleaning and calibration)

---

## Failure 10: ESC Overtemperature During Extended High-Speed Operations (Rare)

**Symptoms:** DJI Pilot 2 shows ESC TEMPERATURE WARNING on one or more ESCs. Aircraft reduces motor output on affected ESC. ESC temperature > 85C (specification is < 80C).

**Root Cause:** Extended high-speed transit flights (> 10 m/s) in high ambient temperature environments. T50 ESCs are cooled by airflow — at full payload with high-speed transit, the heat generation can exceed the passive cooling capacity.

**Repair Procedure:**
1. Land immediately if ESC temperature reaches 90C.
2. Allow ESC to cool for 10 minutes (maintain propellers spinning at minimum throttle for airflow if safe).
3. Verify ESC fault clears — DJI Pilot 2 should show NORMAL after cooling.
4. Adjust mission profile: reduce transit speed to 7 m/s in ambient temperatures > 35C.
5. Inspect ESC heat sink fins for blockage (crop dust accumulation).
6. If ESC fault recurs at normal temperatures and speeds: replace the affected ESC module.

**OEM Part Numbers:** T50 ESC module (40A): DJI P/N 10010401 (specify ESC position: 1-4)
**Estimated Repair Time:** 20 minutes (cooling + inspection), 2 hours (ESC replacement — L3)
**Required Level:** L1 (cooling and inspection), L3 (ESC replacement)
