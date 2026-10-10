# SOP-ENG-204-REV-E: Standard Operating Procedure for Hydrocracker Reactor R-204

## Document Control & Governance
- **Document Number:** SOP-ENG-204-REV-E
- **Security Classification:** INTERNAL
- **Governing Standard:** OSHA 1910.119 PSM / ASME Section VIII Division 1 / API RP 520
- **Target Assets:** R-204 (CSTR Hydrocracker), P-201A/B (Feed Slurry Pumps), E-301 (Effluent Cooler)
- **Effective Date:** 2026-08-15
- **Next Mandatory Review:** 2028-08-14
- **Approved By:** Dr. V. Rajan, PE (VP Engineering & Reliability)

---

## 1. Operating Envelope & Trip Limits (Safe Operating Limits - SOL)

All operators and automated control loops must maintain operations strictly within the following envelopes:

| Process Parameter | Monitored Tag | Normal Operating Baseline | High Alarm (LAH/PAH/TAH) | Emergency Trip Setpoint (ESD-01) |
|---|---|---|---|---|
| Vessel Head Pressure | PT-204A / PT-204B | 31.2 bar gauge | 33.5 bar gauge | **35.0 bar gauge** |
| Local Bourdon Indication | PI-204 | 31.2 bar gauge | 33.0 bar gauge (Visual) | 35.0 bar gauge |
| Maximum Allowable Working P | R-204 Shell | 42.5 bar gauge (MAWP) | 42.8 bar gauge (Relief Lift) | **43.0 bar gauge** |
| Catalyst Bed 1 Temperature | TT-204A | 398.0 °C | 418.0 °C | 440.0 °C |
| Catalyst Bed 2 Temperature | TT-204B | 412.5 °C | 425.0 °C | 440.0 °C |
| Bed 1 Exotherm Differential | Delta-T (TT-204A) | 32.4 °C | 38.0 °C | 45.0 °C (Quench Trip) |
| Secondary Quench Flow Rate | FT-204 | 294 L/min | 275 L/min (Low Flow) | 260 L/min (Permissive Trip) |
| Thermal Heating/Cooling Ramp | Vessel Skin | < 20.0 °C / hour | 25.0 °C / hour | > 25.0 °C / hour (Cladding Risk) |

---

## 2. Step-by-Step Normal Pressurization & Startup Sequence

### Phase A: Atmospheric Inerting & Leak Tightness Proof
1. Confirm nitrogen (N2) purge loop is active. Verify effluent oxygen content via GC-101 is `< 0.10% by volume`.
2. Confirm dewpoint of vessel atmosphere is below `-40.0 °C`.
3. Pressurize R-204 vessel to `5.0 bar gauge` using dry utility nitrogen. Perform acoustic ultrasonic leak detection on all manway flanges and nozzle N-1/N-2 gasket joints. Zero bubbling or acoustic emission permitted.

### Phase B: Hydrogen Circulation & Warm-Up
4. Align feed effluent path through Shell & Tube Exchanger `E-301`.
5. Establish hydrogen gas circulation loop using Recycle Compressor `C-201` at `15.0 bar gauge`.
6. Initiate preheater firing at a controlled ramp rate strictly below `20.0 °C/hour`.
7. Once reactor bed temperature reaches `320.0 °C`, raise system pressure in 5.0 bar increments to the normal operating baseline of `31.2 bar gauge`.

### Phase C: Hydrocarbon Slurry Introduction
8. Start Slurry Feed Pump `P-201A` on minimum spillback recirculation flow.
9. Open feed block valve `XV-204A` and ramp catalyst feed slurry slowly to design space (240 m³/hr).
10. Confirm quench control valve `QCV-204A` modulates smoothly to maintain secondary quench flow above `280 L/min`.

---

## 3. Emergency Response Protocols

### Condition Alpha: High Pressure Exotherm (>33.5 bar gauge)
1. Verify agreement between redundant pressure transmitters `PT-204A` and `PT-204B`. If variance exceeds `0.5 bar`, flag sensor deviation.
2. Maximize hydrogen quench flow via `QCV-204A` to 350 L/min to quench the exotherm.
3. If pressure exceeds `35.0 bar gauge`, Emergency Shutdown `ESD-01` trips automatically:
   - Trip feed pump `P-201A/B` immediately.
   - Close reactor isolation valves `XV-204A` and `XV-204B`.
   - Modulate blowdown valve `BDV-204` to depressurize reactor to flare header at `2.0 bar/minute`.

### Condition Beta: Multilingual Emergency Directives
- **ENGLISH:** Critical Safety Limit: Do not exceed 42.5 BAR. Immediately isolate valve HV-204 and notify the shift supervisor if pressure exceeds 42.8 BAR.
- **HINDI (हिंदी):** महत्वपूर्ण सुरक्षा सीमा: रिएक्टर परिचालन दबाव 42.5 BAR से अधिक न होने दें। यदि दबाव 42.8 BAR से अधिक हो जाए, तो तुरंत वाल्व HV-204 बंद करें और शिफ्ट सुपरवाइजर को सूचित करें।
- **KANNADA (ಕನ್ನಡ):** ನಿರ್ಣಾಯಕ ಸುರಕ್ಷತಾ ಮಿತಿ: ರಿಯಾಕ್ಟರ್‌ ಕಾರ್ಯಾಚರಣೆಯ ಒತ್ತಡವು 42.5 BAR ಮೀರುವುದನ್ನು ತಡೆಯಿರಿ. ಒತ್ತಡವು 42.8 BAR ಮೀರಿದರೆ, ತಕ್ಷಣ ವಾಲ್ವ್‌ HV-204 ಅನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ ಮತ್ತು ಪಾಳಿ ಮೇಲ್ವಿಚಾರಕರಿಗೆ ತಿಳಿಸಿ.
