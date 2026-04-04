# BlackCat Robotics — Technician Certification Program

The BCR certification program qualifies field technicians to service humanoid robots, drones, and
autonomous platforms monitored by TechMedix. Five levels from entry operator to autonomous architect.

## Certification Levels

| Level | Title | Job Value Range | Prerequisites |
|---|---|---|---|
| L1 | Operator | $280 - $350 / job | None |
| L2 | Technician | $450 - $650 / job | L1 |
| L3 | Specialist | $800 - $1,100 / job | L2 + 6 months field |
| L4 | Systems Engineer | $1,200 - $1,800 / job | L3 + 12 months multi-platform |
| L5 | Autonomous Architect | $2,500+ / job | L4 + enterprise project lead |

## How to Study

1. Read `levels/L<N>_<title>/README.md` for your target level.
2. Work through `curriculum.md` — five sections, each 400-600 words.
3. Complete `lab_exercises.md` with an assessor present for sign-offs.
4. Run the CLI quiz: `python cli/quiz.py quiz --level L1 --randomize`
5. Pass written (see `assessment/passing_score.json`) and practical.
6. Submit results to your fleet operator or BCR admin for TechMedix dispatch eligibility.

## CLI Quiz Engine

```bash
cd certifications/

# Show all levels and job values
python cli/quiz.py levels

# Take L1 written exam (randomized question order)
python cli/quiz.py quiz --level L1 --randomize

# Filter to one domain
python cli/quiz.py quiz --level L2 --domain actuators

# View your progress across all levels
python cli/quiz.py progress
```

History is saved to `~/.blackcat/quiz_history.json`.

## Platform Modules

After L2, add platform-specific certifications:

- `platforms/unitree_g1/` — Unitree G1: 130cm, 35kg, 43 DOF
- `platforms/unitree_h1_2/` — Unitree H1-2: 180cm, 70kg, 31 DOF
- `platforms/boston_dynamics_spot/` — BD Spot: 32.5kg, IP54, 14kg payload
- `platforms/dji_agras_t50/` — DJI Agras T50: 40kg payload, 40L tank

## Shared Reference Docs

- `shared/safety_protocols.md` — Full robotics safety protocols
- `shared/can_bus_primer.md` — CAN bus physical layer, CANopen, candump
- `shared/signal_theory.md` — Nyquist, FFT, bearing defect frequency
- `shared/ros2_primer.md` — ROS 2 essentials for technicians
- `shared/fmea_methodology.md` — FMEA, RPN, TechMedix escalation
- `shared/tools_reference.md` — Complete tool list with specs
- `shared/glossary.md` — 50+ term glossary

## Built By

BlackCat Robotics — https://blackcatrobotics.com
TechMedix — field service platform for robot fleets
