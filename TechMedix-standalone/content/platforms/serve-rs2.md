---
slug: serve-rs2
name: Serve Robotics RS2
category: Delivery
overview: The Serve Robotics RS2 is the third-generation (Gen3) autonomous sidewalk delivery robot, featuring a four-wheel independent steering drivetrain, NVIDIA Jetson Orin edge AI module (5x computing power vs. prior gen), Ouster REV7 digital LiDAR, multi-camera sensor suite, and up to 50 lbs payload capacity. It is manufactured in partnership with Magna International and deployed with Uber Eats in multiple U.S. cities.
failure_modes:
  - mode: "LiDAR sensor obstruction or degradation"
    symptom: "Robot fails to detect obstacles or navigates erratically in rain, fog, or direct sunlight; may trigger unnecessary stops or avoidance maneuvers."
    cause: "LiDAR sensor window obscured by dirt, water film, or ice; direct sunlight saturation of laser returns."
    mitigation: "Clean sensor windows before each shift. In heavy precipitation or fog, consider reduced-speed mode or grounding. Remote operator can take control via teleassistance."
    confidence: reported
  - mode: "Wheel/motor drivetrain fault on uneven terrain"
    symptom: "Robot stalls on curbs, potholes, or gravel; one or more wheels lose traction and robot halts."
    cause: "Suspension or drivetrain component failure after repeated curb impacts or water ingress into wheel bearings."
    mitigation: "Pre-deployment route inspection for severe obstacles. Maintenance interval: inspect wheel bearings and suspension every 5,000 km or 6 months."
    confidence: reported
  - mode: "Battery depletion during extended operation"
    symptom: "Robot aborts delivery and initiates return-to-base or emergency stop mid-route."
    cause: "Battery degradation below usable threshold; cold weather reducing effective capacity; extended runtime exceeding 12+ hour spec."
    mitigation: "Monitor battery state-of-charge in fleet dashboard. Pre-warm batteries in cold weather (<32°F). Replace cells per manufacturer schedule."
    confidence: reported
repair_protocol: |
  1. Initiate remote stop via fleet management dashboard if robot is unsafe.
  2. Visually inspect chassis, wheels, and sensor windows for damage, debris, or moisture.
  3. Clean all camera lenses and LiDAR windows with microfiber cloth.
  4. Check battery charge level and connector seating.
  5. Power cycle the robot (shutdown → wait 30s → restart) to clear transient software faults.
  6. If navigation error persists, run sensor calibration diagnostic via Serve's maintenance interface.
  7. Do not open sealed cargo module or drivetrain housing without Serve-authorized service clearance.
sources:
  - "Serve Robotics Gen3 press releases (investors.serverobotics.com)"
  - "NVIDIA case study: Serve Robotics Autonomous Sidewalk Delivery"
  - "Stork.ai Serve Robotics review (2026)"
  - "Robotwale: Last-Mile Delivery Bots hardware analysis"
  - "Serve Robotics NVIDIA Jetson Orin integration specifications"
