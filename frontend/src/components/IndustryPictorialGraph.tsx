"use client";

import React, { useState } from "react";
import { DemoScenarioId, AgentQueryResponse, DemoRunResponse } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { EnamelSurface, BrassLabel } from "./primitives";

interface IndustryPictorialGraphProps {
  activeScenarioId?: DemoScenarioId | null;
  response?: AgentQueryResponse | DemoRunResponse | null;
}

interface EquipmentNodeData {
  id: string;
  name: string;
  type: string;
  status: "OPERATIONAL" | "MAINTENANCE_REQUIRED" | "ALERT" | "ARMED";
  statusColor: string;
  pressure?: string;
  temperature?: string;
  flow?: string;
  vibration?: string;
  thickness?: string;
  setpoint?: string;
  lastInspection: string;
  sopRef: string;
  recentMaintenance: string;
  notes: string;
}

export function IndustryPictorialGraph({
  activeScenarioId,
  response,
}: IndustryPictorialGraphProps) {
  const { t, language } = useTranslation();
  const [selectedEquipment, setSelectedEquipment] = useState<string>("R-204");
  const [viewMode, setViewMode] = useState<"TOPOLOGY" | "BLUEPRINT">("TOPOLOGY");
  const [isFlowActive, setIsFlowActive] = useState<boolean>(true);

  // Dynamic values grounded in scenario context
  const isPressureVariance = activeScenarioId === "r204_pressure_variance";
  const isPolicyDenied = activeScenarioId === "policy_denial";
  const isSecurityAdversarial = activeScenarioId === "prompt_injection";

  const r204Pressure = isPressureVariance ? "33.0 bar" : "31.4 bar";
  const r204PressureStatus = isPressureVariance ? "ALERT" : "OPERATIONAL";

  const equipmentMap: Record<string, EquipmentNodeData> = {
    "T-102": {
      id: "T-102",
      name: language === "hi" ? "फीड भंडारण पोत" : language === "kn" ? "ಫೀಡ್ ಶೇಖರಣಾ ತೊಟ್ಟಿ" : "Feed Storage Vessel",
      type: "Atmospheric Vertical Storage Tank",
      status: "OPERATIONAL",
      statusColor: "var(--sage)",
      flow: "120.5 m³/h",
      pressure: "1.02 bar",
      temperature: "24.5 °C",
      lastInspection: "2026-05-18",
      sopRef: "SOP-T102-REV2",
      recentMaintenance: "Internal roof inspection and level sensor recalibration (Nominal).",
      notes: "Suction head provider for slurry pump P-201. Level currently at 84.5% nominal capacity.",
    },
    "P-201": {
      id: "P-201",
      name: language === "hi" ? "अपघರ್ಷक स्लरी फीड पंप" : language === "kn" ? "ಸ್ಲರಿ ಫೀಡ್ ಪಂಪ್" : "Centrifugal Slurry Feed Pump",
      type: "API 610 Heavy Duty Slurry Pump",
      status: "MAINTENANCE_REQUIRED",
      statusColor: "var(--coral)",
      flow: "120.5 m³/h",
      pressure: "36.2 bar (Discharge)",
      vibration: "7.2 mm/s RMS (High)",
      temperature: "48.2 °C (Bearing DE)",
      lastInspection: "2026-09-02",
      sopRef: "SOP-P201-REV3",
      recentMaintenance: "MNT-2026-088: Drive-end bearing high vibration detected. Grease replenished.",
      notes: "Critical path slurry pump with cavitation wear. Standby cold unit P-202 available on demand.",
    },
    "R-204": {
      id: "R-204",
      name: language === "hi" ? "सतत स्टिरर्ड-टैंक रिएक्टर (CSTR)" : language === "kn" ? "ಪ್ರಮುಖ ರಿಯಾಕ್ಟರ್ (CSTR)" : "Continuous Stirred-Tank Reactor",
      type: "High-Pressure Hydrocracker / Polymerizer",
      status: r204PressureStatus,
      statusColor: isPressureVariance ? "var(--coral)" : "var(--sage)",
      pressure: r204Pressure,
      temperature: "220.0 °C",
      thickness: "72.8 mm (Min: 70.0 mm)",
      lastInspection: "2026-08-14",
      sopRef: "SOP-R204-REV4",
      recentMaintenance: "MNT-2026-014: Ultrasonic wall survey confirmed 72.8 mm shell thickness (Nominal).",
      notes: "Primary reaction vessel. Design rating 16.5 bar design baseline, 42.5 bar relief ceiling. Agitator speed 185 RPM.",
    },
    "PRV-204": {
      id: "PRV-204",
      name: language === "hi" ? "आपातकालीन दबाव राहत वाल्व" : language === "kn" ? "ತುರ್ತು ಒತ್ತಡ ಪರಿಹಾರ ವಾಲ್ವ್" : "Emergency Pressure Relief Valve",
      type: "Spring-Loaded Angle Safety Relief Valve",
      status: isPolicyDenied ? "ALERT" : "ARMED",
      statusColor: isPolicyDenied ? "var(--coral)" : "var(--brass)",
      setpoint: "42.5 bar gauge",
      pressure: "31.4 bar (Inlet)",
      lastInspection: "2026-08-20",
      sopRef: "SOP-PRV204-REV1",
      recentMaintenance: "MNT-2025-091: Bench tested at 42.5 bar gauge. Bubble-tight seat seal verified.",
      notes: "Actuation strictly governed by Policy POL-CRIT-002. Requires supervisor co-signature.",
    },
    "E-301": {
      id: "E-301",
      name: language === "hi" ? "अपशिष्ट ताप विनिमायक कूलर" : language === "kn" ? "ಶಾಖ ವಿನಿಮಯಕಾರಕ (ಕೂಲರ್)" : "Shell & Tube Effluent Cooler",
      type: "TEMA Type AES Heat Exchanger",
      status: "OPERATIONAL",
      statusColor: "var(--sage)",
      pressure: "28.6 bar (Tube side)",
      temperature: "68.4 °C (Outlet)",
      lastInspection: "2026-07-28",
      sopRef: "SOP-E301-REV2",
      recentMaintenance: "MNT-2026-071: Helium leak detection verified zero tube sheet bypass. Cleaned.",
      notes: "Cools reactor effluent stream before separation. Thermal duty efficiency at 94.2% of design baseline.",
    },
    "V-102": {
      id: "V-102",
      name: language === "hi" ? "फ्लैश विभाजक ड्रम" : language === "kn" ? "ಫ್ಲ್ಯಾಶ್ ಪ್ರತ್ಯೇಕಕ ಡ್ರಮ್" : "High-Pressure Flash Separator Drum",
      type: "Two-Phase Vapor/Liquid Knockout Drum",
      status: "OPERATIONAL",
      statusColor: "var(--sage)",
      pressure: "14.2 bar",
      temperature: "65.1 °C",
      flow: "Liquid: 114.2 m³/h",
      lastInspection: "2026-08-10",
      sopRef: "SOP-V102-REV1",
      recentMaintenance: "MNT-2026-055: Level transmitter LT-102 wet calibration verified against sight glass.",
      notes: "Demister pad nominal. Vapor overhead routes to fuel gas; liquid effluent routes to distillation column C-401.",
    },
  };

  const selectedData = equipmentMap[selectedEquipment] || equipmentMap["R-204"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Control Banner */}
      <div
        style={{
          background: "var(--bg-0)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-panel)",
          padding: "16px 20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "16px" }}>🏭</span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "17px",
                fontWeight: 600,
                color: "var(--ink)",
              }}
            >
              {t("pictorialGraphTitle")}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(156, 195, 168, 0.12)",
                border: "1px solid var(--sage)",
                color: "var(--sage)",
              }}
            >
              {language === "hi" ? "सत्यापित संयंत्र टोपोलॉजी" : language === "kn" ? "ಪರಿಶೀಲಿಸಿದ ಘಟಕ ಟೋಪೋಲಜಿ" : "VERIFIED PLANT TOPOLOGY"}
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "12.5px",
              color: "var(--ink-2)",
              marginTop: 4,
            }}
          >
            {t("pictorialGraphSubtitle")}
          </div>
        </div>

        {/* View Switcher Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setIsFlowActive(!isFlowActive)}
            style={{
              background: isFlowActive ? "var(--bg-2)" : "transparent",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-pill)",
              padding: "5px 12px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: isFlowActive ? "var(--brass)" : "var(--ink-3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isFlowActive ? "var(--sage)" : "var(--mist)",
              }}
            />
            {isFlowActive
              ? (language === "hi" ? "प्रवाह सक्रिय" : language === "kn" ? "ಹರಿವು ಸಕ್ರಿಯ" : "FLOW ANIMATION ON")
              : (language === "hi" ? "प्रवाह रुका" : language === "kn" ? "ಹರಿವು ಸ್ಥಗಿತ" : "FLOW PAUSED")}
          </button>

          <div
            style={{
              display: "flex",
              background: "var(--bg-1)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-pill)",
              padding: "2px",
            }}
          >
            <button
              onClick={() => setViewMode("TOPOLOGY")}
              style={{
                background: viewMode === "TOPOLOGY" ? "var(--brass)" : "transparent",
                color: viewMode === "TOPOLOGY" ? "#000" : "var(--ink-2)",
                border: "none",
                borderRadius: "var(--radius-pill)",
                padding: "4px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: viewMode === "TOPOLOGY" ? 700 : 500,
                cursor: "pointer",
                transition: "all var(--dur-fast) var(--ease-out)",
              }}
            >
              {language === "hi" ? "टोपोलॉजी आरेख" : language === "kn" ? "ಟೋಪೋಲಜಿ ಗ್ರಾಫ್" : "TOPOLOGY FLOW"}
            </button>
            <button
              onClick={() => setViewMode("BLUEPRINT")}
              style={{
                background: viewMode === "BLUEPRINT" ? "var(--brass)" : "transparent",
                color: viewMode === "BLUEPRINT" ? "#000" : "var(--ink-2)",
                border: "none",
                borderRadius: "var(--radius-pill)",
                padding: "4px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: viewMode === "BLUEPRINT" ? 700 : 500,
                cursor: "pointer",
                transition: "all var(--dur-fast) var(--ease-out)",
              }}
            >
              {language === "hi" ? "P&ID ब्लूप्रिंट" : language === "kn" ? "P&ID ಬ್ಲೂಪ್ರಿಂಟ್" : "P&ID BLUEPRINT"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Display */}
      {viewMode === "TOPOLOGY" ? (
        <div
          style={{
            background: "var(--bg-0)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-panel)",
            padding: "24px 20px",
            position: "relative",
            overflowX: "auto",
          }}
        >
          {/* Active Mission Alert Banner inside graph */}
          {isPressureVariance && (
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 20,
                background: "rgba(217, 105, 78, 0.15)",
                border: "1px solid var(--coral)",
                borderRadius: "var(--radius-sm)",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                zIndex: 10,
              }}
            >
              <span style={{ fontSize: "12px" }}>⚠️</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--coral-text)", fontWeight: 600 }}>
                {language === "hi"
                  ? "सक्रिय टेलीमेट्री विचलन: R-204 दबाव 33.0 bar (SOP सीमा 31.2 bar से अधिक)"
                  : language === "kn"
                  ? "ಸಕ್ರಿಯ ಟೆಲಿಮೆಟ್ರಿ ವ್ಯತ್ಯಾಸ: R-204 ಒತ್ತಡ 33.0 bar (SOP ಮಿತಿ 31.2 bar ಮೀರಿದೆ)"
                  : "ACTIVE VARIANCE: R-204 Pressure at 33.0 bar (Exceeds SOP Limit 31.2 bar)"}
              </span>
            </div>
          )}

          {/* Interactive SVG Flow Diagram */}
          <div style={{ minWidth: 860, margin: "0 auto", padding: "20px 0" }}>
            <svg
              viewBox="0 0 920 380"
              style={{ width: "100%", height: "auto", overflow: "visible" }}
            >
              <defs>
                {/* Flow dash animation style */}
                <style>
                  {`
                    @keyframes flowDash {
                      to {
                        stroke-dashoffset: -32;
                      }
                    }
                    .active-pipe-flow {
                      stroke-dasharray: 8 8;
                      animation: ${isFlowActive ? "flowDash 1.2s linear infinite" : "none"};
                    }
                    .pulse-ring {
                      animation: pulseGlow 2s ease-out infinite;
                    }
                    @keyframes pulseGlow {
                      0% { opacity: 0.8; transform: scale(0.98); }
                      50% { opacity: 0.3; transform: scale(1.05); }
                      100% { opacity: 0.8; transform: scale(0.98); }
                    }
                  `}
                </style>
                {/* Marker arrow heads */}
                <marker
                  id="flow-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--brass)" />
                </marker>
                <marker
                  id="relief-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--coral)" />
                </marker>
              </defs>

              {/* PIPELINE CONNECTIONS (Ground Process Flow) */}
              {/* Pipe 1: T-102 to P-201 */}
              <line
                x1="120"
                y1="200"
                x2="230"
                y2="200"
                stroke="var(--brass)"
                strokeWidth="4"
                className="active-pipe-flow"
                markerEnd="url(#flow-arrow)"
              />
              <text x="175" y="190" textAnchor="middle" fill="var(--ink-3)" fontSize="10" fontFamily="var(--font-mono)">
                120.5 m³/h
              </text>

              {/* Pipe 2: P-201 to R-204 */}
              <line
                x1="310"
                y1="200"
                x2="420"
                y2="200"
                stroke="var(--brass)"
                strokeWidth="4"
                className="active-pipe-flow"
                markerEnd="url(#flow-arrow)"
              />
              <text x="365" y="190" textAnchor="middle" fill="var(--ink-3)" fontSize="10" fontFamily="var(--font-mono)">
                HP FEED
              </text>

              {/* Pipe 3: R-204 upward relief to PRV-204 */}
              <line
                x1="480"
                y1="140"
                x2="480"
                y2="75"
                stroke={isPressureVariance ? "var(--coral)" : "var(--brass)"}
                strokeWidth="3.5"
                className="active-pipe-flow"
                markerEnd="url(#relief-arrow)"
              />
              <text x="525" y="105" textAnchor="start" fill="var(--coral-text)" fontSize="9.5" fontFamily="var(--font-mono)">
                RELIEF (42.5 bar)
              </text>

              {/* Pipe 4: R-204 to E-301 */}
              <line
                x1="540"
                y1="200"
                x2="650"
                y2="200"
                stroke="var(--brass)"
                strokeWidth="4"
                className="active-pipe-flow"
                markerEnd="url(#flow-arrow)"
              />
              <text x="595" y="190" textAnchor="middle" fill="var(--ink-3)" fontSize="10" fontFamily="var(--font-mono)">
                EFFLUENT (220°C)
              </text>

              {/* Pipe 5: E-301 to V-102 */}
              <line
                x1="730"
                y1="200"
                x2="810"
                y2="200"
                stroke="var(--brass)"
                strokeWidth="4"
                className="active-pipe-flow"
                markerEnd="url(#flow-arrow)"
              />
              <text x="770" y="190" textAnchor="middle" fill="var(--ink-3)" fontSize="10" fontFamily="var(--font-mono)">
                COOLED (68°C)
              </text>

              {/* Pipe 6: V-102 gas overhead */}
              <path
                d="M 850 140 L 850 80 L 900 80"
                fill="none"
                stroke="var(--ink-3)"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                markerEnd="url(#flow-arrow)"
              />
              <text x="880" y="72" fill="var(--ink-3)" fontSize="9" fontFamily="var(--font-mono)">
                FUEL GAS
              </text>

              {/* ============================================================== */}
              {/* EQUIPMENT NODE 1: T-102 (FEED STORAGE VESSEL) */}
              {/* ============================================================== */}
              <g
                onClick={() => setSelectedEquipment("T-102")}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x="50"
                  y="140"
                  width="70"
                  height="120"
                  rx="6"
                  fill={selectedEquipment === "T-102" ? "var(--bg-3)" : "var(--bg-1)"}
                  stroke={selectedEquipment === "T-102" ? "var(--brass)" : "var(--line-strong)"}
                  strokeWidth={selectedEquipment === "T-102" ? "2.5" : "1.5"}
                />
                {/* Liquid level wave */}
                <rect x="52" y="165" width="66" height="93" rx="4" fill="rgba(200, 161, 90, 0.15)" />
                <text x="85" y="180" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="700" fontFamily="var(--font-mono)">
                  T-102
                </text>
                <text x="85" y="198" textAnchor="middle" fill="var(--ink-3)" fontSize="9.5" fontFamily="var(--font-ui)">
                  Feed Tank
                </text>
                <text x="85" y="245" textAnchor="middle" fill="var(--sage)" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)">
                  84.5% LVL
                </text>
              </g>

              {/* ============================================================== */}
              {/* EQUIPMENT NODE 2: P-201 (SLURRY FEED PUMP) */}
              {/* ============================================================== */}
              <g
                onClick={() => setSelectedEquipment("P-201")}
                style={{ cursor: "pointer" }}
              >
                {/* Pump casing circle */}
                <circle
                  cx="270"
                  cy="200"
                  r="38"
                  fill={selectedEquipment === "P-201" ? "var(--bg-3)" : "var(--bg-1)"}
                  stroke={selectedEquipment === "P-201" ? "var(--brass)" : "var(--coral)"}
                  strokeWidth={selectedEquipment === "P-201" ? "2.5" : "2"}
                />
                {/* Impeller triangle symbol */}
                <polygon
                  points="270,175 295,215 245,215"
                  fill="none"
                  stroke="var(--coral)"
                  strokeWidth="2"
                />
                <text x="270" y="205" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="700" fontFamily="var(--font-mono)">
                  P-201
                </text>
                {/* Status pill below */}
                <rect x="230" y="248" width="80" height="20" rx="10" fill="rgba(217, 105, 78, 0.15)" stroke="var(--coral)" strokeWidth="1" />
                <text x="270" y="262" textAnchor="middle" fill="var(--coral-text)" fontSize="9" fontWeight="700" fontFamily="var(--font-mono)">
                  7.2 mm/s VIB
                </text>
              </g>

              {/* ============================================================== */}
              {/* EQUIPMENT NODE 3: R-204 (CSTR REACTOR VESSEL - CENTERPIECE) */}
              {/* ============================================================== */}
              <g
                onClick={() => setSelectedEquipment("R-204")}
                style={{ cursor: "pointer" }}
              >
                {/* Highlight aura if active */}
                {(selectedEquipment === "R-204" || isPressureVariance) && (
                  <rect
                    x="410"
                    y="130"
                    width="140"
                    height="170"
                    rx="14"
                    fill="none"
                    stroke={isPressureVariance ? "var(--coral)" : "var(--brass)"}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.7"
                  />
                )}
                {/* Reactor Body */}
                <rect
                  x="420"
                  y="140"
                  width="120"
                  height="150"
                  rx="10"
                  fill={selectedEquipment === "R-204" ? "var(--bg-3)" : "var(--bg-1)"}
                  stroke={isPressureVariance ? "var(--coral)" : selectedEquipment === "R-204" ? "var(--brass)" : "var(--line-strong)"}
                  strokeWidth={isPressureVariance ? "3" : "2"}
                />
                {/* Top Dome & Agitator motor */}
                <path d="M 430 140 Q 480 120 530 140" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
                <rect x="468" y="115" width="24" height="25" rx="3" fill="var(--bg-2)" stroke="var(--brass)" strokeWidth="1.5" />
                {/* Agitator shaft */}
                <line x1="480" y1="140" x2="480" y2="240" stroke="var(--ink-3)" strokeWidth="2.5" />
                {/* Impeller blades */}
                <line x1="455" y1="230" x2="505" y2="230" stroke="var(--ink-2)" strokeWidth="3" />
                <line x1="460" y1="210" x2="500" y2="210" stroke="var(--ink-2)" strokeWidth="2.5" />

                {/* Tag label */}
                <text x="480" y="172" textAnchor="middle" fill="var(--ink)" fontSize="16" fontWeight="700" fontFamily="var(--font-mono)">
                  R-204
                </text>
                <text x="480" y="188" textAnchor="middle" fill="var(--ink-3)" fontSize="10.5" fontFamily="var(--font-ui)">
                  CSTR Reactor
                </text>

                {/* Live Gauge PI-204 Callout Badge */}
                <g transform="translate(425, 252)">
                  <rect
                    x="0"
                    y="0"
                    width="110"
                    height="26"
                    rx="13"
                    fill={isPressureVariance ? "rgba(217, 105, 78, 0.25)" : "rgba(156, 195, 168, 0.15)"}
                    stroke={isPressureVariance ? "var(--coral)" : "var(--sage)"}
                    strokeWidth="1.5"
                  />
                  <text x="55" y="17" textAnchor="middle" fill={isPressureVariance ? "var(--coral-text)" : "var(--sage)"} fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
                    PI-204: {r204Pressure}
                  </text>
                </g>
              </g>

              {/* ============================================================== */}
              {/* EQUIPMENT NODE 4: PRV-204 (SAFETY RELIEF VALVE) */}
              {/* ============================================================== */}
              <g
                onClick={() => setSelectedEquipment("PRV-204")}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx="480"
                  cy="50"
                  r="24"
                  fill={selectedEquipment === "PRV-204" ? "var(--bg-3)" : "var(--bg-1)"}
                  stroke={selectedEquipment === "PRV-204" ? "var(--brass)" : "var(--line-strong)"}
                  strokeWidth="2"
                />
                {/* Valve bow-tie icon */}
                <polygon points="468,42 492,42 480,50" fill="var(--brass)" />
                <polygon points="468,58 492,58 480,50" fill="var(--brass)" />
                <text x="480" y="32" textAnchor="middle" fill="var(--ink)" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
                  PRV-204
                </text>
              </g>

              {/* ============================================================== */}
              {/* EQUIPMENT NODE 5: E-301 (HEAT EXCHANGER / COOLER) */}
              {/* ============================================================== */}
              <g
                onClick={() => setSelectedEquipment("E-301")}
                style={{ cursor: "pointer" }}
              >
                {/* Exchanger shell */}
                <rect
                  x="650"
                  y="160"
                  width="80"
                  height="80"
                  rx="8"
                  fill={selectedEquipment === "E-301" ? "var(--bg-3)" : "var(--bg-1)"}
                  stroke={selectedEquipment === "E-301" ? "var(--brass)" : "var(--line-strong)"}
                  strokeWidth="2"
                />
                {/* Tube bundle lines */}
                <line x1="660" y1="185" x2="720" y2="185" stroke="var(--line-strong)" strokeWidth="1.5" />
                <line x1="660" y1="200" x2="720" y2="200" stroke="var(--line-strong)" strokeWidth="1.5" />
                <line x1="660" y1="215" x2="720" y2="215" stroke="var(--line-strong)" strokeWidth="1.5" />
                <text x="690" y="178" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="700" fontFamily="var(--font-mono)">
                  E-301
                </text>
                <text x="690" y="232" textAnchor="middle" fill="var(--sage)" fontSize="9.5" fontWeight="600" fontFamily="var(--font-mono)">
                  94.2% DUTY
                </text>
              </g>

              {/* ============================================================== */}
              {/* EQUIPMENT NODE 6: V-102 (SEPARATOR DRUM) */}
              {/* ============================================================== */}
              <g
                onClick={() => setSelectedEquipment("V-102")}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x="810"
                  y="145"
                  width="65"
                  height="110"
                  rx="16"
                  fill={selectedEquipment === "V-102" ? "var(--bg-3)" : "var(--bg-1)"}
                  stroke={selectedEquipment === "V-102" ? "var(--brass)" : "var(--line-strong)"}
                  strokeWidth="2"
                />
                <line x1="815" y1="210" x2="870" y2="210" stroke="var(--brass)" strokeWidth="1" strokeDasharray="2 2" />
                <text x="842" y="180" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="700" fontFamily="var(--font-mono)">
                  V-102
                </text>
                <text x="842" y="196" textAnchor="middle" fill="var(--ink-3)" fontSize="9" fontFamily="var(--font-ui)">
                  Flash Drum
                </text>
                <text x="842" y="235" textAnchor="middle" fill="var(--sage)" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)">
                  14.2 bar
                </text>
              </g>
            </svg>
          </div>

          {/* Quick Equipment Select Rail */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderTop: "1px solid var(--line)",
              paddingTop: 14,
              overflowX: "auto",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)", textTransform: "uppercase", marginRight: 6 }}>
              {language === "hi" ? "उपकरण चुनें:" : language === "kn" ? "ಉಪಕರಣ ಆಯ್ಕೆಮಾಡಿ:" : "SELECT ASSET:"}
            </span>
            {Object.keys(equipmentMap).map((eqId) => {
              const eq = equipmentMap[eqId];
              const isSelected = selectedEquipment === eqId;
              return (
                <button
                  key={eqId}
                  onClick={() => setSelectedEquipment(eqId)}
                  style={{
                    background: isSelected ? "var(--bg-2)" : "var(--bg-1)",
                    border: isSelected ? "1px solid var(--brass)" : "1px solid var(--line)",
                    borderRadius: "var(--radius-pill)",
                    padding: "4px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all var(--dur-fast) var(--ease-out)",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      backgroundColor: eq.statusColor,
                    }}
                  />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: isSelected ? "var(--brass)" : "var(--ink)" }}>
                    {eqId}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* P&ID CAD Engineering Blueprint View */
        <div
          style={{
            background: "var(--bg-0)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-panel)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-2)" }}>
              {language === "hi"
                ? "इंजीनियरिंग रेखाचित्र: DWG-R204-PID-REV4 (हस्त-सत्यापित CAD ब्लूप्रिंट)"
                : language === "kn"
                ? "ಎಂಜಿನಿಯರಿಂಗ್ ಡ್ರಾಯಿಂಗ್: DWG-R204-PID-REV4 (ದೃಢೀಕರಿಸಿದ CAD ಬ್ಲೂಪ್ರಿಂಟ್)"
                : "ENGINEERING DRAWING: DWG-R204-PID-REV4 (AIR-GAPPED CAD SCHEMATIC)"}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--sage)" }}>
              {language === "hi" ? "सत्यापित ऑफ़लाइन प्रति" : language === "kn" ? "ಪರಿಶೀಲಿಸಿದ ಆಫ್‌ಲೈನ್ ಪ್ರತಿ" : "VERIFIED OFFLINE FIXTURE"}
            </span>
          </div>

          <div
            style={{
              width: "100%",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
              border: "1px solid var(--line-strong)",
              background: "#080c10",
              textAlign: "center",
            }}
          >
            <img
              src="/demo_images/pid_reactor_r204_loop.png"
              alt="Reaction Loop 200 P&ID Engineering Blueprint"
              style={{
                width: "100%",
                maxHeight: "520px",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </div>
      )}

      {/* Selected Equipment Verified Telemetry & Dossier Drawer */}
      <div
        style={{
          background: "var(--bg-0)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-panel)",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--brass)",
              }}
            >
              {selectedData.id}
            </span>
            <span style={{ color: "var(--line-strong)" }}>·</span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "14px", fontWeight: 600, color: "var(--ink)" }}>
              {selectedData.name}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "rgba(0,0,0,0.2)",
                border: `1px solid ${selectedData.statusColor}`,
                color: selectedData.statusColor,
                fontWeight: 600,
              }}
            >
              {selectedData.status}
            </span>
          </div>

          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--ink-3)" }}>
            SOP Ref: <strong style={{ color: "var(--ink)" }}>{selectedData.sopRef}</strong>
          </span>
        </div>

        {/* Telemetry Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {selectedData.pressure && (
            <div style={{ background: "var(--bg-1)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--ink-3)" }}>
                {language === "hi" ? "सत्यापित दबाव" : language === "kn" ? "ಪರಿಶೀಲಿಸಿದ ಒತ್ತಡ" : "VERIFIED PRESSURE"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 700, color: isPressureVariance && selectedData.id === "R-204" ? "var(--coral-text)" : "var(--ink)", marginTop: 2 }}>
                {selectedData.pressure}
              </div>
            </div>
          )}

          {selectedData.temperature && (
            <div style={{ background: "var(--bg-1)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--ink-3)" }}>
                {language === "hi" ? "परिचालन तापमान" : language === "kn" ? "ತಾಪಮಾನ" : "OPERATING TEMP"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>
                {selectedData.temperature}
              </div>
            </div>
          )}

          {selectedData.thickness && (
            <div style={{ background: "var(--bg-1)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--ink-3)" }}>
                {language === "hi" ? "दीवार की मोटाई (PAUT)" : language === "kn" ? "ಗೋಡೆಯ ದಪ್ಪ (PAUT)" : "SHELL THICKNESS"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 700, color: "var(--sage)", marginTop: 2 }}>
                {selectedData.thickness}
              </div>
            </div>
          )}

          {selectedData.vibration && (
            <div style={{ background: "var(--bg-1)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--ink-3)" }}>
                {language === "hi" ? "असर कंपन स्पेक्ट्रम" : language === "kn" ? "ಕಂಪನ ಸ್ಪೆಕ್ಟ್ರಮ್" : "BEARING VIBRATION"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 700, color: "var(--coral-text)", marginTop: 2 }}>
                {selectedData.vibration}
              </div>
            </div>
          )}

          {selectedData.setpoint && (
            <div style={{ background: "var(--bg-1)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--ink-3)" }}>
                {language === "hi" ? "राहत सेटपॉइंट" : language === "kn" ? "ರಿಲೀಫ್ ಸೆಟ್‌ಪಾಯಿಂಟ್" : "RELIEF SETPOINT"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 700, color: "var(--brass)", marginTop: 2 }}>
                {selectedData.setpoint}
              </div>
            </div>
          )}

          <div style={{ background: "var(--bg-1)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--ink-3)" }}>
              {language === "hi" ? "अंतिम निरीक्षण" : language === "kn" ? "ಕೊನೆಯ ತಪಾಸಣೆ" : "LAST INSPECTION"}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 600, color: "var(--ink)", marginTop: 2 }}>
              {selectedData.lastInspection}
            </div>
          </div>
        </div>

        {/* Maintenance Log & Provenance Record */}
        <div style={{ background: "var(--bg-1)", padding: "12px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--brass)", marginBottom: 4 }}>
            {language === "hi" ? "नवीनतम रखरखाव एवं निरीक्षण निष्कर्ष:" : language === "kn" ? "ಇತ್ತೀಚಿನ ನಿರ್ವಹಣೆ ಮತ್ತು ತಪಾಸಣಾ ಫಲಿತಾಂಶಗಳು:" : "VERIFIED MAINTENANCE RECORD & FINDINGS:"}
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "var(--ink)", lineHeight: 1.5 }}>
            {selectedData.recentMaintenance}
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink-2)", marginTop: 4 }}>
            {selectedData.notes}
          </div>
        </div>
      </div>
    </div>
  );
}
