# TechMedix — HuggingFace Findings

_Latest researched:_ 2026-05-30  
_Focus:_ repair + diagnostics + predictive maintenance assets relevant to micromobility, drones, and ground robots

## Strict curation rule
Only include a dataset/model if it directly supports repair diagnostics, anomaly detection, or predictive maintenance for vehicles/robots. Avoid repos merely discovered on HF without a clear use path.

## Verified candidate datasets

- `aykutkabaoglu/uav-flight-anomaly-dataset`
  - Repo: https://huggingface.co/datasets/aykutkabaoglu/uav-flight-anomaly-dataset
  - Summary: 1,396 categorized real-world UAV flight logs, 52.4 hours, naturally occurring anomalies, no synthetic fault injection.
  - License: CC BY 4.0
  - TechMedix relevance: High. Directly transferable to scooter motor/BMS telemetry anomaly detection and fault isolation.
  - Notes: Requires preprocessing via the companion annotation toolbox. Prefer as a baseline for flight/log-domain anomaly modeling before scooter-specific fine-tuning.
  - Action: download and parse `ulog` logs into CSVs; map state-estimation anomalies to scooter motor current, voltage, and temperature signatures.

- `ibm-research/AssetOpsBench`
  - Repo: https://huggingface.co/datasets/ibm-research/AssetOpsBench
  - Summary: 152 scenario rows across industrial asset-maintenance subsets; QA, forecasting, and tool-learning tasks.
  - License: Apache-2.0
  - TechMedix relevance: Medium-High. Useful for building maintenance QA workflows, asset diagnostics reasoning, and structured repair planning.
  - Notes: Small curated set. Best suited to evaluate LLM reasoning on maintenance documents rather than raw anomaly detection.

- `Reviewerly/exHarmony`
  - Repo: https://huggingface.co/datasets/Reviewerly/exHarmony
  - Summary: Drone Log Anomaly dataset. Exact schema/size pending direct extraction.
  - TechMedix relevance: High. Drone flight logs map naturally to scooter/AMR controller and telemetry logs.

- `chkmie/uav-resilience-bench`
  - Repo: https://huggingface.co/datasets/chkmie/uav-resilience-bench
  - Summary: UAV resilience benchmark. Direct extraction pending.
  - TechMedix relevance: Medium-High. Resilience scenarios can inform fault-recovery policy evaluation.

- `mindweave/iot-sensor-telemetry`
  - Repo: https://huggingface.co/datasets/mindweave/iot-sensor-telemetry
  - Summary: IoT sensor telemetry. Direct extraction pending.
  - TechMedix relevance: Medium. Generic telemetry format may still inform ingestion and normalization schema.

- `davidfertube/turbine-anomaly-detector`
  - Repo: https://huggingface.co/datasets/davidfertube/turbine-anomaly-detector
  - Summary: Industrial turbine anomaly detection. Direct extraction pending.
  - TechMedix relevance: Medium. Good reference model for vibration/thermal anomaly patterns.

- `ishitawarke/predictive_maintenance`
  - Repo: https://huggingface.co/ishitawarke/predictive_maintenance
  - Last updated: 2025-05-08.
  - TechMedix relevance: Medium. Confirm schema before using. Likely time-series + failure label format.
  - Action: inspect README and file list.

- `MohammedSohail/predictive-maintenance-dataset`
  - Repo: https://huggingface.co/datasets/MohammedSohail/predictive-maintenance-dataset
  - Summary: Engine sensors X6; small classification baseline.
  - TechMedix relevance: Low-Medium. Useful as a training scaffold only.

## Academic primary sources

- **RLIFE: Remaining Lifespan Prediction for E-scooters** — usage + status → remaining lifespan  
  Primary source: https://par.nsf.gov/servlets/purl/10560392

- **Predictive Maintenance Of Scooters** — battery, motor, mileage, temperature monitoring  
  Primary source: https://rjpn.org/jetnr/papers/JETNR2411017.pdf

- **FMEA Analysis for Scooter Design** — seven failure modes  
  Primary source: https://www.scribd.com/document/393039682/ff

- **In-Depth Investigation of E-Scooter Performance** — tyre, brake, wheel-guard, lighting  
  Primary source: https://www.trl.co.uk/uploads/trl/documents/ACA104---In-Depth-Investigation-of-E-Scooter-Performance.pdf

## Local context and next actions

- Local research artifacts live under:
  - `TechMedix-standalone/supabase/hf_scooter_findings.md` (this file)
  - `TechMedix-standalone/scripts/research-data/*.json`
  - `TechMedix-standalone/research/*.md`

- Recommended next steps:
  - Convert `UAV-SEAD` logs to scooter-like telemetry schema.
  - Use `AssetOpsBench` to benchmark diagnostic QA workflows.
  - Inspect `Reviewerly/exHarmony` and `chkmie/uav-resilience-bench` for direct reuse in anomaly detection pipelines.
  - Keep this file as the canonical curated source for HF research.
