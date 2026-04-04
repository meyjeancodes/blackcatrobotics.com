# L5 Autonomous Systems Architect Curriculum

Five sections covering ML for predictive maintenance, edge AI on Jetson AGX Thor, platform definition authoring, industry standards and compliance, and industry leadership.

---

## Section 1: Machine Learning for Predictive Maintenance

### Why ML in Robot Field Service

Traditional threshold-based alerting (e.g., temperature > 70C triggers alert) misses gradual degradation patterns and generates excessive false alarms. Machine learning extracts patterns from multivariate time-series telemetry that no single threshold captures — joint temperature combined with torque trend combined with vibration entropy together predict bearing failure 48-72 hours in advance.

BCR's ML pipeline runs on a 6-month rolling training window with weekly retraining cycles. Models are evaluated on a held-out test set from the most recent 30 days before deployment.

### Signal Feature Engineering

Raw telemetry signals require transformation into features that capture degradation physics:

**Statistical features (computed on rolling windows):**
- Mean, standard deviation, min/max, interquartile range
- Skewness and kurtosis (bearing defects increase kurtosis before other changes)
- Root mean square (RMS) of vibration

**Frequency domain features:**
- FFT magnitude at known fault frequencies (BPFO, BPFI, BSF)
- Total harmonic distortion (THD)
- Spectral centroid and bandwidth

**Information theory features:**
- Shannon entropy: H = -sum(p(x) * log2(p(x))) — a stuck sensor has near-zero entropy; an anomalous sensor has elevated entropy
- Approximate entropy (ApEn) for nonlinear regularity measurement

**Trend features:**
- Linear regression slope over 24h, 72h, 168h windows
- Rate of change (first derivative) of temperature, torque
- Pearson correlation between signal pairs (e.g., battery_voltage vs. motor_temperature)

### Model Architectures for Telemetry

**LSTM Autoencoder (unsupervised anomaly detection):**
- Trained on 6 months of normal operation data only
- Reconstruction error is the anomaly score — normal data reconstructs accurately; anomalous patterns produce high error
- Threshold set at 99th percentile of training reconstruction error
- Advantage: no failure labels required; works from day one of deployment
- Limitation: no explanation of why an anomaly was detected

**Gradient Boosting (supervised failure prediction):**
- Requires labeled failure events in training data
- Input: feature vectors from 72h lookback window
- Output: probability of failure within next 48h
- SHAP analysis for feature importance and explanation
- Advantage: high accuracy when sufficient failure labels exist; explainable
- Limitation: requires 50+ labeled failure events per failure mode for reliable training

**Temporal Convolutional Network (TCN):**
- Dilated causal convolutions capture long-range temporal dependencies efficiently
- Faster inference than LSTM with comparable accuracy on most telemetry tasks
- Suitable for Jetson AGX Thor real-time deployment

### Model Evaluation Metrics

For imbalanced datasets (rare failures vs. frequent normal operation):
- **Precision:** Of all predicted failures, what fraction were real failures? High precision = few false alarms
- **Recall:** Of all real failures, what fraction were predicted? High recall = few missed failures
- **F1-score:** Harmonic mean of precision and recall: 2 * (P * R) / (P + R)
- **AUC-ROC:** Discriminative ability across all threshold settings
- **AUC-PR:** Precision-Recall curve area — more informative than ROC for imbalanced datasets

**Calibration:** Predicted probabilities should match observed frequencies. A model predicting 80% failure probability should be correct 80% of the time. Use Platt scaling or isotonic regression to calibrate.

### Handling Distribution Shift

Robot operating conditions change over time:
- Seasonal temperature variation changes thermal baselines
- New task types alter load profiles
- Component wear changes the "normal" signal pattern

Monitoring for distribution shift:
- Track rolling mean and variance of input features — alert if drift exceeds 2 standard deviations from training distribution
- Monitor prediction score distribution — if the model outputs high scores on seemingly normal robots, distribution shift is likely
- Use concept drift detection algorithms (ADWIN, Page-Hinkley test) on streaming data

Response to drift: retrain on recent data, apply domain adaptation fine-tuning, or use online learning to incrementally update model weights.

### Federated Learning for Multi-Customer Deployments

Federated learning trains models across customer sites without sharing raw telemetry:
1. Central server distributes current model weights to all participating sites
2. Each site trains locally for one epoch on their data
3. Sites return gradient updates (not raw data) to central server
4. Central server aggregates gradients (FedAvg: weighted average by dataset size)
5. Updated model distributed to all sites

Privacy consideration: gradient inversion attacks can partially reconstruct training data from gradients. For sensitive deployments, add calibrated Gaussian noise to gradients (differential privacy) before sharing, with epsilon budget of 1.0-5.0 depending on sensitivity requirements.

---

## Section 2: Edge AI — NVIDIA Jetson AGX Thor

### Platform Specifications

The NVIDIA Jetson AGX Thor is BCR's reference edge compute platform for robot-side AI inference:

- AI Performance: 275 TOPS (Tensor Operations Per Second)
- GPU: NVIDIA Ampere architecture with 64 tensor cores
- CPU: 12-core Arm Cortex-A78AE
- Memory: 64GB LPDDR5x unified memory
- Storage: 64GB eMMC 5.1 + NVMe M.2 expansion
- Interfaces: PCIe 5.0, 2x USB4, CSI camera connectors, 10GbE
- Power modes: 15W (efficiency) to 60W (max performance)
- Operating temperature: -25C to 85C junction

### Inference Precision Tradeoffs

| Precision | Accuracy | Speed | Memory |
|---|---|---|---|
| FP32 | Baseline | 1x | 4 bytes/param |
| FP16 | -0.1 to -0.5% | 2-3x | 2 bytes/param |
| INT8 | -0.5 to -3% | 4-8x | 1 byte/param |
| INT4 | -2 to -8% | 8-16x | 0.5 bytes/param |

INT8 is the standard production precision for TechMedix edge models. FP16 is used for safety-critical models where accuracy degradation must be minimized.

### TensorRT Optimization Pipeline

TensorRT converts trained PyTorch/ONNX models to optimized Jetson engines:

1. **Export to ONNX:** `torch.onnx.export(model, sample_input, 'model.onnx', opset_version=17)`

2. **TensorRT engine build:**
```python
import tensorrt as trt
builder = trt.Builder(logger)
config = builder.create_builder_config()
config.set_flag(trt.BuilderFlag.INT8)
config.int8_calibrator = BCRCalibrator(calibration_data)
network = builder.create_network(...)
engine = builder.build_serialized_network(network, config)
```

3. **Calibration dataset:** INT8 calibration requires a representative dataset of 500-1000 samples. Use robot telemetry from varied operational conditions including near-fault states to ensure the quantization range captures the full dynamic range.

4. **Layer fusion:** TensorRT automatically fuses sequential operations (Conv+BN+ReLU into a single kernel). Custom fusion patterns can be registered via TensorRT Plugin API for non-standard operations.

5. **Engine caching:** Save serialized engine to disk to avoid rebuild on each startup (rebuild takes 5-30 minutes for large models). Invalidate cache when GPU firmware or TensorRT version changes.

### CUDA Stream Priority Scheduling

For multi-model deployments on Jetson, priority-based scheduling ensures safety-critical models meet latency requirements:

```python
import ctypes
import tensorrt as trt

# Create high-priority CUDA stream for safety model
priority_range = cuda.Device(0).get_attribute(...)
high_priority_stream = cuda.Stream(priority=cuda.DEFAULT_STREAM_PRIORITY)
low_priority_stream = cuda.Stream(priority=cuda.DEFAULT_STREAM_PRIORITY - 1)

# Safety model inference on high-priority stream
with safety_context.execute_async_v3(stream_handle=high_priority_stream.handle):
    pass

# Background models on low-priority stream
with analytics_context.execute_async_v3(stream_handle=low_priority_stream.handle):
    pass
```

High-priority streams preempt lower-priority kernel execution at CUDA warp boundaries, ensuring the safety model's latency budget is protected.

### Thermal Management for Sustained Inference

Sustained inference on AGX Thor generates significant heat. Without adequate cooling, thermal throttling reduces clock speed and increases latency:

- Thermal threshold for throttling: 85C GPU junction temperature
- At 85C, GPU clock reduces from 1.3GHz to 800MHz — 38% latency increase
- Required cooling: active heatsink + fan rated for continuous power dissipation at maximum ambient temperature of deployment environment
- Thermal interface material: use Shin-Etsu X-23 or equivalent (thermal conductivity > 8 W/m-K)
- Fan sizing: calculate required airflow for ambient temperature — a facility at 40C ambient requires 30% more airflow than 25C ambient

Monitor junction temperature in production: `cat /sys/class/thermal/thermal_zone0/temp`

---

## Section 3: Platform Definition Authoring

### BCR Platform Module Standard

Every BCR-supported robot platform requires three documents in `certifications/platforms/{platform_name}/`:

**platform_module.md — platform specifications and communication topology:**
- Physical specs: height, weight, DOF count, speed, payload, price range
- Communication: bus type (CAN, UART, Ethernet, proprietary), topology, protocol
- ROS topics or SDK endpoints for all diagnostic signals
- BCR canonical signal ID mapping (see below)
- Known limitations and integration notes

**diagnostic_guide.md — step-by-step field diagnostics:**
- Boot LED sequence with timing and state interpretation
- Joint health check commands (exact command syntax, expected output, pass/fail criteria)
- IMU calibration verification: expected Z-axis = 9.81 +/- 0.1 m/s2
- Bus heartbeat verification (CAN heartbeat, SDK keepalive, or equivalent)
- TechMedix signal ID mapping with units, update rate, alert thresholds

**common_failures.md — top 10 failure modes:**
- For each failure: symptom, root cause, repair procedure, OEM part number, estimated repair time, required technician level

### BCR Canonical Signal ID Convention

All signals across all platforms use the format:
```
{platform}_{subsystem}_{signal_name}_{unit}
```

Examples:
- `g1_knee_left_torque_nm` — Unitree G1, left knee joint, torque in Newton-meters
- `spot_battery_charge_pct` — Boston Dynamics Spot, battery state of charge in percent
- `t50_nozzle_3_flow_lpm` — DJI Agras T50, nozzle 3 flow rate in liters per minute

Rules:
- Snake case only (no camelCase, no hyphens)
- SI units in the signal name suffix
- Platform prefix: g1, h1_2, spot, t50
- Subsystem: battery, knee_left, knee_right, hip_left, hip_right, ankle_left, ankle_right, head, torso, motor_{n}, nozzle_{n}

### Signal Metadata Requirements

Each signal documented in the platform module must include:
- Signal ID (BCR canonical format)
- Source: ROS topic name, CAN message ID, or SDK field path
- Unit: SI unit string
- Update rate: Hz or interval
- Normal range: min/max values for healthy operation
- Alert threshold P2: warning threshold
- Alert threshold P1: critical threshold requiring immediate action
- Latency: expected maximum delay from physical event to TechMedix dashboard

### Authoring Workflow for a New Platform

1. Obtain robot unit for documentation session (minimum 4 hours of access)
2. Capture boot sequence: video recording of LED states with timestamps
3. Instrument all accessible signals: log raw bus data for 30 minutes of operation
4. Map raw signals to BCR canonical IDs: create mapping table in Excel before writing markdown
5. Identify top failures: interview field technicians, review OEM service bulletins, inspect unit history records
6. Verify part numbers: locate physical labels on installed components; cross-reference OEM parts catalog
7. Peer review: have an L3 or L4 technician field-test the diagnostic guide on a second unit before publication

---

## Section 4: Industry Standards and Compliance

### Functional Safety — IEC 61508 and ISO 10218

**IEC 61508** defines Safety Integrity Levels (SIL) for electrical/electronic safety systems. SIL requirements drive design decisions for robot safety functions:

| SIL Level | PFD Range | Typical Application |
|---|---|---|
| SIL 1 | 10^-2 to 10^-1 | Low-consequence protection systems |
| SIL 2 | 10^-3 to 10^-2 | Robot emergency stop, safety barriers |
| SIL 3 | 10^-4 to 10^-3 | High-consequence industrial safety |
| SIL 4 | 10^-5 to 10^-4 | Nuclear, aerospace safety systems |

**ISO 10218-1** (robot safety) and its collaborative robot extension **ISO/TS 15066** define:
- Contact force limits by body region (hand: 65N transient, 25N quasi-static)
- Speed limits near humans (< 250mm/s in collaborative zones)
- Power and Force Limiting (PFL) control mode requirements
- Safety-rated monitoring functions (safety-rated stop, speed monitoring)

**EU AI Act (2024)** — high-risk classification for autonomous robots in shared human workspaces requires:
- Conformity assessment procedure and CE marking
- Registration in EU AI database
- Continuous risk management system
- Data governance documentation for training data
- Human oversight provisions (always-available override)
- Accuracy, robustness, and cybersecurity specifications

### Agricultural Drone Regulations

DJI Agras T50 operations in the US require:
- **FAA Part 107** Remote Pilot Certificate (all commercial UAS operations)
- **FAA Part 137** Agricultural Aircraft Operator Certificate (aerial chemical application)
- FIFRA compliance (EPA registration of applied pesticides)
- State-level pesticide applicator license (varies by state)
- Maintain spray records: date, location, product applied, rate, operator certificate number

### Data Compliance Frameworks

**GDPR (EU):** Robot location telemetry that can identify an individual's position or behavior may constitute personal data. Implement: data minimization (collect only necessary signals), retention limits (delete after defined period), right to erasure procedures.

**FDA 21 CFR Part 11 (food/pharma):** Electronic records and signatures must be: timestamped, attributed to the signing individual, audit-trailed with all changes, protected against alteration. TechMedix repair records in regulated industries must implement compliant e-signature workflow.

**FedRAMP Moderate (US federal):** Requires FedRAMP-authorized cloud services (AWS GovCloud, Azure Government), FIPS 140-2 cryptography, continuous monitoring, and 3PAO assessment.

---

## Section 5: Industry Leadership and Standards Contribution

### BCR's Role in Shaping Robot Field Service Standards

As the leading robot telemetry and field service platform, BCR has both opportunity and responsibility to shape industry standards:

**IEEE Robotics and Automation Society (RAS):** Working groups developing standards for robot data formats, field service protocols, and telemetry interoperability. L5 architects represent BCR with documented operational evidence.

**OGC SensorThings API and W3C SOSA/SSN:** IoT sensor data standards applicable to robot telemetry portability. BCR advocates for adopting these as the basis for robot telemetry data portability standards.

**ISO TC 299 (Robotics):** The ISO technical committee for robotics standards, developing ISO 10218, ISO 13482 (service robots), and emerging standards for humanoid robots.

### Authoring Position Papers

L5 architects contribute to industry discourse through position papers:
- Identify a gap: what does current practice get wrong, or what emerging technology needs a standard?
- Gather operational evidence: quantitative data from BCR deployments
- Propose a solution: specific, actionable recommendation
- Quantify the benefit: cost savings, safety improvement, efficiency gain
- Submit through industry channels: IEEE, ISO, professional associations

### Open Source Strategy

BCR's open-source telemetry normalization library creates ecosystem value:
- Apache 2.0 license: maximizes adoption by allowing commercial use
- Contribution governance: pull request review requirements, coding standards, CI/CD
- Long-term maintenance commitment: dedicated maintainer for 3+ years
- Adoption metrics: track platforms supported, downloads, GitHub stars, and enterprise integrations built on the library

### Mentoring Future L4/L5 Engineers

L5 architects identify and develop the next generation of systems engineers:
- Structured mentorship: weekly 1:1 with technical goal-setting and progress tracking
- Stretch assignments: give L4 engineers platform module authoring responsibilities under supervision
- Conference and publication opportunities: co-author papers, co-present at industry events
- Cross-functional exposure: rotate L4 engineers through product, sales engineering, and customer success for 90-day assignments to build business context
