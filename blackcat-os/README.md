# BlackCat OS

Open source robotics platform intelligence layer by BlackCat Robotics.

BlackCat OS is a five-stage signal analysis pipeline that ingests raw data from robot interfaces (CAN bus, ROS 2, serial, network), fingerprints protocols, maps hardware components, runs FMEA analysis, and generates structured TechMedix-compatible platform definitions.

## Features

- CAN bus signal capture and CANopen protocol classification
- Hardware component detection from PDO signal topology
- FMEA table generation for each detected component (LLM-assisted or heuristic fallback)
- TechMedix PlatformDefinition output (JSON, diagnostic rules, maintenance schedules)
- Pre-built platform definitions for Unitree G1 and Unitree H1-2
- Fully offline-capable with graceful degradation when tools are unavailable

## Requirements

- Python 3.11 or 3.12
- Optional: `candump` / `python-can` for live CAN capture
- Optional: `ros2` for ROS 2 bag recording
- Optional: `tcpdump` / `nmap` / `tshark` for network analysis
- Optional: Anthropic API key for LLM-assisted FMEA and schema generation

## Installation

```bash
git clone https://github.com/meyjeancodes/blackcatrobotics-os.git
cd blackcat-os
pip install -e ".[dev]"
```

## Usage

```bash
# Copy and edit the example config
cp blackcat.toml.example blackcat.toml

# Set your Anthropic API key (never hardcode it)
export ANTHROPIC_API_KEY="sk-..."

# Run the full pipeline
blackcat run --config blackcat.toml

# Run only a specific stage
blackcat run --config blackcat.toml --stage 2

# List known platform definitions
blackcat platforms list

# Show a platform definition
blackcat platforms show unitree_g1
```

## Pipeline Stages

| Stage | Name | Description |
| --- | --- | --- |
| 1 | Signal Ingestion | Enumerate interfaces, capture CAN, network, and ROS 2 data |
| 2 | Protocol Fingerprinting | Parse candump logs, classify CANopen IDs, detect network protocols |
| 3 | Hardware Mapping | Detect actuators, sensors, compute board; build directed hardware graph |
| 4 | FMEA Analysis | Generate failure mode tables per component via LLM or heuristic fallback |
| 5 | Output Generation | Write platform definition JSON, diagnostic rules, and maintenance schedule |

## Configuration

Copy `blackcat.toml.example` to `blackcat.toml` and adjust:

```toml
[blackcat]
robot_target = "192.168.1.100"
output_dir = "/tmp/blackcat/output"
recon_dir = "/tmp/blackcat/recon"
capture_duration_seconds = 60

[anthropic]
model = "claude-sonnet-4-20250514"
max_tokens = 4096

[pipeline]
skip_stages = []
verbose = false
```

The API key is always read from `ANTHROPIC_API_KEY` environment variable. It is never read from the config file.

## Platform Definitions

Known platform definitions live in `blackcat/platforms/`. Each file is a TechMedix-compatible JSON document. See `docs/platform-definition-schema.md` for the full schema.

Current platforms:
- `unitree_g1.json` — Unitree G1 humanoid robot
- `unitree_h1_2.json` — Unitree H1-2 humanoid robot

To add a new platform, create a new JSON file following the schema and submit a pull request.

## Running Tests

```bash
pytest tests/ -v
```

## Contributing Platforms

See `blackcat/platforms/README.md` and `docs/platform-definition-schema.md`.

## License

MIT License. See LICENSE file.
