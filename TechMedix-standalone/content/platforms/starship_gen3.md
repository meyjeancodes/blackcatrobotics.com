---
slug: starship_gen3
name: Starship Gen 3
category: Delivery
overview: The Starship Gen 3 (also referred to as S3 or third-generation) is a six-wheeled autonomous sidewalk delivery robot with up to 10 kg payload capacity, 1260 Wh battery providing over 12 hours of operation, maximum speed of 6 km/h, and IP54 rating. It navigates using 12 cameras (360-degree coverage), ultrasonic sensors, radar, stereo cameras, time-of-flight cameras, and GPS. The fleet has completed over 10 million deliveries across 25+ U.S. states and multiple countries.
failure_modes:
  - mode: "Wheel/tire damage on uneven surfaces"
    symptom: "Robot stalls on curbs, cobblestones, or gravel; reduced traction or wobble during navigation."
    cause: "Six-wheel drivetrain wear from repeated curb impacts; tire abrasion on rough surfaces."
    mitigation: "Visual inspection and debris removal daily. Full mechanical inspection every 5,000 km or 6 months per maintenance schedule."
    confidence: reported
  - mode: "Camera/sensor obstruction in adverse weather"
    symptom: "Navigation errors, slowed speed, or remote operator intervention required; robot may stop and request assistance."
    cause: "Rain, snow, or fog obscuring camera windows; direct sunlight causing glare; dirt or debris on sensor surfaces."
    mitigation: "Clean camera windows and ultrasonic sensors before each deployment. In heavy precipitation or snow, consider grounding the fleet. Remote operator can assist via teleassistance."
    confidence: reported
  - mode: "GPS signal degradation in urban canyons"
    symptom: "Robot position drifts on map; navigation errors near tall buildings; robot may pause to re-localize."
    cause: "GPS multipath or signal blockage in dense urban environments with tall structures."
    mitigation: "Starship's navigation relies on fused GPS + visual SLAM; degradation is typically handled autonomously. If persistent, flag location for map update via fleet management tools."
    confidence: reported
repair_protocol: |
  1. Initiate remote stop via Starship fleet orchestration dashboard if robot is unsafe.
  2. Visually inspect chassis, wheels, and all 12 camera windows for damage, debris, or moisture.
  3. Clean all sensor surfaces (cameras, ultrasonics, time-of-flight) with appropriate cloth.
  4. Check battery charge level and connector seating.
  5. Power cycle the robot (shutdown → wait 30s → restart) to clear transient faults.
  6. If navigation error persists, connect to Starship's diagnostic interface and run sensor calibration check.
  7. For hardware faults (wheel motor, camera module, radar), contact Starship field service — do not open sealed electronics compartments without authorization.
sources:
  - "Starship Technologies official website (starship.xyz)"
  - "Wevolver Starship Robot technical specifications"
  - "Robotomated Starship S3 specs and maintenance guide"
  - "Pulse 2.0 interview with Starship VP Hardware Engineering Chris Smith"
  - "Dustbot.org Starship delivery robot specifications"
  - "Robolist.ai Starship Delivery Robot Gen 3 page"
