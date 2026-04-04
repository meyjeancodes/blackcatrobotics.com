# CAN Bus Primer for Robot Technicians

Reference guide covering physical layer, frame structure, CANopen protocol, candump format, and common faults. Required reading for L2+ certification.

---

## Physical Layer

CAN (Controller Area Network) uses a differential two-wire bus for robust communication in electrically noisy environments.

### Wiring

- **CAN-H** (High) and **CAN-L** (Low) — the two signal conductors
- **Common ground** — required between all nodes
- **Twisted pair cable** — 120-ohm characteristic impedance, 24-26 AWG

### Voltage Levels

| State | CAN-H | CAN-L | Differential (CAN-H - CAN-L) |
|---|---|---|---|
| Recessive (logic 1) | 2.5V | 2.5V | 0V |
| Dominant (logic 0) | 3.5V | 1.5V | +2.0V |

The dominant state wins in bus arbitration — a node transmitting dominant suppresses any simultaneously-transmitted recessive bit.

### Termination

Standard CAN bus requires 120-ohm termination resistors at each physical end of the bus:
- Two 120-ohm resistors in parallel = 60 ohms total differential impedance
- Measure termination resistance across CAN-H and CAN-L with the bus powered off
- Expected measurement: 55-65 ohms

Incorrect termination symptoms:
- < 55 ohm: extra terminator present (over-terminated) — reduces signal amplitude, increases recessive level
- > 65 ohm: missing or failed terminator (under-terminated) — signal reflections corrupt frames

### Bitrates

| Bitrate | Max Bus Length | Typical Application |
|---|---|---|
| 125 kbps | 500m | Legacy industrial |
| 250 kbps | 250m | Low-speed robot joints |
| 500 kbps | 100m | Standard robot joints |
| 1 Mbps | 40m | High-performance robot joints (G1, H1-2) |

---

## CAN Frame Structure

A standard CAN data frame (CAN 2.0A, 11-bit identifier):

```
| SOF | ID (11 bits) | RTR | IDE | r0 | DLC (4 bits) | Data (0-8 bytes) | CRC (15 bits) | CRC Del | ACK | ACK Del | EOF | IFS |
```

| Field | Bits | Description |
|---|---|---|
| SOF (Start of Frame) | 1 | Dominant bit marking frame start — all nodes sync here |
| ID (Identifier) | 11 | Message priority and type — lower numeric value = higher priority |
| RTR (Remote Transmission Request) | 1 | 0=data frame, 1=remote frame (request data from node) |
| IDE (Identifier Extension) | 1 | 0=standard frame (11-bit ID), 1=extended frame (29-bit ID) |
| r0 (Reserved) | 1 | Must be dominant (0) |
| DLC (Data Length Code) | 4 | Number of data bytes: 0-8 |
| Data | 0-8 bytes | Payload — content determined by higher-layer protocol |
| CRC (Cyclic Redundancy Check) | 15 | Error detection — computed over SOF through data |
| CRC Delimiter | 1 | Recessive — end of CRC |
| ACK | 1 | Transmitter sends recessive; receivers overwrite with dominant to acknowledge |
| ACK Delimiter | 1 | Recessive |
| EOF (End of Frame) | 7 | Seven consecutive recessive bits |
| IFS (Interframe Space) | 3 | Minimum gap before next frame |

---

## CANopen Protocol

CANopen (CAN application layer standard CiA 301) is used by most robot actuators.

### NMT — Network Management

NMT commands control node states:

| Message ID | Description |
|---|---|
| 0x000 | NMT master broadcast (all nodes) |
| 0x000 + NodeID | NMT command to specific node |

NMT command bytes:
- 0x01 = Start (operational)
- 0x02 = Stop
- 0x80 = Pre-operational
- 0x81 = Reset node
- 0x82 = Reset communication

Example: `cansend can0 000#0101` — send Start command to node ID 0x01.

### PDO — Process Data Objects

PDOs carry real-time process data (joint positions, velocities, torques).

**Transmit PDO (TPDO) — robot publishing sensor data:**
- ID range: 0x181 + NodeID (e.g., node 0x05 publishes TPDO at 0x185)
- Data: joint state payload (format defined in node Object Dictionary)
- Published at configured rate (typically 1ms to 20ms intervals)

**Receive PDO (RPDO) — sending commands to robot:**
- ID range: 0x201 + NodeID (e.g., send commands to node 0x05 at 0x205)
- Data: control setpoint (position, velocity, or torque command)

### SDO — Service Data Objects

SDOs provide read/write access to node parameters (Object Dictionary entries).

- SDO Request to node: ID = 0x600 + NodeID
- SDO Response from node: ID = 0x580 + NodeID
- Read request: byte 0 = 0x40, bytes 1-2 = Object Index, byte 3 = Subindex
- Write request: byte 0 = 0x23 (4-byte write) or 0x27 (2-byte) or 0x2F (1-byte)

### Heartbeat

CANopen heartbeat messages indicate node health:

- ID: 0x700 + NodeID
- Payload: 1 byte (node state: 0x00=boot, 0x04=stopped, 0x05=operational, 0x7F=pre-op)
- Period: configured in Object Dictionary index 0x1017 (typically 1000ms = 1 Hz)

Expected heartbeat IDs in the G1 lower body on can0:
- 0x701 through 0x70C (nodes 1-12)

---

## candump Format

The `candump` tool on Linux displays CAN bus traffic:

```
1711234567.123456  can0  185#DEADBEEF01020304
```

| Field | Example | Meaning |
|---|---|---|
| Timestamp | 1711234567.123456 | Unix timestamp with microsecond precision |
| Interface | can0 | CAN interface name |
| ID | 185 | Message arbitration ID (hexadecimal) |
| # | # | Separator |
| Data | DEADBEEF01020304 | Payload bytes in hexadecimal |

### Useful candump Commands

```bash
# Log all messages on can0 to terminal
candump can0

# Log to file with timestamps
candump -l can0 > /tmp/can0_log.txt

# Filter by message ID (show only PDO transmit messages 0x181-0x1FF)
candump can0 | grep -E "^.* can0  1[89A-F][0-9A-F]#"

# Show only heartbeat messages
candump can0 | grep -E "^.* can0  7[0-9A-F][0-9A-F]#"

# Send a single CAN frame
cansend can0 205#0102030405060708

# Show bus statistics (error counts)
ip -details link show can0
```

### ERRORFRAME

When `candump` outputs `ERRORFRAME` without payload data:
```
1711234567.123456  can0  20000004#0000000000000000
```
This indicates a bus error detected by the interface. The error frame byte indicates the error type (bit error, stuff error, CRC error, form error, or acknowledgment error). Frequent ERRORFRAME entries indicate a physical layer problem — check termination and cable integrity first.

---

## Common CAN Bus Faults

| Fault | Symptom | Cause | Diagnostic | Fix |
|---|---|---|---|---|
| Missing terminator | High error rate, frames corrupted, ERRORFRAME in candump | One 120-ohm terminator absent or failed | Measure resistance across CAN-H and CAN-L with bus off. > 65 ohm confirms missing terminator | Add 120-ohm terminator at the open bus end |
| Extra terminator | High error rate, reduced signal amplitude | Extra terminator added incorrectly | Resistance < 55 ohm with bus off | Locate and remove extra terminator |
| Ground loop | Intermittent errors, errors correlated with equipment on/off | Two nodes with different ground potentials | Measure ground potential difference between node chassis | Add CAN bus isolation or consolidate grounds |
| Node bus-off | Node stops transmitting; heartbeat absent | Node accumulated too many transmit errors and entered bus-off state | candump shows no heartbeat for that node ID | Send NMT Reset Node command: `cansend can0 000#8201` (for node 1) |
| Wrong bitrate | No communication at all | Node configured at different bitrate than others | Try connecting at different bitrate | Configure all nodes to the same bitrate |
| Cable damage | Intermittent errors, worse when cable is flexed | Shield break or conductor damage in flex zone | Visually inspect cable, flex while monitoring error rate | Replace cable section |
| Wiring short | Constant dominant state, no communication | CAN-H shorted to CAN-L or to ground | Disconnect nodes one at a time until short is isolated | Repair or replace the shorted wire |
