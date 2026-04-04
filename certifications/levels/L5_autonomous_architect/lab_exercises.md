# L5 Autonomous Systems Architect — Lab Exercises

Five labs covering ML pipeline development, edge AI deployment on Jetson AGX Thor, platform module authoring, standards compliance assessment, and industry leadership deliverables.

---

## Lab 5-1: Predictive Maintenance ML Pipeline

**Objective:** Build and evaluate a complete ML pipeline for robot bearing failure prediction using 6 months of provided fleet telemetry data.

**Equipment:**
- Python 3.10+ with scikit-learn, XGBoost, SHAP, imbalanced-learn, matplotlib
- Provided dataset: lab5_telemetry_6mo.parquet (50 robots, 14 signals, 1Hz, 26 weeks)
- Provided labels: lab5_failures.csv (failure events with robot_id, timestamp, failure_mode)
- Reference: curriculum.md Section 1

**Safety:**
- ML/data science exercise — no physical robot interaction

**Procedure:**

1. **Exploratory Data Analysis:** Load the telemetry dataset. Plot signal distributions for 5 key signals. Identify and handle missing values (< 5% missing: forward-fill; > 5% missing: document and exclude the signal). Calculate Pearson correlation matrix — identify pairs with |r| > 0.8 as candidates for feature elimination.

2. **Feature Engineering:** For each signal, compute rolling features on 1h, 6h, and 24h windows: mean, std, min, max, kurtosis. Compute vibration RMS from the vibration signal. Compute Shannon entropy on 1h windows. Compute linear regression slope over 24h window for temperature and torque signals.

3. **Label Construction:** Create binary failure labels: 1 if a failure occurs within the next 48 hours, 0 otherwise. Calculate class imbalance ratio. Apply SMOTE oversampling if imbalance ratio > 20:1.

4. **Model Training and Evaluation:**
   - Split data: train on weeks 1-20, validate on weeks 21-24, test on weeks 25-26 (temporal split — never shuffle)
   - Train XGBoost classifier with 5-fold time-series cross-validation on training set
   - Evaluate on test set: precision, recall, F1, AUC-PR (not AUC-ROC — class imbalance)
   - Determine operational threshold: find the probability threshold that achieves recall >= 0.80 while maximizing precision

5. **SHAP Analysis:** Compute SHAP values for all features. Plot:
   - Global feature importance bar chart
   - SHAP summary plot showing direction of impact for top 10 features
   - For 3 true positive predictions, show the local SHAP waterfall explaining why each was flagged

6. **Distribution Shift Monitoring Design:** Design a monitoring system that detects when input feature distributions drift more than 2 standard deviations from training distribution. Implement using Population Stability Index (PSI) for categorical features and KL-divergence for continuous features. Define alert thresholds and retraining trigger criteria.

7. **Report:** 3-page technical report covering: dataset description, feature engineering decisions, model selection rationale, evaluation results, SHAP findings, and operational deployment recommendations including retraining schedule.

**Outcomes:**
- Working XGBoost model with documented hyperparameters
- Evaluation metrics table (precision, recall, F1, AUC-PR at operational threshold)
- SHAP analysis figures
- Distribution shift monitoring specification
- 3-page technical report

**Errors / Troubleshooting:**
- Temporal leakage: never use future data in features; always use strictly causal windows (data from before the prediction timestamp only)
- Overfitting: if train F1 >> test F1, reduce max_depth (try 3-5 for XGBoost) and add L1/L2 regularization
- PSI threshold: PSI < 0.1 (stable), 0.1-0.2 (moderate shift), > 0.2 (significant shift requiring investigation)

**L5 Sign-off Criteria:**
- [ ] No temporal leakage in feature construction or train/test split
- [ ] AUC-PR > 0.70 on test set
- [ ] SHAP analysis identifies physically meaningful top features (temperature trend, vibration entropy should appear in top 5)
- [ ] Distribution shift monitoring design reviewed by senior architect

---

## Lab 5-2: TensorRT Edge Deployment on Jetson AGX Thor

**Objective:** Convert a PyTorch joint health classification model to TensorRT INT8, deploy on Jetson AGX Thor, and measure production inference latency under multi-model load.

**Equipment:**
- NVIDIA Jetson AGX Thor development kit
- PyTorch model: lab5_joint_health_classifier.pth (ResNet-18 based, 5-class output)
- Calibration dataset: lab5_calibration_data/ (500 spectrogram images)
- JetPack 6.0 SDK installed
- Reference: curriculum.md Section 2

**Safety:**
- No live robot interaction — model processes pre-recorded spectrogram data
- Handle Jetson hardware with ESD precautions; do not operate in temperatures > 35C ambient without active cooling

**Procedure:**

1. **ONNX Export:** Load the PyTorch model and export to ONNX:
   ```python
   import torch
   model = load_model('lab5_joint_health_classifier.pth')
   dummy_input = torch.randn(1, 3, 224, 224)
   torch.onnx.export(model, dummy_input, 'joint_health.onnx',
                     opset_version=17, input_names=['input'],
                     output_names=['output'], dynamic_axes={'input': {0: 'batch'}})
   ```
   Verify ONNX graph with onnxruntime. Compare outputs with PyTorch model on 10 test samples — values must be within 1e-5.

2. **INT8 Calibration:** Implement the IInt8EntropyCalibrator2 interface. Load the 500 calibration images, preprocess identically to training (normalize with ImageNet mean/std). Build TensorRT engine with INT8 calibration:
   ```python
   config.set_flag(trt.BuilderFlag.INT8)
   config.int8_calibrator = JointHealthCalibrator('lab5_calibration_data/', cache='calibration.cache')
   ```

3. **Engine Build and Serialization:** Build the TensorRT engine for the Jetson AGX Thor GPU. Serialize to disk. Record build time. Verify engine file size vs. original PyTorch model.

4. **Latency Benchmark:** Run 1,000 inference iterations with the TensorRT engine. Record: mean latency, P50, P95, P99, max. Compare against native PyTorch inference on the same hardware.

5. **Multi-Model Load Test:** Simultaneously run three TensorRT engines:
   - High priority: human_detection_model (safety)
   - Medium priority: joint_health_classifier (this lab)
   - Low priority: ar_annotation_model (background)
   
   Configure CUDA stream priorities as described in curriculum. Record latency for each model under combined load. Verify that the high-priority model's P99 latency remains within its 200ms budget.

6. **Thermal Monitoring:** Monitor GPU junction temperature during the 10-minute load test: `watch -n 1 cat /sys/class/thermal/thermal_zone0/temp`. Record: baseline temperature, steady-state temperature under load, and whether throttling occurs. If throttling occurs at 85C, document the latency increase and recommend a cooling improvement.

7. **Accuracy Validation:** On the Jetson, run the INT8 model on the 100-sample test set. Compare to FP32 PyTorch results. Compute accuracy difference. Determine if the accuracy tradeoff is acceptable for the joint health classification task.

**Outcomes:**
- ONNX model exported and verified
- TensorRT INT8 engine built with calibration cache
- Latency benchmark table (mean, P50, P95, P99 — FP32 PyTorch vs. TRT INT8)
- Multi-model load test results with priority scheduling verified
- Thermal monitoring log
- Accuracy comparison: FP32 vs INT8

**Errors / Troubleshooting:**
- Calibration cache miss: if calibration takes > 20 minutes, reduce calibration batch size from 32 to 8
- Accuracy drop > 3%: check calibration dataset is representative; consider FP16 instead of INT8 for this model
- Thermal throttling: add active fan and verify thermal paste contact; increase fan speed in jetson_clocks settings

**L5 Sign-off Criteria:**
- [ ] INT8 engine provides at least 2x speedup over FP32 PyTorch
- [ ] High-priority safety model meets 200ms P99 latency under multi-model load
- [ ] Accuracy degradation < 2% from FP32 to INT8
- [ ] No unexplained thermal throttling during 10-minute sustained load test

---

## Lab 5-3: Platform Module Authoring — New Robot Integration

**Objective:** Author a complete BCR platform module for a provided robot platform (Agility Robotics Digit or equivalent), including platform_module.md, diagnostic_guide.md, and common_failures.md.

**Equipment:**
- Robot platform access (minimum 4 hours)
- CAN bus analyzer (Peak PCAN-USB)
- Laptop with ROS 2 Humble or platform SDK installed
- Video camera for boot sequence recording
- Reference: curriculum.md Section 3 and existing platform modules in certifications/platforms/

**Safety:**
- Follow the robot's OEM safety procedures before powering on
- Wear ESD strap when accessing internal connectors
- Never disable emergency stop functionality during diagnostic signal mapping

**Procedure:**

1. **Boot Sequence Documentation:** Record a full power-on sequence from cold start to operational state on video. From the recording, document: each LED state with color/pattern, timing from power-on, and what each state represents. Cross-reference with any available OEM documentation.

2. **Communication Bus Discovery:** Connect the CAN analyzer to the robot's diagnostic port. Log raw bus traffic for 20 minutes of normal operation using `candump`. Identify message IDs present, message frequency, and data payload structure. Decode at least 5 distinct message types (identify joint positions, joint velocities, battery state, error flags).

3. **Signal Mapping:** Create the BCR canonical signal ID mapping table. For each identified signal: assign BCR signal ID using the naming convention, specify the unit conversion from raw to SI units, measure update rate, and document the CAN message ID and byte offset within the payload.

4. **IMU Verification:** Place the robot on a level surface. Record IMU Z-axis acceleration for 30 seconds. Verify the reading is 9.81 +/- 0.1 m/s2. Document the exact command or ROS topic used to access IMU data.

5. **Failure Mode Research:** Research 10 common failures from: (a) OEM service bulletins if available, (b) robotics forum discussions, (c) physical inspection of wear indicators on the robot unit. For each failure: describe symptoms, hypothesize root cause, identify repair procedure, locate component part numbers from physical labels or OEM catalog.

6. **Platform Module Authoring:** Write all three required documents following the BCR standard format. Each document must include all required sections with no placeholder text — all content must be based on actual findings from this lab session.

7. **Peer Validation:** Have an L3 or L4 colleague field-test the diagnostic guide using a second robot unit. They must be able to complete the IMU check and bus heartbeat verification using only the written guide (no verbal assistance from the author). Document any steps that required clarification and revise accordingly.

**Outcomes:**
- platform_module.md (complete with specs, communication topology, signal ID mapping)
- diagnostic_guide.md (complete with verified commands and expected outputs)
- common_failures.md (10 failure modes with symptoms, procedures, part numbers)
- Peer validation feedback and revision log

**Errors / Troubleshooting:**
- CAN bus not accessible: check bus termination (60 ohm across CAN-H/CAN-L); verify baud rate matches robot configuration (typically 500kbps or 1Mbps for humanoid robots)
- Signal ambiguity: if two message IDs appear to carry similar data, log both and run a controlled test (move a specific joint; observe which message ID changes)
- Missing part numbers: check the component manufacturer's marking directly on the physical part; use the manufacturer name and marking to find the part number in their catalog

**L5 Sign-off Criteria:**
- [ ] All three required documents are complete with no placeholder text
- [ ] Signal ID mapping verified against live robot data by a second engineer
- [ ] Peer validation passed (L3/L4 colleague completes diagnostics using guide only)
- [ ] 10 failure modes all have part numbers or documented source for obtaining them

---

## Lab 5-4: Standards Compliance Assessment

**Objective:** Conduct a compliance gap analysis for a TechMedix deployment at a simulated EU manufacturing facility, assessing against ISO 10218-1, ISO/TS 15066, and EU AI Act requirements.

**Equipment:**
- TechMedix staging environment with simulated facility configuration
- Provided facility profile: lab5_eu_facility_brief.pdf (robot types, workspace layout, human-robot interaction zones)
- ISO 10218-1 and ISO/TS 15066 clause reference (provided as lab5_standards_reference.pdf)
- Reference: curriculum.md Section 4

**Safety:**
- Compliance assessment exercise — no physical interaction

**Procedure:**

1. **Facility Review:** Read the facility brief. Identify: robot models deployed, workspace zones (collaborative vs. restricted), human worker proximity patterns, and any existing safety measures (light curtains, speed limiters, presence detectors).

2. **ISO 10218-1 Clause Assessment:** Evaluate the facility against 10 key clauses from ISO 10218-1. For each clause: state whether the facility is compliant, partially compliant, or non-compliant, with specific evidence from the facility brief.

3. **ISO/TS 15066 Collaborative Operation Assessment:** For each collaborative workspace zone: verify that robot speed is < 250mm/s near humans. Verify that contact force limits are enforced by the robot controller (hand/finger region: 65N transient, 25N quasi-static). Document how compliance is verified — is it hardware-enforced, software-enforced, or reliant on physical barriers?

4. **EU AI Act Classification:** Determine whether the facility's robots qualify as High-Risk AI under the EU AI Act. Document: the specific provision that applies, the required conformity assessment procedure, and which documentation must be prepared.

5. **Gap Analysis Report:** Compile a gap analysis report with: compliance status for each requirement, risk severity for each gap (high/medium/low), recommended corrective actions, and estimated effort to close each gap.

6. **Remediation Roadmap:** Prioritize the top 5 gaps by risk severity and create a 12-month remediation roadmap. For each gap: responsible party (OEM, integrator, or operator), estimated cost, and verification method.

**Outcomes:**
- ISO 10218-1 clause-by-clause assessment table
- ISO/TS 15066 collaborative operation compliance matrix
- EU AI Act classification determination with justification
- Gap analysis report
- 12-month remediation roadmap

**Errors / Troubleshooting:**
- Clause interpretation ambiguity: document the interpretation used and mark it for legal counsel review
- Missing information: document what information is required to complete the assessment and what assumptions were made
- Partial compliance: partial compliance is not compliance — always document the specific non-conforming aspect even if it is minor

**L5 Sign-off Criteria:**
- [ ] All 10 ISO 10218-1 clauses assessed with specific evidence
- [ ] Contact force limit compliance method (hardware vs. software enforcement) correctly identified
- [ ] EU AI Act classification determination includes specific article reference
- [ ] Remediation roadmap prioritized by risk, not by ease of implementation

---

## Lab 5-5: Industry Leadership Deliverable — Position Paper and Presentation

**Objective:** Research, write, and present a technical position paper on a current challenge in robot field service, demonstrating L5-level industry leadership capability.

**Equipment:**
- Access to IEEE Xplore, ACM Digital Library, and relevant standards documents
- Word processor for paper authoring
- Presentation software

**Safety:**
- Research and writing exercise

**Procedure:**

1. **Topic Selection:** Choose one of the following topics (or propose an alternative with instructor approval):
   - (a) Data portability standards for robot telemetry: why OGC SensorThings API should be the industry baseline
   - (b) The case for federated learning in multi-customer robot maintenance platforms: privacy, accuracy, and governance
   - (c) Edge AI vs. cloud AI for robot safety functions: a reliability and latency analysis framework
   - (d) Proposed SIL requirements for humanoid robot AI decision-making systems under IEC 61508

2. **Literature Review:** Identify 8-12 relevant academic papers, standards documents, or industry reports. Write a 500-word annotated bibliography summarizing the key finding of each source and its relevance to the paper's argument.

3. **Position Paper Authoring (2,500-3,000 words):**
   - Abstract (200 words): state the problem, the position, and the key supporting evidence
   - Introduction: motivate the problem with quantitative industry context (fleet sizes, cost data, incident data)
   - Background: summarize relevant existing standards, research, and practice
   - The Position: state BCR's recommended approach clearly
   - Evidence: 3 major supporting arguments with quantitative evidence or documented case studies
   - Counterarguments: address the two strongest objections to the position
   - Conclusion: specific, actionable recommendation for industry stakeholders
   - References: IEEE citation format

4. **Presentation:** Prepare a 15-minute presentation with 12-15 slides for a mixed technical and business audience. Include:
   - Problem statement with market size context
   - Current state and its deficiencies (with data)
   - Proposed standard/approach
   - Implementation roadmap
   - Call to action for the audience

5. **Peer Review Exchange:** Exchange position papers with another L5 candidate. Provide written peer review (400-500 words) addressing: argument quality, evidence strength, counterargument handling, and clarity of recommendation.

6. **Revision:** Revise the paper based on peer review feedback. Document which suggestions were incorporated and which were rejected (with rationale).

**Outcomes:**
- Annotated bibliography (500 words)
- Position paper (2,500-3,000 words)
- 15-minute presentation (slides)
- Peer review of another candidate's paper (400-500 words)
- Revised position paper with revision notes

**Errors / Troubleshooting:**
- Weak evidence: quantitative data from BCR deployments (with customer permission) is the strongest evidence; supplement with published research for claims BCR cannot support with proprietary data
- Circular argument: test each argument independently — the conclusion should not appear in the premises
- Overly broad scope: a position paper argues for one specific, actionable position; multiple positions dilute impact

**L5 Sign-off Criteria:**
- [ ] Position paper argues a single, clearly stated position
- [ ] Three supporting arguments all backed by quantitative evidence or documented case studies
- [ ] Counterarguments addressed substantively (not dismissed)
- [ ] Presentation delivered to audience including at least one non-technical stakeholder
- [ ] Peer review provided and revision notes documented
