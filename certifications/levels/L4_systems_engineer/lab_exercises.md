# L4 Systems Engineer — Lab Exercises

Five labs covering fleet architecture, Weibull analysis, EOQ optimization, team leadership scenarios, and enterprise integration design.

---

## Lab 4-1: Fleet Network Architecture Design

**Objective:** Design a secure, segmented network architecture for a 20-robot fleet across two facilities, meeting enterprise security requirements.

**Equipment:**
- Network design software (draw.io or Lucidchart)
- TechMedix staging environment access
- Reference: BCR Network Architecture Guide v2.3

**Safety:**
- Lab uses staging environment only — no production systems modified
- Document all design decisions with rationale before implementation

**Procedure:**

1. Draw a complete network topology for Facility A (12 robots) and Facility B (8 robots). Include: robot VLAN, management VLAN, corporate network, internet, TechMedix cloud. Label all VLAN IDs, subnet ranges, and gateway addresses.

2. Define WiFi access point placement rules: coverage overlap percentage, AP-to-robot ratio, 2.4GHz vs. 5GHz band assignment criteria for robot telemetry vs. control traffic.

3. Configure VPN tunnel specifications: protocol (WireGuard or IPSec), key rotation interval, failover behavior when primary tunnel drops, and MTU settings for TechMedix telemetry payload sizes.

4. Define firewall rules between zones: which source IPs/ports can reach the TechMedix cloud endpoint, which return traffic is permitted, and what is blocked by default. Write rules in iptables or Cisco ACL notation.

5. Design a certificate management plan: per-robot client certificates (PEM format), CA hierarchy, rotation schedule, and revocation procedure for a compromised robot.

6. Test the design against three failure scenarios: (a) VPN tunnel failure, (b) VLAN misconfiguration causing robot-to-robot traffic, (c) AP failure leaving 3 robots without WiFi. Document expected behavior and recovery procedures for each.

**Outcomes:**
- Completed network topology diagram with all components labeled
- Firewall rule set document
- Certificate management plan
- Failure scenario analysis document

**Errors / Troubleshooting:**
- Overlapping VLAN IDs between facilities: use unique VLAN IDs globally (Facility A: 100-199, Facility B: 200-299)
- MTU black holes: test with large ping (ping -s 1400 gateway) before production; reduce to 1360 if fragmentation occurs on VPN
- Certificate authority hierarchy: do not use the same CA for client and server certificates

**L4 Sign-off Criteria:**
- [ ] Network diagram reviewed and approved by senior engineer
- [ ] Firewall rules verified against BCR security policy checklist
- [ ] Certificate rotation tested in staging environment

---

## Lab 4-2: Weibull Failure Analysis — Real Dataset

**Objective:** Perform Weibull analysis on a provided fleet failure dataset to determine beta and eta parameters, interpret failure mode, and recommend a maintenance strategy.

**Equipment:**
- Python 3.10+ with reliability library (pip install reliability)
- Provided dataset: lab4_bearing_failures.csv (50 failure times in hours)
- Reference: curriculum.md Section 2

**Safety:**
- Analysis uses historical data — no physical robot interaction

**Procedure:**

1. Load the failure dataset. Verify data integrity: check for duplicate entries, negative values, or outliers more than 3 standard deviations from the mean. Document any data quality issues.

2. Fit a Weibull 2-parameter distribution to the dataset using maximum likelihood estimation. Use the Python `reliability` library:
   ```python
   from reliability.Fitters import Fit_Weibull_2P
   results = Fit_Weibull_2P(failures=data, print_results=True, show_probability_plot=True)
   ```

3. Extract and record: beta (shape), eta (scale), 95% confidence intervals for both parameters.

4. Calculate B10, B20, and B50 lives from the fitted distribution. Show the calculation formula and intermediate values.

5. Interpret the beta value: is this infant mortality, random, or wearout failure? What physical mechanism does this imply for robot bearings?

6. Recommend a preventive maintenance interval. Justify the choice of B-life target (B10, B20, or other) based on: consequence of unplanned failure, maintenance cost, and fleet utilization pattern.

7. Calculate what percentage of the bearing population would fail before the recommended PM interval if implemented fleet-wide.

**Outcomes:**
- Weibull probability plot (saved as PNG)
- Parameter table with confidence intervals
- B10/B20/B50 values
- Written maintenance strategy recommendation (200-300 words)

**Errors / Troubleshooting:**
- Convergence failure in MLE: check for very small or very large values in dataset; normalize to hours if values are in seconds
- Wide confidence intervals: sample size < 20 produces unreliable estimates; note this limitation in the report
- Bimodal distribution: if data shows two distinct populations, fit Weibull Mixture Model

**L4 Sign-off Criteria:**
- [ ] Correct beta and eta values (within 5% of instructor solution)
- [ ] B-life calculations verified
- [ ] Maintenance recommendation justified with quantitative rationale

---

## Lab 4-3: Spare Parts Optimization — EOQ Model

**Objective:** Build a complete spare parts optimization model for a 15-robot fleet, calculating EOQ, safety stock, and reorder point for 5 critical components.

**Equipment:**
- Python 3.10+ with pandas, numpy
- Provided parts consumption dataset: lab4_parts_history.csv
- Reference: curriculum.md Section 3

**Safety:**
- Financial modeling exercise — no physical components

**Procedure:**

1. Load the 12-month parts consumption history. Calculate annual demand rate D for each of 5 components. Identify and explain any seasonal demand patterns.

2. Obtain ordering cost S and unit cost data from the provided BCR supplier catalog (lab4_supplier_catalog.pdf). Calculate annual holding cost H as 25% of unit cost.

3. Calculate EOQ for each component:
   ```
   EOQ = sqrt((2 * D * S) / H)
   ```
   Round to the nearest practical order quantity (e.g., pack sizes from the supplier catalog).

4. Calculate safety stock for each component at 95% service level (Z=1.65):
   ```
   SS = Z * sigma_d * sqrt(lead_time_days)
   ```
   Use the demand standard deviation from the consumption history. Use supplier lead times from the catalog.

5. Calculate reorder point (ROP):
   ```
   ROP = (average_daily_demand * lead_time_days) + safety_stock
   ```

6. Build a total cost comparison: current (ad-hoc ordering) vs. EOQ model. Estimate annual savings from implementing EOQ ordering.

7. Identify which component has the highest stockout risk under the current ad-hoc system. Justify using the ratio of current safety stock to calculated required safety stock.

**Outcomes:**
- EOQ table: component, D, S, H, EOQ, SS, ROP
- Cost comparison: current vs. EOQ (annual)
- Highest-risk component identification with justification

**Errors / Troubleshooting:**
- Negative safety stock: verify sigma_d is positive; check dataset for data entry errors
- EOQ larger than annual demand: review if S (ordering cost) is proportionally very high; consider consignment arrangement
- Lead time data missing: use industry average (14 days for standard components, 30 days for specialty parts) and flag as assumption

**L4 Sign-off Criteria:**
- [ ] EOQ values within 10% of instructor solution
- [ ] Safety stock correctly calculated at 95% service level
- [ ] Cost comparison includes ordering cost, holding cost, and stockout risk

---

## Lab 4-4: Team Leadership Simulation

**Objective:** Manage a simulated 6-technician team responding to a fleet emergency, demonstrating escalation decision-making, communication, and resource allocation skills.

**Equipment:**
- TechMedix staging environment (fleet emergency scenario pre-loaded)
- Lab coordinator playing role of technician team members
- Role-play scenario cards

**Safety:**
- Simulation exercise — no physical robots

**Procedure:**

1. Review the scenario brief: Fleet of 12 Unitree G1 robots at a distribution center. 3 robots have simultaneous P1 alerts (joint temperature critical). 2 technicians are on-site; 4 are off-site within 45 minutes.

2. In the first 10 minutes, demonstrate: (a) Triage the 3 P1 alerts in priority order with justification. (b) Dispatch the 2 on-site technicians with specific tasks. (c) Decide which off-site technicians to call in.

3. At 15 minutes, lab coordinator introduces complication: one of the P1 robots shows FMEA flags with Severity=9, Occurrence=6 (RPN=324). Demonstrate immediate escalation decision and communication to BCR engineering.

4. At 25 minutes, one technician reports a successful repair but cannot complete post-repair validation because the required diagnostic laptop is at Facility B. Demonstrate resource coordination: how do you get the laptop to the technician in time?

5. Conduct a 10-minute debrief: What went well? What decisions could have been made faster? What process gap (if any) caused the laptop availability issue?

6. Write a post-incident report (1 page): timeline of events, decisions made, root cause of the resource gap, and recommended process change to prevent recurrence.

**Outcomes:**
- Documented triage decisions with justification
- Escalation communications log
- Resource coordination decisions
- Post-incident report

**Errors / Troubleshooting:**
- Decision paralysis: use the 30-second rule — make a decision in 30 seconds with available information rather than waiting for complete information
- Escalating too late: Severity >= 9 is an immediate escalation trigger regardless of other factors
- Communication gaps: all decisions must be documented in TechMedix in real time — verbal-only decisions are not acceptable

**L4 Sign-off Criteria:**
- [ ] Correct triage priority order for 3 P1 alerts
- [ ] Severity=9 escalation initiated within simulated 5 minutes of discovery
- [ ] Post-incident report identifies systemic root cause (not individual blame)

---

## Lab 4-5: Enterprise Integration Design and Implementation

**Objective:** Design and prototype a TechMedix integration with a simulated ERP system, implementing webhook delivery, retry logic, and alert routing.

**Equipment:**
- TechMedix staging environment with webhook configuration
- webhook.site for endpoint simulation
- Python 3.10+ for retry logic prototype
- Reference: curriculum.md Section 5

**Safety:**
- Lab uses staging environment — no production data

**Procedure:**

1. Configure a TechMedix webhook in the staging environment to fire on P1 alert creation. Capture the webhook payload structure at webhook.site. Document all fields in the payload JSON schema.

2. Implement an exponential backoff retry handler in Python. The handler must: attempt delivery, wait 60 seconds on failure, then 5 minutes, then 30 minutes, then 2 hours. After 4 failed attempts, write the event to a dead letter queue file.
   ```python
   import time, json
   def deliver_with_retry(payload, endpoint, max_attempts=4):
       delays = [60, 300, 1800, 7200]
       for attempt, delay in enumerate(delays, 1):
           # implement delivery and retry logic
   ```

3. Test the retry handler with a simulated endpoint that returns HTTP 503 for the first 3 attempts, then HTTP 200. Verify: correct delay intervals, correct attempt count, and successful delivery on attempt 4.

4. Design an alert routing matrix: P1 alerts go to on-call technician + L4 engineer; P2 alerts go to next-business-day queue; P3 alerts go to weekly review digest. Implement routing using the webhook payload's priority field.

5. Document the integration in the BCR Enterprise Integration Specification format: endpoint URL, authentication method, payload schema version, retry policy, and dead letter queue handling procedure.

6. Test the dead letter queue: simulate 4 consecutive failures and verify the event is written correctly. Implement a DLQ reprocessing function that reads from the queue file and retries delivery.

**Outcomes:**
- Webhook payload schema documentation
- Working retry handler with exponential backoff (code + test results)
- Alert routing matrix
- Integration specification document
- DLQ implementation with reprocessing function

**Errors / Troubleshooting:**
- Webhook authentication: staging environment uses HMAC-SHA256 signature in X-BCR-Signature header; verify before processing
- Timezone handling in retry timestamps: always use UTC; log all timestamps in ISO 8601 format
- DLQ file format: use JSONL (one JSON object per line) for DLQ storage — easier to append and read than a JSON array

**L4 Sign-off Criteria:**
- [ ] Retry handler correctly implements exponential backoff delays
- [ ] Alert routing matrix tested for all three priority levels
- [ ] DLQ reprocessing function successfully retries events from the queue file
