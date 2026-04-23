-- ═══════════════════════════════════════════════════════════════════════════════
-- TechMedix LMS Phase 1 — Migration 20260409
-- Learning content system, progress tracking, seed data
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Profiles (extends auth.users) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  role        text        not null default 'technician'
              check (role in ('technician', 'admin', 'instructor')),
  xp          integer     not null default 0,
  level       integer     not null default 1,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── LMS Modules ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_modules (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,
  description     text,
  level_required  integer     not null default 1,
  order_index     integer     not null default 0,
  status          text        not null default 'published'
                  check (status in ('draft', 'published', 'archived')),
  created_at      timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_lms_modules_order ON lms_modules(order_index);

-- ── LMS Lessons ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_lessons (
  id                  uuid        primary key default gen_random_uuid(),
  module_id           uuid        not null references lms_modules(id) on delete cascade,
  title               text        not null,
  order_index         integer     not null default 0,
  estimated_minutes   integer     not null default 10,
  status              text        not null default 'published'
                      check (status in ('draft', 'published', 'archived')),
  created_at          timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_lms_lessons_module ON lms_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lms_lessons_order  ON lms_lessons(module_id, order_index);

-- ── Lesson Content Blocks ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_lesson_content (
  id              uuid        primary key default gen_random_uuid(),
  lesson_id       uuid        not null references lms_lessons(id) on delete cascade,
  content_type    text        not null check (content_type in ('text','image','code','video')),
  content         jsonb       not null default '{}',
  order_index     integer     not null default 0
);

CREATE INDEX IF NOT EXISTS idx_lms_content_lesson ON lms_lesson_content(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lms_content_order  ON lms_lesson_content(lesson_id, order_index);

-- ── Progress Tracking ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_progress (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  lesson_id       uuid        not null references lms_lessons(id) on delete cascade,
  module_id       uuid        not null references lms_modules(id) on delete cascade,
  status          text        not null default 'not_started'
                  check (status in ('not_started','in_progress','completed')),
  score           integer,
  started_at      timestamptz,
  completed_at    timestamptz,
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lms_progress_user   ON lms_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lms_progress_module ON lms_progress(user_id, module_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_modules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_lessons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_lesson_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_progress      ENABLE ROW LEVEL SECURITY;

-- Helper: check admin role
CREATE OR REPLACE FUNCTION is_lms_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- profiles
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_lms_admin());
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (id = auth.uid() OR is_lms_admin());

-- lms_modules: authenticated users read published; admin does all
CREATE POLICY "lms_modules_read" ON lms_modules
  FOR SELECT USING (auth.uid() IS NOT NULL AND (status = 'published' OR is_lms_admin()));
CREATE POLICY "lms_modules_admin" ON lms_modules
  FOR ALL USING (is_lms_admin());

-- lms_lessons: same pattern
CREATE POLICY "lms_lessons_read" ON lms_lessons
  FOR SELECT USING (auth.uid() IS NOT NULL AND (status = 'published' OR is_lms_admin()));
CREATE POLICY "lms_lessons_admin" ON lms_lessons
  FOR ALL USING (is_lms_admin());

-- lms_lesson_content: any authenticated user reads
CREATE POLICY "lms_content_read" ON lms_lesson_content
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "lms_content_admin" ON lms_lesson_content
  FOR ALL USING (is_lms_admin());

-- lms_progress: users own their rows; admin sees all
CREATE POLICY "lms_progress_select" ON lms_progress
  FOR SELECT USING (user_id = auth.uid() OR is_lms_admin());
CREATE POLICY "lms_progress_insert" ON lms_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "lms_progress_update" ON lms_progress
  FOR UPDATE USING (user_id = auth.uid() OR is_lms_admin());

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA — Level 1: Foundations Technician
-- ═══════════════════════════════════════════════════════════════════════════════

-- Modules
INSERT INTO lms_modules (id, title, description, level_required, order_index, status)
VALUES
  ('a1000001-0000-0000-0000-000000000001',
   'Basic Electronics',
   'Fundamental electrical theory every robotics technician must master before touching any hardware.',
   1, 1, 'published'),
  ('a1000001-0000-0000-0000-000000000002',
   'Safety Procedures',
   'ESD protection, tool safety, and lab protocols that prevent equipment damage and personal injury.',
   1, 2, 'published'),
  ('a1000001-0000-0000-0000-000000000003',
   'Device Anatomy',
   'Physical structure and subsystems of drones, rovers, and autonomous mobile platforms.',
   1, 3, 'published'),
  ('a1000001-0000-0000-0000-000000000004',
   'Basic Diagnostics',
   'Systematic inspection and measurement techniques for identifying faults in robotic systems.',
   1, 4, 'published')
ON CONFLICT (id) DO NOTHING;

-- ── Module 1 Lessons ──────────────────────────────────────────────────────────
INSERT INTO lms_lessons (id, module_id, title, order_index, estimated_minutes, status)
VALUES
  ('b1000001-0000-0000-0000-000000000001',
   'a1000001-0000-0000-0000-000000000001',
   'Voltage, Current, and Resistance', 1, 15, 'published'),
  ('b1000001-0000-0000-0000-000000000002',
   'a1000001-0000-0000-0000-000000000001',
   'Reading Schematics', 2, 20, 'published'),
  ('b1000001-0000-0000-0000-000000000003',
   'a1000001-0000-0000-0000-000000000001',
   'Common Components', 3, 15, 'published')
ON CONFLICT (id) DO NOTHING;

-- ── Module 2 Lessons ──────────────────────────────────────────────────────────
INSERT INTO lms_lessons (id, module_id, title, order_index, estimated_minutes, status)
VALUES
  ('b1000001-0000-0000-0000-000000000004',
   'a1000001-0000-0000-0000-000000000002',
   'ESD Protection', 1, 10, 'published'),
  ('b1000001-0000-0000-0000-000000000005',
   'a1000001-0000-0000-0000-000000000002',
   'Tool Safety', 2, 10, 'published')
ON CONFLICT (id) DO NOTHING;

-- ── Module 3 Lessons ──────────────────────────────────────────────────────────
INSERT INTO lms_lessons (id, module_id, title, order_index, estimated_minutes, status)
VALUES
  ('b1000001-0000-0000-0000-000000000006',
   'a1000001-0000-0000-0000-000000000003',
   'Drone Frame and Motor Layout', 1, 20, 'published'),
  ('b1000001-0000-0000-0000-000000000007',
   'a1000001-0000-0000-0000-000000000003',
   'Rover Drivetrain Systems', 2, 20, 'published'),
  ('b1000001-0000-0000-0000-000000000008',
   'a1000001-0000-0000-0000-000000000003',
   'Flight Controller Basics', 3, 15, 'published')
ON CONFLICT (id) DO NOTHING;

-- ── Module 4 Lessons ──────────────────────────────────────────────────────────
INSERT INTO lms_lessons (id, module_id, title, order_index, estimated_minutes, status)
VALUES
  ('b1000001-0000-0000-0000-000000000009',
   'a1000001-0000-0000-0000-000000000004',
   'Visual Inspection Protocol', 1, 15, 'published'),
  ('b1000001-0000-0000-0000-000000000010',
   'a1000001-0000-0000-0000-000000000004',
   'Multimeter Usage', 2, 20, 'published'),
  ('b1000001-0000-0000-0000-000000000011',
   'a1000001-0000-0000-0000-000000000004',
   'TechMedix Diagnostic Intake Form', 3, 10, 'published')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- LESSON CONTENT
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── L1.1: Voltage, Current, Resistance ───────────────────────────────────────
INSERT INTO lms_lesson_content (lesson_id, content_type, content, order_index) VALUES
  ('b1000001-0000-0000-0000-000000000001', 'text', '{
    "text": "Every electronic system in a robot — from the motor controllers on a Unitree G1 to the ESCs driving a DJI propulsion unit — operates on three fundamental quantities: voltage, current, and resistance. Understanding how these interact is the single most important prerequisite for field diagnostics.\n\nVoltage (V) is electrical pressure — the force that drives electrons through a circuit. It is measured in volts and always described as a potential difference between two points. A battery rated at 14.8 V (4S LiPo) maintains that pressure between its positive and negative terminals regardless of load, until the chemistry depletes.\n\nCurrent (I) is the rate of electron flow, measured in amperes (A). A motor drawing 20 A is consuming electrons at a much higher rate than a sensor drawing 50 mA. Current is what actually does work — spins motors, charges capacitors, and generates heat in resistances.\n\nResistance (R), measured in ohms (Ω), is opposition to current flow. Every conductor has some resistance; damaged connectors, oxidized terminals, and undersized wiring all increase resistance and create voltage drop under load."
  }', 1),
  ('b1000001-0000-0000-0000-000000000001', 'code', '{
    "language": "text",
    "label": "Ohm''s Law",
    "code": "V = I × R          (Voltage = Current × Resistance)\nI = V / R          (Current = Voltage / Resistance)\nR = V / I          (Resistance = Voltage / Current)\n\nPower dissipation:\nP = V × I          (watts)\nP = I² × R         (useful when V is unknown)"
  }', 2),
  ('b1000001-0000-0000-0000-000000000001', 'text', '{
    "text": "In practice: if a 24 V motor controller is delivering 0.5 A to an idle motor but the motor is drawing 8 A under load, the circuit resistance has not changed — the back-EMF of the motor has changed. Recognizing this distinction prevents misdiagnosis in the field.\n\nVoltage drop is a critical concept. When a connector has 0.1 Ω of contact resistance and the motor pulls 10 A, that connector drops 1 V and dissipates 10 W — enough to melt a JST connector in minutes. Always measure voltage at the load, not the source."
  }', 3)
ON CONFLICT DO NOTHING;

-- ── L1.2: Reading Schematics ─────────────────────────────────────────────────
INSERT INTO lms_lesson_content (lesson_id, content_type, content, order_index) VALUES
  ('b1000001-0000-0000-0000-000000000002', 'text', '{
    "text": "A schematic is a symbolic map of an electrical circuit. Unlike a wiring diagram, which shows physical layout, a schematic shows functional relationships — which components connect to which, and how signals or power flow between them. Every technician must be able to read a schematic to trace a fault to its source.\n\nSchematics use standardized symbols defined by IEEE and IEC standards. While exact symbols vary by document origin, the core set is consistent: resistors are shown as rectangles (IEC) or zigzag lines (IEEE), capacitors as parallel lines, inductors as curved loops, diodes as triangles with a bar, and transistors in their various forms."
  }', 1),
  ('b1000001-0000-0000-0000-000000000002', 'text', '{
    "text": "Reading strategy: start at power rails. Every schematic has a positive supply rail (often labeled VCC, VBAT, or a voltage like +5V) and a ground rail (GND, shown as a series of horizontal lines tapering to a point). Power flows from source through the circuit toward ground.\n\nNext, identify the active components — ICs, FETs, microcontrollers. These are the signal-processing nodes. Then trace signal paths: input comes from the left, output exits to the right in most Western conventions.\n\nFor robotic systems, pay attention to: motor driver H-bridges (four FETs in a bridge configuration), current sensing resistors (low-value shunts, typically 0.001–0.01 Ω), opto-isolators separating high-voltage motor circuits from logic, and bypass capacitors (0.1 µF ceramics) placed close to every IC power pin to suppress noise."
  }', 2),
  ('b1000001-0000-0000-0000-000000000002', 'code', '{
    "language": "text",
    "label": "Common schematic annotations",
    "code": "R1    100k     — resistor, 100 kilohms\nC3    10µF/16V  — electrolytic cap, 10 microfarad, 16V rating\nD2    1N4148    — small-signal diode, part number\nU1    STM32F4   — IC, microcontroller family\nQ4    IRF540N   — N-channel MOSFET, part number\nL1    10µH      — inductor, 10 microhenry\nTP7   GND       — test point, ground net"
  }', 3)
ON CONFLICT DO NOTHING;

-- ── L1.3: Common Components ───────────────────────────────────────────────────
INSERT INTO lms_lesson_content (lesson_id, content_type, content, order_index) VALUES
  ('b1000001-0000-0000-0000-000000000003', 'text', '{
    "text": "Robotic systems contain a consistent set of passive and active components. Recognizing them physically — on a PCB, in a connector harness, or in a cable run — is essential for fast diagnostics.\n\nResistors limit current and set voltage dividers. In SMD (surface-mount device) form they are small rectangular bodies with colored end caps; the most common sizes in robotic electronics are 0402 (1.0 × 0.5 mm) and 0603 (1.6 × 0.8 mm). Through-hole resistors have colored bands indicating value.\n\nCapacitors store charge and filter noise. Ceramic MLCCs (multi-layer ceramic capacitors) are the small tan or brown rectangles used for decoupling. Electrolytic capacitors are the cylindrical components with a marked negative stripe — polarity matters, reversed installation causes failure and can rupture.\n\nMOSFETs are voltage-controlled switches used in motor drivers, power switching, and protection circuits. In an H-bridge motor driver, four MOSFETs are arranged so any two can be turned on to drive the motor in either direction. Common failure mode: gate oxide breakdown from ESD or overvoltage, resulting in short-circuit between drain and source."
  }', 1),
  ('b1000001-0000-0000-0000-000000000003', 'text', '{
    "text": "Connectors are the most common failure point in field robotics. The XT60 and XT90 are gold-plated, high-current connectors used for main battery connections on drones and rovers. The XT30 handles up to 30 A continuous and is used for secondary battery packs. JST-PH and JST-GH are small-pitch connectors used for balance leads, sensors, and signal wiring — they are fragile and must never be pulled by the wire.\n\nInductors store energy in a magnetic field and are used in switching regulators (buck and boost converters) that step voltages up or down. On a power module PCB you will typically see a large shielded inductor next to an IC — that is the switching regulator converting battery voltage to 5 V or 3.3 V logic supply."
  }', 2)
ON CONFLICT DO NOTHING;

-- ── L2.1: ESD Protection ─────────────────────────────────────────────────────
INSERT INTO lms_lesson_content (lesson_id, content_type, content, order_index) VALUES
  ('b1000001-0000-0000-0000-000000000004', 'text', '{
    "text": "Electrostatic discharge (ESD) is an invisible but destructive force in electronics repair. A human body can accumulate 3,000–35,000 volts of static charge simply by walking across a carpeted floor. Modern CMOS semiconductors — the chips inside every flight controller, ESC, and motor driver — can be permanently damaged by discharges as small as 100 volts, far below the threshold of human perception.\n\nESD damage is insidious: it often does not cause immediate failure. Instead, it creates latent defects that manifest as erratic behavior or premature failure weeks later, making the root cause impossible to diagnose after the fact. The repair technician who worked on the board before the failure is rarely aware they caused it."
  }', 1),
  ('b1000001-0000-0000-0000-000000000004', 'text', '{
    "text": "ESD control protocol for all TechMedix repair operations:\n\n1. Wear a wrist strap connected to a grounded ESD mat before touching any PCB or bare electronic component. Test the wrist strap at the start of every work session using the installed strap tester.\n\n2. Work on an ESD-dissipative mat (surface resistance 10^6 to 10^9 ohms). The mat should be connected to building ground, not floating.\n\n3. Keep PCBs in anti-static bags (silver or pink shielding bags) until ready to work. Never use clear plastic bags — they generate static triboelectrically.\n\n4. Ground yourself before picking up any component, even if already wearing a wrist strap. Touch the mat or the chassis ground point first.\n\n5. In the field without ESD equipment: minimize contact with PCBs, hold boards by edges, and avoid low-humidity environments. Never work in conditions below 30% relative humidity without ESD equipment."
  }', 2)
ON CONFLICT DO NOTHING;

-- ── L2.2: Tool Safety ─────────────────────────────────────────────────────────
INSERT INTO lms_lesson_content (lesson_id, content_type, content, order_index) VALUES
  ('b1000001-0000-0000-0000-000000000005', 'text', '{
    "text": "Robotic systems carry significant stored energy. A 6S LiPo battery (25.2 V fully charged) driving a 2000 W motor controller can deliver enough current to weld metal, start fires, and cause severe burns. Before opening any robot enclosure, the energy state of the system must be assessed and controlled.\n\nBattery safety — LiPo:\nLiPo cells operate between 3.0 V (depleted) and 4.2 V (fully charged) per cell. A punctured or over-discharged LiPo can undergo thermal runaway — an exothermic chemical reaction that produces toxic fumes and can ignite surrounding materials. Store and charge LiPos in a fireproof LiPo bag. Never charge a puffed (swollen) battery. Dispose of damaged cells per local regulations — never in general waste.\n\nBattery safety — Li-Ion (cylindrical cells, common in rover packs):\nSimilar chemistry to LiPo but in rigid metal housing. More robust to physical damage but still capable of thermal runaway under short-circuit or overcharge conditions."
  }', 1),
  ('b1000001-0000-0000-0000-000000000005', 'text', '{
    "text": "Hand tool safety:\n\nTorque drivers: always use the correct bit (JIS vs Phillips are not interchangeable — using a Phillips bit on a JIS screw will strip the head). Apply downward pressure before rotating. Stripped screws on flight controllers require specialized extraction and add significant repair time.\n\nSoldering irons: the tip operates at 300–420°C. Keep the tip tinned (coated with solder) to prevent oxidation. Use a proper holder — never rest a hot iron on a bench. Solder produces flux fumes: work in a ventilated area or use a fume extractor. Avoid touching or inhaling flux residue.\n\nDiagonal cutters and flush cutters: keep blades sharp. Dull cutters crush component leads rather than cutting cleanly, stressing solder joints. Never use electronic cutters on hardened wire or hardware.\n\nLock-out/tag-out: when handing a robot to another technician or leaving a repair bench, remove the battery or engage the main power disconnect. Tag the robot with a repair-in-progress label visible on the battery port."
  }', 2)
ON CONFLICT DO NOTHING;

-- ── L3.1: Drone Frame and Motor Layout ───────────────────────────────────────
INSERT INTO lms_lesson_content (lesson_id, content_type, content, order_index) VALUES
  ('b1000001-0000-0000-0000-000000000006', 'text', '{
    "text": "A multirotor drone frame is the structural backbone that holds every subsystem in spatial relationship to each other. Frame geometry directly determines flight dynamics, payload capacity, and repairability. For quadrotors — the most common configuration in commercial and industrial applications — the frame consists of a center plate (or hub) and four arms extending outward, each terminating in a motor mount.\n\nFrame materials: carbon fiber tube and plate construction is standard for performance drones above 250g. Carbon fiber has exceptional stiffness-to-weight ratio but is brittle under impact and conducts electricity — all frame components must be insulated from live wiring. Injection-molded plastic frames are used for consumer-grade and indoor drones where weight is less critical and impact resistance is preferred."
  }', 1),
  ('b1000001-0000-0000-0000-000000000006', 'text', '{
    "text": "Motor placement and rotation convention:\n\nIn a standard X-frame quadrotor, motors are numbered 1–4 beginning at the front-left and proceeding clockwise. Motors 1 and 4 (diagonals) rotate clockwise (CW); motors 2 and 3 (the other diagonal) rotate counter-clockwise (CCW). This arrangement ensures that torque reactions cancel across the frame, allowing yaw control via differential throttle.\n\nBrushless motor anatomy: the motor consists of a stator (wound copper coils, fixed to the motor mount) and a rotor (permanent magnets, attached to the bell that spins). The three motor wires correspond to phases A, B, and C of the three-phase AC signal produced by the ESC. Swapping any two of the three wires reverses motor rotation direction — this is the standard method for correcting spin direction after replacement.\n\nMotor specifications technicians must know:\n- KV rating: RPM per volt with no load. A 2300 KV motor on a 14.8 V (4S) pack spins at ~34,000 RPM unloaded.\n- Stator size: expressed as diameter × height in mm (e.g., 2306 = 23mm diameter, 6mm height). Larger stators produce more torque."
  }', 2)
ON CONFLICT DO NOTHING;

-- ── L3.2: Rover Drivetrain Systems ───────────────────────────────────────────
INSERT INTO lms_lesson_content (lesson_id, content_type, content, order_index) VALUES
  ('b1000001-0000-0000-0000-000000000007', 'text', '{
    "text": "Ground-based autonomous mobile robots (AMRs) and rovers use wheeled or tracked drivetrain architectures optimized for their operating environment. Understanding drivetrain topology is essential for diagnosing mobility failures.\n\nDifferential drive is the simplest and most common configuration: two independently driven wheels on a common axis, with one or more passive caster wheels for balance. Steering is achieved by varying the relative speed of the two drive wheels. A wheeled robot turning left decelerates the left motor and accelerates the right. Pure spin-in-place (zero-radius turn) uses equal and opposite speeds on each motor. This configuration is mechanically simple, easy to control, and widely used in indoor delivery robots and warehouse AMRs.\n\nFour-wheel drive (4WD) with skid steering is used for outdoor rovers requiring traction on uneven terrain. All four wheels are driven, with left and right side motors paired. Steering is accomplished by skidding the wheels — the inside wheels slow or stop while the outside wheels drive the turn radius. The Unitree B2 uses a variant of this approach on its leg contact surfaces."
  }', 1),
  ('b1000001-0000-0000-0000-000000000007', 'text', '{
    "text": "Drivetrain components and failure modes:\n\nDC brushed motors with gearboxes are used in lower-cost platforms. The brushes (carbon contacts) wear over time and must be replaced. Symptom: intermittent power loss, sparking at brushes, burning smell. Check brush length — replace if worn below 5mm.\n\nBrushless DC motors with separate motor controllers are used in performance platforms. The motor controller (driver board) is the most common failure point after impact. Check for FET shorts (motor runs in one direction only or draws excessive current at idle).\n\nGearboxes introduce gear lash (backlash) — a small amount of free movement at direction reversal. Excessive backlash indicates worn gears. Gearbox seals prevent lubricant loss; cracked seals allow dirt ingress and accelerate gear wear.\n\nWheels and tires: check for delamination between tread and hub (common on pneumatic-tired rovers after impact). Polyurethane foam-filled tires require no pressure maintenance but are heavier and have higher rolling resistance than pneumatic equivalents."
  }', 2)
ON CONFLICT DO NOTHING;

-- ── L3.3: Flight Controller Basics ───────────────────────────────────────────
INSERT INTO lms_lesson_content (lesson_id, content_type, content, order_index) VALUES
  ('b1000001-0000-0000-0000-000000000008', 'text', '{
    "text": "The flight controller (FC) is the brain of every autonomous aerial vehicle. It reads sensor data, runs the control algorithm, and outputs throttle commands to each ESC at 400–8000 Hz, depending on configuration. Understanding its architecture allows technicians to distinguish sensor failures from firmware issues, and firmware issues from hardware faults.\n\nCore sensors integrated on every flight controller:\n- IMU (Inertial Measurement Unit): contains a 3-axis accelerometer and 3-axis gyroscope. Measures linear acceleration and angular velocity. The PID loop uses gyroscope data as the primary feedback for attitude stabilization. IMU failure typically manifests as uncontrolled oscillation or immediate crash on arming.\n- Barometer: measures atmospheric pressure to estimate altitude. Used in altitude-hold and return-to-home modes. Barometer sensitivity to wind gusts and prop wash (turbulence from own propellers) is a known limitation — many FCs place the barometer in a foam-lined cavity to isolate it.\n- Magnetometer (compass): measures magnetic field for heading reference. Susceptible to interference from current-carrying wires and ferrous metal — always mount the magnetometer away from high-current paths, typically on the GPS mast."
  }', 1),
  ('b1000001-0000-0000-0000-000000000008', 'text', '{
    "text": "Communication interfaces technicians encounter during repair:\n\nUART: serial communication at configurable baud rates (typically 115200 or 460800). Used for GPS, RC receivers (SBUS, CRSF), telemetry modems, and companion computers. UART pin assignment errors (TX-RX polarity swap) are a common post-repair issue.\n\nSPI: high-speed synchronous interface used between the flight controller MCU and the IMU chip. Rarely the source of field failures but relevant when the FC reports sensor initialization errors after PCB repair.\n\nI2C: lower-speed interface used for external magnetometers and some barometers. Susceptible to noise — keep I2C traces short and away from motor drive signals.\n\nCAN bus: differential serial bus with built-in error detection, used on professional platforms (Pixhawk, Auterion) for connecting motors, GPS, and payloads with high reliability. Each CAN node requires a 120Ω termination resistor at each end of the bus — missing terminators cause intermittent communication failures that are difficult to diagnose without an oscilloscope."
  }', 2)
ON CONFLICT DO NOTHING;

-- ── L4.1: Visual Inspection Protocol ─────────────────────────────────────────
INSERT INTO lms_lesson_content (lesson_id, content_type, content, order_index) VALUES
  ('b1000001-0000-0000-0000-000000000009', 'text', '{
    "text": "Visual inspection is the first step in every diagnostic workflow and requires no tools other than good lighting and a trained eye. An experienced technician can identify 60–70% of all field failures through visual inspection alone before taking a single measurement.\n\nPre-inspection setup:\n1. Remove all batteries and confirm the system is de-energized. Check for any capacitor charge warnings in the service documentation — some high-voltage drive systems retain charge for 30+ seconds after power removal.\n2. Work under bright, directional lighting. A headlamp angled at 20–30 degrees to the PCB surface causes components to cast shadows that reveal lifted pads, cracked solder joints, and delamination that direct overhead lighting misses.\n3. Use a 10× loupe or digital microscope for SMD-scale inspection."
  }', 1),
  ('b1000001-0000-0000-0000-000000000009', 'text', '{
    "text": "Systematic inspection sequence (follow this order on every intake):\n\n1. PHYSICAL DAMAGE: Inspect frame, housing, and enclosures for cracks, impact marks, deformation. Document with photos before any cleaning or disassembly.\n\n2. CONNECTORS AND CABLES: Check all connectors for bent pins, corrosion, melting, or partial insertion. Tug each connector gently — a properly seated connector should require deliberate force to remove. Inspect cable insulation for chafe marks near strain relief points.\n\n3. PCB SURFACE: Look for burnt areas (brown or black discoloration), electrolyte leakage from capacitors (white or brown crusty residue around capacitor bases), swollen capacitors, lifted component pads, cracked traces, and missing or displaced SMD components.\n\n4. MOTOR AND MECHANICAL: Spin each motor by hand. It should rotate smoothly with a slight magnetic detent between poles. Grinding, roughness, or wobble indicates bearing damage. Inspect propeller mounting threads for cross-threading or damage.\n\n5. THERMAL EVIDENCE: Melted plastic, discolored conformal coating, or heat-blued metal indicates a thermal event. Locate the heat source — it is almost always upstream in the power path from the visible damage."
  }', 2)
ON CONFLICT DO NOTHING;

-- ── L4.2: Multimeter Usage ────────────────────────────────────────────────────
INSERT INTO lms_lesson_content (lesson_id, content_type, content, order_index) VALUES
  ('b1000001-0000-0000-0000-000000000010', 'text', '{
    "text": "A digital multimeter (DMM) is the most important instrument in field diagnostics. Used correctly, it can confirm or eliminate every common fault hypothesis generated by visual inspection.\n\nSafety first: always set the range before connecting probes. Use the appropriate input terminal — most DMMs have a dedicated high-current (10 A) input separate from the voltage/resistance input. Exceeding the current input rating blows the internal fuse and renders the meter inoperative.\n\nThe five essential measurements:\n\n1. DC VOLTAGE: Set to DC V (not AC). Connect the red probe to the positive test point and the black probe to ground. On a 4S LiPo system, you should read approximately 14.8 V fully charged, 14.0 V at nominal, 12.0 V at low battery warning. Measure at the load when diagnosing voltage drop — a significant difference between source and load voltage under load indicates excessive resistance in the path."
  }', 1),
  ('b1000001-0000-0000-0000-000000000010', 'code', '{
    "language": "text",
    "label": "LiPo cell voltage reference",
    "code": "Cell condition    Per-cell V    4S total\nFully charged     4.20 V        16.8 V\nNominal           3.70 V        14.8 V\nStorage           3.80 V        15.2 V\nLow warning       3.50 V        14.0 V\nCritical          3.00 V        12.0 V  (do not discharge below)"
  }', 2),
  ('b1000001-0000-0000-0000-000000000010', 'text', '{
    "text": "2. RESISTANCE/CONTINUITY: With the circuit de-energized, set to Ω or continuity mode (audible beep). Continuity mode is faster for checking connector pin-to-pin continuity. A 0 Ω reading indicates a short; OL (overload) indicates an open circuit or value above range.\n\n3. CURRENT: Only measure current in series with the circuit (break the circuit and insert the meter). This is rarely done in field conditions — use a clamp meter for non-invasive current measurement instead.\n\n4. DIODE TEST: In diode test mode, the meter applies a small forward voltage and reads the forward voltage drop. A healthy silicon diode reads 0.5–0.7 V forward, OL reverse. A shorted diode reads near 0 V in both directions — this indicates a failed motor driver FET.\n\n5. CAPACITOR (if meter supports it): Measures capacitance in µF or nF. A capacitor measuring significantly below its rated value has degraded and may be causing power supply instability."
  }', 3)
ON CONFLICT DO NOTHING;

-- ── L4.3: TechMedix Diagnostic Intake Form ───────────────────────────────────
INSERT INTO lms_lesson_content (lesson_id, content_type, content, order_index) VALUES
  ('b1000001-0000-0000-0000-000000000011', 'text', '{
    "text": "Every robot entering the TechMedix repair workflow must be logged through the diagnostic intake form before any physical work begins. This requirement exists for four reasons: liability (documenting pre-existing damage), traceability (linking repairs to specific serial numbers and operators), quality control (identifying recurring failure patterns across the fleet), and billing (accurate time and parts tracking).\n\nThe TechMedix intake form captures:\n\nROBOT IDENTIFICATION\n- Platform (make, model, variant)\n- Serial number (location varies by manufacturer — check underside label or firmware info screen)\n- Fleet ID and operator/customer\n- Hours in service and cycle count (if accessible from companion app or flight log)\n\nFAILURE DESCRIPTION\n- Customer-reported symptom in plain language\n- Circumstances of failure (during flight, on landing, intermittent, post-update)\n- Environmental conditions at failure (temperature, humidity, indoor/outdoor)\n- Last known good state\n\nPRE-REPAIR ASSESSMENT\n- Battery voltage at intake\n- Visual inspection findings (referencing the protocol from the previous lesson)\n- Initial fault hypothesis and planned diagnostic steps\n\nAny deviation from this form — working from verbal descriptions alone, skipping the visual inspection, or beginning repairs without documenting intake state — is a protocol violation and creates liability exposure for both the technician and BlackCat Robotics."
  }', 1),
  ('b1000001-0000-0000-0000-000000000011', 'code', '{
    "language": "text",
    "label": "Intake checklist (technician copy)",
    "code": "[ ] Serial number confirmed and matched to work order\n[ ] Battery voltage measured and recorded\n[ ] Pre-existing damage photographed\n[ ] Customer symptom transcribed verbatim\n[ ] Failure circumstances documented\n[ ] Visual inspection completed (all 5 zones)\n[ ] Initial fault hypothesis stated\n[ ] Diagnostic plan documented\n[ ] Estimated labor and parts authorized by customer"
  }', 2)
ON CONFLICT DO NOTHING;
