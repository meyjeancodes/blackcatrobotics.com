# L3 Specialist Lab Exercises

Six labs requiring multi-platform and analysis capabilities.

## Lab 1: Multi-Platform Diagnostic Comparison

**Objective:** Perform equivalent basic diagnostics on Unitree G1 and Boston Dynamics Spot and document the platform-specific differences in approach and tooling.

**Equipment:** Both platforms in training standby, ROS 2 workstation, Spot SDK access.

**Procedure:** Capture joint health data from both platforms using their native interfaces. Compare diagnostic approaches. Document platform-specific commands, expected value ranges, and any tooling differences. Produce a side-by-side comparison report in TechMedix.

**Assessor Sign-off:** Accurate data from both platforms. Report correctly identifies all platform-specific differences.

---

## Lab 2: FFT Bearing Fault Identification

**Objective:** Given three accelerometer captures, identify which bearing(s) show outer race defect signatures using FFT analysis.

**Equipment:** Laptop with FFT analysis software (SciPy/NumPy or equivalent), three pre-recorded vibration files, bearing specification sheet.

**Procedure:** Load each vibration file. Run FFT and plot frequency spectrum. Calculate BPFO for the known bearing parameters. Identify peaks at or near BPFO frequency. Write assessment: which bearings are healthy, which show early-stage defects, and recommended action for each.

**Assessor Sign-off:** All defect bearings correctly identified. BPFO calculation verified correct.

---

## Lab 3: Fleet Alert Pattern Analysis

**Objective:** Analyze a TechMedix fleet alert export covering 30 days and 8 robots to identify systematic failure patterns.

**Equipment:** TechMedix training account with sample data export, spreadsheet software.

**Procedure:** Export alert history. Group by fault code. Identify any fault codes appearing in 3+ robots. Check if correlated by production batch, region, or recent firmware update. Write a fleet pattern report with recommendations for fleet-wide preventive action.

**Assessor Sign-off:** Correct pattern identification. Report includes actionable recommendations.

---

## Lab 4: MTBF Calculation and Maintenance Schedule

**Objective:** Calculate fleet MTBF from provided failure log and produce a preventive maintenance schedule.

**Equipment:** Failure log (provided by assessor), TechMedix maintenance scheduling interface.

**Procedure:** Calculate MTBF from failure log. Set preventive maintenance interval at 80% of MTBF. Enter maintenance schedule in TechMedix for all 5 robots in the training fleet. Verify schedule shows correct next-service dates.

**Assessor Sign-off:** MTBF calculation verified correct. Schedule entered correctly in TechMedix.

---

## Lab 5: FMEA with RPN Calculation and Escalation Decision

**Objective:** Complete an FMEA for 5 provided failure modes and make correct escalation decisions based on RPN thresholds.

**Equipment:** FMEA template, platform specifications, TechMedix FMEA module.

**Procedure:** For each failure mode, assign Severity, Occurrence, and Detectability scores with written justification. Calculate RPN. Make escalation decision for each. Enter completed FMEA into TechMedix.

**Assessor Sign-off:** At least 4 of 5 RPN calculations within acceptable range (assessor has reference values). Escalation decisions correct for all critical items.

---

## Lab 6: Multi-Platform Repair Assessment

**Objective:** Given fault scenarios on both Unitree G1 and DJI Agras T50, produce repair plans with parts, time estimates, and correct escalation.

**Equipment:** TechMedix training account with pre-configured fault scenarios.

**Procedure:** Review fault data for both robots. Produce repair plan for each: parts list, estimated repair time, technician level required, escalation if outside L3 scope. Submit both plans in TechMedix.

**Assessor Sign-off:** Repair plans technically accurate. All out-of-scope items correctly escalated.
