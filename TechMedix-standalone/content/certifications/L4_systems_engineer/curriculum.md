# L4 Systems Engineer Curriculum

Five sections: fleet architecture, Weibull analysis, spare parts optimization, team leadership, enterprise integrations.

---

## Section 1: Fleet Architecture and Enterprise Integration

### Fleet Architecture Design

Enterprise robot fleets require deliberate network and data architecture:

**Network topology:**
- Segment robots on dedicated VLAN (separate from corporate IT)
- Use WPA3-Enterprise authentication for robot WiFi
- Deploy dedicated access points per 5-robot zone (2.4GHz for range, 5GHz for throughput)
- VPN tunnel from site to BCR TechMedix cloud for telemetry

**TechMedix Integration Points:**
- REST API for work order creation from ERP systems (SAP, Oracle)
- Webhook callbacks on P1 alert creation for third-party PagerDuty integration
- CSV telemetry export for custom analytics pipelines
- SSO via SAML 2.0 for enterprise identity providers

### Multi-Site Fleet Management

- Designate a primary Systems Engineer per site for L1/L2 oversight
- Use TechMedix region grouping for site-level fleet health views
- Establish inter-site spare parts sharing protocol to reduce EOQ per site

---

## Section 2: Weibull Failure Analysis

Weibull analysis models failure rate variation over a component's life, distinguishing infant mortality, steady-state operation, and wear-out.

### Weibull Distribution Parameters

- Beta (shape parameter): < 1 = infant mortality (failure rate decreasing), = 1 = constant failure rate, > 1 = wear-out (failure rate increasing)
- Eta (scale parameter, characteristic life): time at which 63.2% of units have failed

### Interpreting Beta for Maintenance Strategy

- Beta < 1 (e.g., 0.6): failures concentrated at start — improve incoming inspection, burn-in testing
- Beta = 1 (exponential): random failures — time-based replacement doesn't help; condition monitoring is more efficient
- Beta > 1 (e.g., 2.5): wear-out — schedule time-based replacement before eta, proactive lubrication and inspection

### Weibull Plot Construction

1. Order failure times from smallest to largest
2. Calculate median rank for each failure: (i - 0.3) / (n + 0.4) where i = rank, n = sample size
3. Plot log(failure time) vs. log(-log(1 - median rank)) on Weibull probability paper
4. Fit a line — slope = beta, intercept gives eta

---

## Section 3: EOQ — Spare Parts Optimization

Economic Order Quantity minimizes total inventory cost (holding cost + ordering cost).

### EOQ Formula

```
EOQ = sqrt( (2 * D * S) / H )
```
Where:
- D = annual demand (units/year)
- S = ordering cost per order ($)
- H = annual holding cost per unit ($/unit/year)

Example (G1 knee actuator seal kit):
- D = 48 seal kits/year (fleet of 8 robots, quarterly seal service per robot, 1.5 kits average)
- S = $85 ordering cost (shipping, admin, receiving)
- H = $28/year (20% of $140 unit cost)
- EOQ = sqrt((2 * 48 * 85) / 28) = sqrt(8160/28) = sqrt(291.4) = 17.1 ≈ 17 units per order

Order 17 seal kits per order, approximately every 130 days.

### Safety Stock

Safety stock protects against demand spikes and supplier lead time variation:
```
Safety Stock = Z * sigma_d * sqrt(lead_time_days)
```
Where Z = 1.65 for 95% service level, sigma_d = standard deviation of daily demand.

---

## Section 4: Team Leadership

### Technician Development

L4 Systems Engineers supervise L1/L2 field teams:
- Conduct monthly 1:1 check-ins reviewing job completion quality and training progress
- Review L1 work orders randomly (1 in 10) for quality assurance
- Issue escalation authority to L2 technicians for clearly defined fault categories
- Document training hours in TechMedix technician profiles

### Job Escalation Decision Framework

| Criteria | Action |
|---|---|
| L1 finds defect beyond visual inspection | Escalate to L2 |
| L2 finds fault requiring multi-platform expertise | Escalate to L3 |
| FMEA RPN > 500 | Escalate to L4 immediately |
| Severity >= 9 | Escalate to L4 and BCR engineering |
| Legal/safety incident | Escalate to BCR ops immediately |

### Team Briefings

Standard pre-job briefing for L1/L2 teams:
- Robot ID, current fault codes, battery SoC
- Active P1/P2 alerts and their history
- Site-specific safety notes
- Parts available on-site or ordered
- Expected job duration and escalation criteria

---

## Section 5: Enterprise Integrations

### ERP Integration via TechMedix API

Work order creation from SAP Plant Maintenance:
- SAP PM notification triggers TechMedix webhook
- TechMedix auto-creates work order with robot ID, fault description, priority
- On work order completion, TechMedix posts result back to SAP PM via REST

### Billing Integration

Enterprise accounts use purchase order-based billing:
- Each work order references a PO number
- Monthly invoice generated from TechMedix billing module
- Job value calculated: base rate * level multiplier + parts at cost + 15% handling

### Compliance Reporting

Enterprise customers require:
- Monthly fleet health reports (auto-generated from TechMedix)
- Quarterly FMEA review meeting
- Annual technician certification audit (all active technicians must hold current cert)
- ISO 10218 Part 2 compliance documentation for each robot installation

ISO 10218 Part 2 covers robot system integration requirements. L4 engineers must be familiar with risk assessment requirements and how TechMedix telemetry supports ongoing compliance.
