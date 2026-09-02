---
slug: lely-discovery-collector
name: Lely Discovery Collector
category: Agricultural
overview: The Lely Discovery Collector (C1 and C2) is an autonomous manure-collecting robot designed for solid and semi-closed barn floors. Unlike traditional scraper systems, the Collector vacuums manure using an onboard vacuum pump and stores it in an internal tank, then automatically drives to a dumping station when full. The C2 model features wireless charging at a combined dump/charge/fill station. The robot navigates via built-in sensors without cables or gutters, and is controlled via a mobile app for route scheduling and zone assignment.
failure_modes:
  - mode: "Tank full sensor alarm — false positive"
    symptom: "Robot triggers 'tank too full' alarm prematurely or stops collecting before tank is actually full."
    cause: "Full sensor caked in dried manure, giving false readings; blockage in the tank preventing proper fill detection; sensor contamination from barn environment."
    mitigation: "Clean the tank full sensor regularly (every 10 days per operator reports); inspect for blockages; flush tank and sensor area during routine maintenance."
    confidence: verified-community
  - mode: "Ultrasonic sensor obstruction"
    symptom: "Robot stops unexpectedly, deviates from programmed route, or fails to detect obstacles."
    cause: "Dust, manure, or debris covering ultrasonic sensor lenses; sensor misalignment from physical contact; internal sensor failure."
    mitigation: "Clean ultrasound sensors every 10 days as recommended; inspect for physical damage; recalibrate sensors via the mobile app if navigation issues persist."
    confidence: verified-community
  - mode: "Vacuum pump failure"
    symptom: "Robot cannot collect manure; vacuum pump makes unusual noise or no noise at all; collection performance drops significantly."
    cause: "Vacuum pump mechanical failure from continuous operation; blockage in suction hose; worn impeller; motor burnout."
    mitigation: "Inspect suction hose for blockages during maintenance; listen for abnormal pump sounds; replace vacuum pump per Lely service schedule or on failure."
    confidence: verified-community
  - mode: "Battery or charging failure"
    symptom: "Robot fails to return to charging station; reduced runtime; wireless charging does not initiate."
    cause: "Battery cell degradation from high-cycle use; misalignment with wireless charging pad; charging station power fault; extreme temperature exposure."
    mitigation: "Clean wireless charging contacts on robot and station; verify battery health via app diagnostics; keep charging station area clean; replace battery per Lely guidelines."
    confidence: reported
repair_protocol: |
  1. Place the robot in maintenance mode via the mobile app before any work.
  2. Empty the manure tank and flush with water.
  3. Clean all ultrasonic sensors with a soft cloth and mild cleaner.
  4. Inspect vacuum pump, suction hose, and nozzles for blockages or wear.
  5. Check battery charge level and inspect wireless charging contacts.
  6. Verify navigation route programming and sensor calibration via app.
  7. Perform a short test run to confirm all systems operational before returning to service.
sources:
  - "Lely official Discovery Collector product pages (lelyna.com, lely.com)"
  - "Lely Discovery Collector C2 user manual"
  - "West Coast Robotics: 'Discovery Alarms Demystified' — common issue solutions"
  - "Farmer reports and Lely Center maintenance guidance"
  - "Profi.co.uk: Lely manure robot for solid floors overview"
