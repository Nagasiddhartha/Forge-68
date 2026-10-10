# SOP-ROT-201-REV-C: Centrifugal Feed Pump P-201A/B Cavitation & Auto-Switchover

## Document Control & Governance
- **Document Number:** SOP-ROT-201-REV-C
- **Security Classification:** INTERNAL
- **Governing Standard:** API 610 (Centrifugal Pumps for Petroleum) / ISO 10816-3 (Vibration Severity)
- **Target Assets:** P-201A (Primary Slurry Feed Pump), P-201B (Standby Slurry Feed Pump)
- **Effective Date:** 2026-09-05

---

## 1. Machinery Baseline & Vibration Envelopes (ISO 10816-3 Group 1)

| Operating Zone | Drive-End Vibration (mm/s RMS) | Bearing Temp (°C) | Suction Strainer DP (bar) | Action Required |
|---|---|---|---|---|
| **Zone A (New/Good)** | 0.0 - 2.80 mm/s | 45.0 - 65.0 °C | < 0.15 bar | Unrestricted continuous operation. |
| **Zone B (Acceptable)**| 2.81 - 4.50 mm/s | 65.1 - 75.0 °C | 0.15 - 0.25 bar | Monitor at 4-hour shift logs. |
| **Zone C (Warning)**   | 4.51 - 7.10 mm/s | 75.1 - 85.0 °C | 0.26 - 0.35 bar | Inspect for cavitation; schedule P-201B switch. |
| **Zone D (Trip/Hazard)**| **> 7.10 mm/s** | **> 85.0 °C** | **> 0.35 bar** | Immediate auto-switchover to P-201B; trip P-201A. |

---

## 2. Cavitation Diagnostic Indicators
- High-frequency metallic cracking acoustics in suction casing (NPSHa < NPSHr).
- Discharge pressure oscillations exceeding `± 1.2 bar`.
- Suction strainer differential pressure `PDT-201` spiking above `0.30 bar` due to catalyst fines accumulation.

---

## 3. Seamless Auto-Switchover Sequence (P-201A to P-201B)
1. Verify Standby Pump `P-201B` seal flush buffer fluid pressure is maintained at `4.0 bar gauge`.
2. Crack open P-201B minimum warm-up recirculation bypass valve `V-201B-W` to equalize thermal casing temperature to within `15.0 °C` of process stream.
3. Start electric motor driver for `P-201B`. Allow discharge pressure to establish at `48.5 bar gauge`.
4. Open P-201B discharge control valve while simultaneously throttling P-201A discharge valve over a synchronized `45-second ramp` to eliminate pressure surges to Reactor R-204.
5. Trip motor on `P-201A`. Apply Lockout/Tagout (LOTO) for mechanical seal and bearing inspection.
