# SOP-EXCH-301-REV-D: Emergency Protocol for Loss of Effluent Cooling on Exchanger E-301

## Document Control & Governance
- **Document Number:** SOP-EXCH-301-REV-D
- **Security Classification:** INTERNAL
- **Governing Standard:** TEMA Standards Class R / API 660 (Shell-and-Tube Exchangers)
- **Target Assets:** E-301 (Reactor Effluent Shell-and-Tube Exchanger), V-102 (Flash Drum)
- **Effective Date:** 2026-08-01

---

## 1. Thermal Envelope & Heat Duty Specifications
- **Design Thermal Duty:** 8.4 MW
- **Hot Shell-Side Process Stream:** 412.0 °C Inlet / 185.0 °C Outlet (Effluent to Flash Drum V-102)
- **Cold Tube-Side Cooling Water:** 28.0 °C Supply / 42.0 °C Return
- **Design Shell Pressure:** 45.0 bar gauge
- **Normal Operating Efficiency Baseline:** 94.2% of design thermal exchange.

---

## 2. Cooling Water Failure & Exotherm Mitigation
1. If cooling water supply flow `FT-301` drops below `1200 m³/hr` or return temperature `TT-301B` exceeds `55.0 °C`:
   - Sound Plant Sector 4 Acoustic Alarm.
   - Automatically reduce preheater firing on Reactor R-204 by 30%.
   - Open auxiliary emergency cooling valve `CW-EM-301` within 60 seconds.
2. If tube sheet leakage is detected via online conductivity sensor `AT-301` (> 50 µS/cm):
   - Immediate sovereign interlock halts feed pump P-201 to prevent high-pressure flammable hydrocarbon breach into cooling tower.
