# Medical Device Data Integration Guide

## Overview

This document describes how to integrate medical-grade surgical robots (like the J&J Ottava) into the TechMedix telemetry and database system. It covers the existing standards landscape, the adapter pattern, and the concrete mapping from vendor-specific data to the canonical TechMedix schema.

## Standards Landscape

### IEEE 11073 SDC (Service-oriented Device Connectivity)
- **What it is**: The emerging standard for OR device-to-device communication
- **Status**: Ottava plans to support this in future firmware
- **Key standard**: ISO/IEEE 11073-10207 (Domain Information and Service Model)
- **Data model**: Hierarchical — 4 levels (MDC, Channel, Metric, MetricReport)
- **Transport**: Web Services (IEEE 11073-20702) + SOA protocol binding (11073-20701)

### HL7 FHIR (Fast Healthcare Interoperability Resources)
- **What it is**: Web-based API standard for healthcare data exchange
- **Status**: Ottava plans to support this for EHR integration
- **Key resources**: `Observation`, `Device`, `DeviceUseStatement`, `Procedure`
- **Transport**: RESTful HTTP with JSON/XML

### dVRK Research Interface (Reference Implementation)
- **What it is**: Open API for da Vinci surgical robot research data
- **Status**: Live, deployed at ~40 institutions
- **Data streams**: Kinematic (joint position/velocity/torque), user events (button/pedal), video
- **Transport**: TCP/IP Ethernet stream
- **GitHub**: https://github.com/jhu-dvrk

## Adapter Pattern

The TechMedix system uses a 3-layer adapter pattern:

```
┌─────────────────────────────────────────────────────────┐
│  Vendor Data Source                                     │
│  (J&J Telemetry API, dVRK, IEEE 11073 SDC, HL7 FHIR)  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  Adapter Layer                                          │
│  (medical_device_adapters table)                        │
│  Maps vendor signals → canonical TechMedix fields       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  Canonical Storage                                      │
│  (medical_telemetry table + robots table extensions)    │
└─────────────────────────────────────────────────────────┘
```

## Data Mapping: dVRK → TechMedix

The da Vinci Research Interface (dVRI) provides a proven model for surgical robot telemetry. Here's how its data maps to TechMedix:

| dVRK/dVRI Signal | TechMedix Field | Unit | Notes |
|---|---|---|---|
| `joint_position[i]` | `joint_position_error_mm` | mm | Per-joint position deviation |
| `joint_velocity[i]` | (derived) | rad/s | Used for wear analysis |
| `joint_torque[i]` | `arm_joint_torque` | Nm | Primary actuator health signal |
| `master_position[i]` | `console_master_input_latency` | ms | Surgeon console responsiveness |
| `pedal_state` | (event log) | bool | User input events |
| `button_state` | (event log) | bool | User input events |
| `system_uptime` | `system_operational_hours` | hours | Maintenance scheduling |

## Data Mapping: IEEE 11073 SDC → TechMedix

IEEE 11073 SDC uses a hierarchical model. Here's the mapping:

| IEEE 11073 SDC Path | TechMedix Field | Unit |
|---|---|---|
| `/MDC/Channel/PhysicalCircuit/ChannelMCCounter` | `instrument_usage_count` | count |
| `/MDC/Channel/ForceSensor/Metric` | `instrument_force` | N |
| `/MDC/Channel/PositionEncoder/Metric` | `cart_position_error` | mm |
| `/MDC/Channel/Temperature/Metric` | `motor_temp_c` | °C |
| `/MDC/Channel/Battery/Metric` | `battery_pct` | % |

## Data Mapping: HL7 FHIR → TechMedix

For EHR integration via FHIR:

| FHIR Resource | FHIR Field | TechMedix Field |
|---|---|---|
| `Observation` | `valueQuantity.value` | `signal_value` |
| `Observation` | `valueQuantity.unit` | `unit` |
| `Observation` | `effectiveDateTime` | `timestamp` |
| `Device` | `identifier.value` | `robot_id` |
| `DeviceUseStatement` | `deviceReference` | `robot_id` |

## Existing TechMedix Schema Extensions

The migration `20260722000000_medical_telemetry.sql` adds:

### `medical_telemetry` table
Stores high-frequency medical device signals with medical semantics:
- `signal_name`: Canonical signal name (e.g., `arm_joint_torque`)
- `signal_value`: Numeric value
- `unit`: Engineering unit (e.g., `Nm`, `N`, `mm`)
- `severity`: `info`, `warning`, `critical`
- `source_device`: Which device/subsystem produced the signal
- `raw_payload`: Full JSON payload for audit/debug

### `robots` table extensions
- `medical_device_id`: FDA device identifier
- `medical_certification`: Certification status (e.g., `FDA Class 2`)
- `sterilization_cycle_count`: Track autoclave cycles
- `last_sterilization_at`: Timestamp of last sterilization
- `instrument_usage`: JSON map of instrument serial → usage count

### `medical_device_protocols` table
Tracks which standards each platform supports:
- `protocol_name`: `IEEE 11073 SDC`, `HL7 FHIR`, `J&J MedTech Telemetry API`
- `endpoint`: Connection endpoint
- `auth_required`: Whether authentication is needed

### `medical_device_adapters` table
Stores the mapping configuration between vendor formats and TechMedix canonical fields.

## Getting Data Into TechMedix

### Step 1: Register the platform
The Ottava platform definition is at:
`blackcat-os/blackcat/platforms/jnj_ottava.json`

This follows the [Platform Definition Schema](platform-definition-schema.md) and includes:
- Actuator definitions (4 patient cart arms)
- Sensor definitions (force sensors, encoders, cameras)
- Communication protocols (J&J Telemetry API, planned IEEE 11073 SDC, planned HL7 FHIR)
- Telemetry map with thresholds
- Diagnostic rules
- FMEA summary with RPN scores
- Maintenance schedule

### Step 2: Register failure modes
The seed file `supabase/seed_knowledge_ottava.sql` adds 4 failure modes with:
- Repair protocols (step-by-step, with tools and parts)
- Predictive signals (with thresholds and lead times)
- Confidence scores and source URLs

### Step 3: Ingest telemetry
Once Ottava is on the market and you have access to its telemetry API, create an ingestion script that:

1. Connects to the J&J MedTech Telemetry API (or IEEE 11073 SDC endpoint when available)
2. Reads the signal mapping from `medical_device_adapters`
3. Transforms vendor signals to canonical TechMedix fields
4. Writes to `medical_telemetry` with appropriate severity flags
5. Triggers diagnostic rules from `diagnostic_rules` in the platform JSON

### Step 4: Run diagnostics
The existing 3-layer diagnostic pipeline (`diagnostic_results` table) can consume medical telemetry:
- **Layer 1**: Threshold violations (from `telemetry_map` thresholds)
- **Layer 2**: Anomaly detection (statistical deviation from baseline)
- **Layer 3**: Claude analysis (LLM-powered root cause analysis)

## Ready-to-Use Tech

### dVRK (da Vinci Research Kit)
- **Status**: Open source, deployed at 40+ institutions
- **GitHub**: https://github.com/jhu-dvrk
- **Data**: Kinematic + user event data via TCP/IP
- **Use**: Can be used NOW to develop and test your medical telemetry pipeline
- **Integration**: The dVRK Python API (`dvrk_python`) provides ROS-based access to joint states, forces, and master inputs

### IEEE 11073 SDC
- **Status**: Published standard, emerging adoption in OR
- **Use**: When Ottava supports it, your adapter can consume SDC data directly
- **Libraries**: Python `pySDC` implementations exist for research

### HL7 FHIR
- **Status**: Widely adopted in healthcare
- **Use**: For EHR integration and regulatory compliance
- **Libraries**: `fhirclient` Python library, HAPI FHIR Java

## Action Items

1. **✅ Done**: Platform definition JSON created (`jnj_ottava.json`)
2. **✅ Done**: Database migration for medical telemetry tables
3. **✅ Done**: Failure mode seed data with repair protocols
4. **✅ Done**: Adapter mapping configuration
5. **TODO**: Build ingestion script (wait for Ottava API access)
6. **TODO**: Test with dVRK research kit to validate pipeline
7. **TODO**: Add IEEE 11073 SDC adapter when Ottava supports it
8. **TODO**: Add HL7 FHIR adapter for EHR integration
