"use client";

import React from "react";
import { DemoScenarioId } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

interface EngineeringThresholdsVisualizerProps {
  activeScenarioId?: DemoScenarioId | null;
  overridePressure?: number;
  overrideThickness?: number;
}

export function EngineeringThresholdsVisualizer({
  activeScenarioId,
  overridePressure,
  overrideThickness,
}: EngineeringThresholdsVisualizerProps) {
  const { t, language } = useTranslation();

  const isPressureVariance = activeScenarioId === "r204_pressure_variance";
  const isPolicyDenied = activeScenarioId === "policy_denial";

  // Operating values grounded in plant records & demo scenarios
  const currentPressure = overridePressure ?? (isPressureVariance ? 33.0 : 31.4);
  const baselineNormal = 31.2;
  const highAlarm = 33.5;
  const safetyTrip = 35.0;

  // Shell thickness grounded in equipment_records.json PAUT report
  const shellThickness = overrideThickness ?? 72.8;
  const retirementLimit = 68.2;
  const designSpec = 75.0;
  const corrosionAllowance = +(shellThickness - retirementLimit).toFixed(1);

  // Computed metrics
  const deviationBar = +(currentPressure - baselineNormal).toFixed(1);
  const deviationPct = +(
    ((currentPressure - baselineNormal) / baselineNormal) *
    100
  ).toFixed(1);
  const headroomToAlarm = +(highAlarm - currentPressure).toFixed(1);
  const remainingTripMargin = +(safetyTrip - currentPressure).toFixed(1);

  // Pressure Track Fill Width: proportional to range [30.0, 35.0]
  const pressureTrackPct = Math.min(
    100,
    Math.max(
      15,
      ((currentPressure - 30.0) / (safetyTrip - 30.0)) * 75 + 15
    )
  );

  // Thickness Track Fill Width: proportional to range [65.0, 75.0]
  const thicknessTrackPct = Math.min(
    100,
    Math.max(
      20,
      ((shellThickness - 65.0) / (designSpec - 65.0)) * 75 + 2
    )
  );

  // Gauge calculations (Dial from 30.0 to 36.0 bar over 240 degrees)
  // 30 bar is at 150 deg, 33 bar is at 270 deg (top dead center), 36 bar is at 390 deg (30 deg)
  const minDial = 30.0;
  const maxDial = 36.0;
  const dialSweep = 240;
  const startAngle = 150; // SVG degrees (clockwise from positive X-axis)

  const calcAngle = (val: number) => {
    const clamped = Math.min(maxDial, Math.max(minDial, val));
    return startAngle + ((clamped - minDial) / (maxDial - minDial)) * dialSweep;
  };

  const needleAngle = calcAngle(currentPressure);

  // Status Badge in top right
  let statusBadgeText = t("statusElevatedWithinMargin");
  let statusBadgeBg = "rgba(217, 163, 62, 0.15)";
  let statusBadgeBorder = "rgba(217, 163, 62, 0.4)";
  let statusBadgeColor = "#e3b341";

  if (isPressureVariance) {
    statusBadgeText = t("statusCriticalVariance");
    statusBadgeBg = "rgba(248, 81, 73, 0.18)";
    statusBadgeBorder = "rgba(248, 81, 73, 0.5)";
    statusBadgeColor = "#f85149";
  } else if (isPolicyDenied) {
    statusBadgeText =
      language === "hi"
        ? "सुरक्षा इंटरलॉक सशस्त्र"
        : language === "kn"
        ? "ಸುರಕ್ಷತಾ ಇಂಟರ್‌ಲಾಕ್ ಸಕ್ರಿಯ"
        : "SAFETY INTERLOCK ARMED";
    statusBadgeBg = "rgba(141, 180, 214, 0.15)";
    statusBadgeBorder = "rgba(141, 180, 214, 0.4)";
    statusBadgeColor = "var(--pewter)";
  }

  return (
    <div
      style={{
        background: "var(--bg-0, #0a0e14)",
        border: "1px solid var(--line, #1e2836)",
        borderRadius: "var(--radius-panel, 12px)",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
      }}
    >
      {/* 1. Header Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          borderBottom: "1px solid var(--line, #1e2836)",
          paddingBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: "17px",
              color: "var(--brass, #d4af37)",
              lineHeight: 1,
            }}
          >
            ⚙
          </span>
          <span
            style={{
              fontFamily: "var(--font-display, sans-serif)",
              fontSize: "14.5px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "var(--ink, #e6edf3)",
              textTransform: "uppercase",
            }}
          >
            {t("engVisualizationsTitle")}
          </span>
        </div>

        <div
          style={{
            background: statusBadgeBg,
            border: `1px solid ${statusBadgeBorder}`,
            borderRadius: "var(--radius-pill, 9999px)",
            padding: "4px 14px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: statusBadgeColor,
            textTransform: "uppercase",
          }}
        >
          {statusBadgeText}
        </div>
      </div>

      {/* 2. Middle Row: Circular Gauge & Pressure Track */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 28,
          alignItems: "center",
        }}
        className="eng-visualizer-middle-grid"
      >
        {/* Left: Precision Circular Pressure Gauge */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 220,
            height: 220,
            position: "relative",
            margin: "0 auto",
          }}
        >
          <svg
            viewBox="0 0 220 220"
            style={{
              width: 220,
              height: 220,
              filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.5))",
            }}
          >
            <defs>
              {/* Dial face gradient */}
              <radialGradient id="dialFaceGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0b1b15" />
                <stop offset="70%" stopColor="#081410" />
                <stop offset="100%" stopColor="#050c09" />
              </radialGradient>

              {/* Brass outer bezel gradient */}
              <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8c7336" />
                <stop offset="50%" stopColor="#433719" />
                <stop offset="100%" stopColor="#a38742" />
              </linearGradient>

              {/* Needle brass gradient */}
              <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e5c05a" />
                <stop offset="50%" stopColor="#f7dc8c" />
                <stop offset="100%" stopColor="#c29a32" />
              </linearGradient>
            </defs>

            {/* Bezel Outer Ring */}
            <circle
              cx="110"
              cy="110"
              r="104"
              fill="none"
              stroke="url(#bezelGrad)"
              strokeWidth="3.5"
            />
            {/* Bezel Inner Ring */}
            <circle
              cx="110"
              cy="110"
              r="101"
              fill="none"
              stroke="#13211b"
              strokeWidth="2"
            />

            {/* Dial Background Face */}
            <circle cx="110" cy="110" r="99" fill="url(#dialFaceGrad)" />

            {/* Dial Colored Arcs (R = 80) */}
            {/* Green Arc: 30.0 to 33.5 bar (150 deg to 290 deg) */}
            {(() => {
              const r = 80;
              const a1 = (150 * Math.PI) / 180;
              const a2 = (290 * Math.PI) / 180;
              const x1 = 110 + r * Math.cos(a1);
              const y1 = 110 + r * Math.sin(a1);
              const x2 = 110 + r * Math.cos(a2);
              const y2 = 110 + r * Math.sin(a2);
              return (
                <path
                  d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                  fill="none"
                  stroke="#3fb950"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              );
            })()}

            {/* Orange Arc: 33.5 to 35.0 bar (290 deg to 350 deg) */}
            {(() => {
              const r = 80;
              const a1 = (290 * Math.PI) / 180;
              const a2 = (350 * Math.PI) / 180;
              const x1 = 110 + r * Math.cos(a1);
              const y1 = 110 + r * Math.sin(a1);
              const x2 = 110 + r * Math.cos(a2);
              const y2 = 110 + r * Math.sin(a2);
              return (
                <path
                  d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                  fill="none"
                  stroke="#f0883e"
                  strokeWidth="4.5"
                />
              );
            })()}

            {/* Red Arc: 35.0 to 36.0 bar (350 deg to 390 deg) */}
            {(() => {
              const r = 80;
              const a1 = (350 * Math.PI) / 180;
              const a2 = (390 * Math.PI) / 180;
              const x1 = 110 + r * Math.cos(a1);
              const y1 = 110 + r * Math.sin(a1);
              const x2 = 110 + r * Math.cos(a2);
              const y2 = 110 + r * Math.sin(a2);
              return (
                <path
                  d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                  fill="none"
                  stroke="#f85149"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              );
            })()}

            {/* Minor Tick Marks (every 0.2 bar) */}
            {Array.from({ length: 31 }, (_, i) => {
              const val = 30 + i * 0.2;
              const deg = calcAngle(val);
              const rad = (deg * Math.PI) / 180;
              const isMajor = i % 5 === 0;
              const rInner = isMajor ? 73 : 76;
              const rOuter = 82;
              const xInner = 110 + rInner * Math.cos(rad);
              const yInner = 110 + rInner * Math.sin(rad);
              const xOuter = 110 + rOuter * Math.cos(rad);
              const yOuter = 110 + rOuter * Math.sin(rad);
              return (
                <line
                  key={`tick-${i}`}
                  x1={xInner}
                  y1={yInner}
                  x2={xOuter}
                  y2={yOuter}
                  stroke={isMajor ? "#9ec3a8" : "#2d4837"}
                  strokeWidth={isMajor ? 1.5 : 1}
                />
              );
            })}

            {/* Number Labels (30, 31, 32, 33, 34, 35, 36) */}
            {[30, 31, 32, 33, 34, 35, 36].map((num) => {
              const deg = calcAngle(num);
              const rad = (deg * Math.PI) / 180;
              const rText = 62;
              const xText = 110 + rText * Math.cos(rad);
              const yText = 110 + rText * Math.sin(rad);
              return (
                <text
                  key={`lbl-${num}`}
                  x={xText}
                  y={yText + 4}
                  textAnchor="middle"
                  fill="#c2d8c7"
                  fontFamily="var(--font-mono, monospace)"
                  fontSize="10.5px"
                  fontWeight="600"
                >
                  {num}
                </text>
              );
            })}

            {/* Needle (Dynamic pivot rotation) */}
            {(() => {
              const rad = (needleAngle * Math.PI) / 180;
              const rTip = 74;
              const rTail = 16;
              const perpRad = rad + Math.PI / 2;

              const xTip = 110 + rTip * Math.cos(rad);
              const yTip = 110 + rTip * Math.sin(rad);

              const xBaseL = 110 + 3.5 * Math.cos(perpRad) - rTail * 0.4 * Math.cos(rad);
              const yBaseL = 110 + 3.5 * Math.sin(perpRad) - rTail * 0.4 * Math.sin(rad);

              const xBaseR = 110 - 3.5 * Math.cos(perpRad) - rTail * 0.4 * Math.cos(rad);
              const yBaseR = 110 - 3.5 * Math.sin(perpRad) - rTail * 0.4 * Math.sin(rad);

              const xTail = 110 - rTail * Math.cos(rad);
              const yTail = 110 - rTail * Math.sin(rad);

              return (
                <g style={{ transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
                  <path
                    d={`M ${xTip} ${yTip} L ${xBaseL} ${yBaseL} L ${xTail} ${yTail} L ${xBaseR} ${yBaseR} Z`}
                    fill="url(#needleGrad)"
                    stroke="#8c7336"
                    strokeWidth="0.8"
                    style={{
                      filter: "drop-shadow(0px 2px 5px rgba(0,0,0,0.7))",
                    }}
                  />
                  {/* Center Brass Cap */}
                  <circle cx="110" cy="110" r="7.5" fill="#e5c05a" stroke="#8c7336" strokeWidth="1.5" />
                  <circle cx="110" cy="110" r="3" fill="#13211b" />
                </g>
              );
            })()}

            {/* Digital Readout at Bottom Center */}
            <text
              x="110"
              y="160"
              textAnchor="middle"
              fill="#ffffff"
              fontFamily="var(--font-display, sans-serif)"
              fontSize="23px"
              fontWeight="700"
              letterSpacing="-0.02em"
            >
              {currentPressure.toFixed(1)}
            </text>
            <text
              x="110"
              y="174"
              textAnchor="middle"
              fill="#7d9885"
              fontFamily="var(--font-mono, monospace)"
              fontSize="10px"
              fontWeight="500"
            >
              bar, PI-204
            </text>
          </svg>
        </div>

        {/* Right: Pressure Boundary Track & Stat Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Track Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display, sans-serif)",
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--ink, #e6edf3)",
              }}
            >
              {t("pressureBoundaryTrackTitle")}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "13.5px",
                fontWeight: 700,
                color: isPressureVariance ? "#f0883e" : "#e5c05a",
              }}
            >
              {currentPressure.toFixed(1)} bar / {safetyTrip.toFixed(1)} bar
            </span>
          </div>

          {/* Horizontal Gradient Bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                width: "100%",
                height: 16,
                background: "#0e141a",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${pressureTrackPct}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #2ea043 0%, #3fb950 55%, #d29922 80%, #f85149 100%)",
                  borderRadius: 8,
                  transition: "width 0.8s ease-out",
                }}
              />
            </div>

            {/* Threshold Labels under Track */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "11px",
              }}
            >
              <span style={{ color: "#8b949e" }}>
                {t("baselineNormal")}: {baselineNormal.toFixed(1)} bar
              </span>
              <span style={{ color: "#f0883e", fontWeight: 600 }}>
                {t("highAlarm")}: {highAlarm.toFixed(1)} bar
              </span>
              <span style={{ color: "#f85149", fontWeight: 700 }}>
                {t("safetyTrip")}: {safetyTrip.toFixed(1)} bar
              </span>
            </div>
          </div>

          {/* 3 Metric Cards Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {/* Card 1: Deviation */}
            <div
              style={{
                background: "rgba(14, 20, 26, 0.75)",
                border: "1px solid var(--line, #1f2937)",
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-ui, sans-serif)",
                  fontSize: "11px",
                  color: "#8b949e",
                  marginBottom: 4,
                }}
              >
                {t("metricDeviation")}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "14.5px",
                  fontWeight: 700,
                  color: isPressureVariance ? "#f0883e" : "#e3b341",
                }}
              >
                {deviationBar >= 0 ? `+${deviationBar}` : deviationBar} bar (
                {deviationPct >= 0 ? `+${deviationPct}` : deviationPct}%)
              </div>
            </div>

            {/* Card 2: Headroom to Alarm */}
            <div
              style={{
                background: "rgba(14, 20, 26, 0.75)",
                border: "1px solid var(--line, #1f2937)",
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-ui, sans-serif)",
                  fontSize: "11px",
                  color: "#8b949e",
                  marginBottom: 4,
                }}
              >
                {t("metricHeadroom")}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "14.5px",
                  fontWeight: 700,
                  color: headroomToAlarm <= 1.0 ? "#f0883e" : "#3fb950",
                }}
              >
                {headroomToAlarm.toFixed(1)} bar
              </div>
            </div>

            {/* Card 3: Remaining Trip Margin */}
            <div
              style={{
                background: "rgba(14, 20, 26, 0.75)",
                border: "1px solid var(--line, #1f2937)",
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-ui, sans-serif)",
                  fontSize: "11px",
                  color: "#8b949e",
                  marginBottom: 4,
                }}
              >
                {t("metricTripMargin")}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "14.5px",
                  fontWeight: 700,
                  color: remainingTripMargin <= 2.5 ? "#f0883e" : "#e3b341",
                }}
              >
                {remainingTripMargin.toFixed(1)} bar
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Reactor Shell Wall Thickness Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          borderTop: "1px solid var(--line, #1e2836)",
          paddingTop: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display, sans-serif)",
              fontSize: "13.5px",
              fontWeight: 700,
              color: "var(--ink, #e6edf3)",
            }}
          >
            {t("shellThicknessTitle")}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#3fb950",
            }}
          >
            {shellThickness.toFixed(1)} mm ({t("corrosionAllowanceLabel")}: +
            {corrosionAllowance.toFixed(1)} mm)
          </span>
        </div>

        {/* Thickness Bar */}
        <div
          style={{
            width: "100%",
            height: 14,
            background: "#0e141a",
            borderRadius: 7,
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${thicknessTrackPct}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #d29922 0%, #2ea043 35%, #3fb950 100%)",
              borderRadius: 7,
              transition: "width 0.8s ease-out",
            }}
          />
        </div>

        {/* Thickness Labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "11px",
          }}
        >
          <span style={{ color: "#f85149" }}>
            {t("retirementLimitLabel")}: {retirementLimit.toFixed(1)} mm
          </span>
          <span style={{ color: "#3fb950", fontWeight: 700 }}>
            {t("currentMeasuredLabel")}: {shellThickness.toFixed(1)} mm
          </span>
          <span style={{ color: "#8b949e" }}>
            {t("designSpecLabel")}: {designSpec.toFixed(1)} mm
          </span>
        </div>
      </div>

      {/* 4. Bottom Footer: Deterministic Verification Matrix */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          borderTop: "1px solid var(--line, #1e2836)",
          paddingTop: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#3fb950", fontSize: "14px", fontWeight: 700 }}>
            ✓
          </span>
          <span
            style={{
              fontFamily: "var(--font-ui, sans-serif)",
              fontSize: "12.5px",
              fontWeight: 700,
              color: "var(--ink, #e6edf3)",
            }}
          >
            {t("deterministicMatrixTitle")}:
          </span>
          <span
            style={{
              fontFamily: "var(--font-ui, sans-serif)",
              fontSize: "12px",
              color: "#8b949e",
            }}
          >
            {t("deterministicMatrixSub")}
          </span>
        </div>

        <div
          style={{
            background: "rgba(46, 160, 67, 0.12)",
            border: "1px solid #238636",
            borderRadius: "var(--radius-pill, 9999px)",
            padding: "3px 12px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "11.5px",
            fontWeight: 700,
            color: "#3fb950",
            letterSpacing: "0.04em",
          }}
        >
          {t("verifiedPill")}
        </div>
      </div>
    </div>
  );
}
