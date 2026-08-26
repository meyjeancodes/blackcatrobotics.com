---
slug: unitree-go2
name: Unitree Go2
category: Quadruped
overview: The Go2 is Unitree's consumer/research quadruped and the most widely deployed sub-$3k legged robot. Field deployments include search-and-rescue trials (e.g. Romanian Salvamont). Community teardown knowledge is extensive.
failure_modes:
  - mode: "Knee joint gear wear after hard landings"
    symptom: "Clicking or grinding from knee actuators; reduced jump/rear capability."
    cause: "Planetary gearing in the knee module is the most impact-loaded joint."
    mitigation: "Replace the knee joint module (available as a spare part); avoid drop-test style landings on hard surfaces."
    confidence: verified-community
  - mode: "Foot rubber pad wear on abrasive surfaces"
    symptom: "Slipping on smooth floors, degraded trot stability."
    cause: "Rubber feet are consumables, especially on concrete and rock."
    mitigation: "Keep spare foot caps; rotate/replace on inspection intervals."
    confidence: verified-community
  - mode: "4D LiDAR (L1) occlusion/damage"
    symptom: "Obstacle avoidance misses low obstacles or errors at boot."
    cause: "The nose-mounted L1 window scratches or blocks with mud/debris."
    mitigation: "Clean the sensor window gently before missions; replace the L1 unit if scratched deeply — it is not user-repairable internally."
    confidence: reported
repair_protocol: |
  1. Power down and undock the battery before service; the Go2's battery is a
     slide-in pack accessible from the underside.
  2. Joint modules are sealed units: remove the leg shrouds, unplug the joint
     harness, swap the module, then run joint calibration from the app.
  3. After any joint replacement, re-run gait self-check on a soft surface
     before returning to normal operation.
  4. Keep the app/firmware matched to the EDU vs Air/Pro variant — flashing an
     EDU image onto consumer hardware bricks the license check.
sources:
  - "Unitree Go2 documentation"
  - "Community teardowns and rescue-service field reports"
