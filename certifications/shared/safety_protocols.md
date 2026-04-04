# Safety Protocols for Robot Field Service

Required reading and compliance for all BCR field technicians. These protocols apply to all robot platforms unless a platform-specific protocol overrides them. L1 certification requires demonstrated competency in all Level 1 protocols.

---

## Lockout/Tagout (LOTO) for Robot Service

LOTO prevents unexpected robot energization during maintenance. Required before any internal maintenance, connector disconnection, or component replacement.

### BCR LOTO Sequence

1. **Notify the operator** that the robot is being taken out of service. Document in TechMedix.
2. **Command the robot to a safe rest position** — sitting or prone, away from edges and overhead hazards.
3. **Shut down software first** — issue shutdown command via SDK or dashboard before cutting power. This allows the robot to park joints safely.
4. **Disconnect the main battery** — follow the platform-specific sequence (typically negative terminal first). For robots with battery covers, use the lock tab — do not pry.
5. **Apply lockout device** — physical lock on the battery compartment or power switch, preventing reconnection.
6. **Apply tag** — attach BCR LOTO tag with: technician name, date, time, work order number.
7. **Verify energy dissipation** — wait 2 minutes after battery disconnect before touching internal components. Capacitors retain charge.
8. **Test for zero energy** — attempt to power on (button or command) — robot should not respond.

### LOTO Release Sequence

1. Ensure all tools and components are clear of the robot.
2. Verify all connectors are properly seated.
3. Remove LOTO tag and lock.
4. Reconnect battery in reverse order (positive terminal first for most platforms).
5. Boot the robot and run post-repair validation before returning to service.
6. Notify operator and update TechMedix work order.

---

## Exclusion Zone Guidelines

Maintain exclusion zones during powered robot operation:

| Robot | Standing Operation | Walking Operation | High-Speed Operation |
|---|---|---|---|
| Unitree G1 | 0.5m radius | 1.5m radius | 2.0m radius |
| Unitree H1-2 | 1.0m radius | 2.0m radius | 3.0m radius |
| Boston Dynamics Spot | 0.5m radius | 1.5m radius | 2.0m radius |
| DJI Agras T50 | 5.0m radius | 15m radius (spray range) | Maintain 15m during flight |

The exclusion zone is measured from the robot's nearest surface, not its center. Bystanders must be outside the exclusion zone at all times during active operation.

For manipulation tasks (H1-2 carrying payload): add the payload radius to the exclusion zone.

---

## Personal Protective Equipment (PPE)

### Minimum PPE for All Robot Service

- Safety glasses (ANSI Z87.1 rated)
- Steel-toed boots (ASTM F2413)
- No loose clothing or jewelry (entanglement hazard)

### Additional PPE by Task

| Task | Additional PPE |
|---|---|
| Battery service (any platform) | Nitrile gloves (chemical resistance), splash goggles |
| DJI Agras T50 spray system | Chemical-resistant gloves, face shield, respirator (N95 minimum), apron |
| High-voltage work (power boards) | Insulated gloves rated 1,000V minimum |
| CAN bus connector work in powered state | ESD wrist strap, ESD mat |
| Propeller inspection (T50) | Cut-resistant gloves |

---

## Emergency Procedures

### Robot Uncommanded Movement

If a robot begins moving unexpectedly during maintenance:

1. **Do not attempt to physically restrain the robot** — you will not win against actuator forces.
2. **Move away from the robot immediately** — clear the exclusion zone.
3. **Engage the hardware e-stop** if reachable without entering the exclusion zone.
4. **Cut power** — disconnect power if the e-stop is not accessible and the robot is not near an edge.
5. **Report** the incident to BCR operations immediately. Complete an incident report in TechMedix.

### Battery Fire

Lithium-ion and LiPo battery fires are difficult to extinguish and produce toxic gases.

1. **Do not use water on a lithium battery fire** — water reacts with lithium to produce hydrogen gas.
2. **Use Class D fire extinguisher** or dry sand to smother flames.
3. **Evacuate the area** — burning lithium batteries produce toxic fluoride compounds.
4. **Call emergency services** if fire is not immediately contained.
5. **If battery is smoking but not burning** — move it outdoors using heat-resistant gloves, place in a fireproof container.

### Chemical Spill (DJI Agras T50)

1. **Evacuate personnel** from the spill area immediately.
2. **Identify the chemical** from the label or Safety Data Sheet (SDS) — required to be on-site for all chemicals used.
3. **Don PPE** as specified on the SDS before approaching the spill.
4. **Contain the spill** using absorbent material specified on the SDS.
5. **Dispose of contaminated material** according to local regulations — never pour agricultural chemicals down drains.
6. **Report the spill** per local environmental regulations and document in TechMedix.

---

## Documentation Requirements

All field service activities must be documented in TechMedix before leaving the site:

- Work order: pre-repair observations, fault codes, robot ID
- Repair: components replaced with part numbers, torque values applied, any deviations from procedure
- Post-repair validation: specific test results with pass/fail status
- Signature: technician name and certification level

Incomplete documentation = incomplete work order. Work orders without post-repair validation data cannot be closed.
