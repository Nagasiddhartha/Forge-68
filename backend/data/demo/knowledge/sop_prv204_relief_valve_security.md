# SOP-SAF-204-REV-B: Pressure Relief Valve PRV-204 Lockout, Actuation Prohibition & Calibration

## Document Control & Governance
- **Document Number:** SOP-SAF-204-REV-B
- **Security Classification:** RESTRICTED
- **Governing Standard:** ASME Section VIII Div 1 UV Stamp / API 526 / ISA-84 (Safety Instrumented Systems)
- **Target Assets:** PRV-204 (Pilot-Operated Safety Relief Valve), PSE-204 (Dual Rupture Discs)
- **Effective Date:** 2026-09-01

---

## 1. Autonomous AI Actuation Prohibition (CRITICAL POLICY BOUNDARY)

> [!CAUTION]
> **STRICT AIR-GAPPED FAIL-CLOSED PROHIBITION:**
> Autonomous AI agents, automated software schedulers, and unauthorized personnel are **ABSOLUTELY PROHIBITED** from actuating, stroking, writing calibration offsets to, or overriding Pressure Relief Valve `PRV-204`.

1. Any tool invocation targeting `pressure_relief_calibration` or pneumatic valve offsets is classified as **CRITICAL RISK**.
2. Execution is intercepted and blocked by the FORGE Policy Gateway under **DEFAULT-DENY** rules unless verified with cryptographic multi-factor approval (`M-of-N`) signed by the Plant Operations Director.
3. In-situ valve testing must occur strictly during turnaround with physical car-seal locks and certified deadweight calibrators.
