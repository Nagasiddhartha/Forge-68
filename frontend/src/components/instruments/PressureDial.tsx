"use client";

import React, { useEffect, useId, useMemo, useState } from "react";

export interface PressureDialProps {
  value: number;
  normal?: number;
  alarm?: number;
  trip?: number;
  min?: number;
  max?: number;
  unit?: string;
  tag?: string;
  label?: string;
  size?: number | string;
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Computes SVG arc path from value1 to value2 on circular track
 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  if (endAngleDeg <= startAngleDeg) {
    return "";
  }
  const rad1 = (startAngleDeg * Math.PI) / 180;
  const rad2 = (endAngleDeg * Math.PI) / 180;

  const x1 = cx + r * Math.sin(rad1);
  const y1 = cy - r * Math.cos(rad1);
  const x2 = cx + r * Math.sin(rad2);
  const y2 = cy - r * Math.cos(rad2);

  const delta = endAngleDeg - startAngleDeg;
  const largeArcFlag = delta > 180 ? 1 : 0;

  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export function PressureDial({
  value,
  normal = 31.2,
  alarm = 33.5,
  trip = 35.0,
  min: propMin,
  max: propMax,
  unit = "bar",
  tag = "PI-204",
  label,
  size = "100%",
  animate = true,
  className = "",
  style,
}: PressureDialProps) {
  const gradientId = useId();

  // Dynamic scale window computation conforming to Section 7.1:
  // min = floor(normal - 0.25*(trip - normal))
  // max = ceil(trip + 0.25*(trip - normal))
  const { minScale, maxScale } = useMemo(() => {
    const computedMin = propMin !== undefined ? propMin : Math.floor(normal - 0.25 * (trip - normal));
    const computedMax = propMax !== undefined ? propMax : Math.ceil(trip + 0.25 * (trip - normal));
    return { minScale: computedMin, maxScale: computedMax };
  }, [propMin, propMax, normal, trip]);

  // Value to angle mapping: 240 degree span from -120 to +120
  const valueToAngle = useMemo(() => {
    return (v: number) => {
      const clamped = Math.max(minScale, Math.min(maxScale, v));
      return -120 + ((clamped - minScale) / (maxScale - minScale)) * 240;
    };
  }, [minScale, maxScale]);

  const targetAngle = valueToAngle(value);
  const normalAngle = valueToAngle(normal);
  const alarmAngle = valueToAngle(alarm);
  const tripAngle = valueToAngle(trip);

  // Animation state for smooth needle sweep on mount
  const [animatedAngle, setAnimatedAngle] = useState(-120);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => {
      setAnimatedAngle(targetAngle);
    }, 150);
    return () => clearTimeout(timer);
  }, [targetAngle, animate]);

  const currentNeedleAngle = animate ? animatedAngle : targetAngle;


  // Generate tick marks and numerals (30 intervals = 31 ticks)
  const ticks = useMemo(() => {
    const items: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      strokeWidth: number;
      isMajor: boolean;
      numeral?: { x: number; y: number; text: string };
    }> = [];

    for (let i = 0; i <= 30; i++) {
      const angleDeg = -120 + i * 8;
      const rad = (angleDeg * Math.PI) / 180;
      const isMajor = i % 5 === 0;

      const r1 = isMajor ? 142 : 140;
      const r2 = isMajor ? 128 : 134;

      const x1 = 180 + r1 * Math.sin(rad);
      const y1 = 180 - r1 * Math.cos(rad);
      const x2 = 180 + r2 * Math.sin(rad);
      const y2 = 180 - r2 * Math.cos(rad);

      let numeral;
      if (isMajor) {
        const val = minScale + (i / 30) * (maxScale - minScale);
        const nx = 180 + 104 * Math.sin(rad);
        const ny = 180 - 104 * Math.cos(rad) + 7;
        numeral = {
          x: nx,
          y: ny,
          text: Number.isInteger(val) ? val.toString() : val.toFixed(1),
        };
      }

      items.push({
        x1,
        y1,
        x2,
        y2,
        strokeWidth: isMajor ? 1.8 : 1.0,
        isMajor,
        numeral,
      });
    }

    return items;
  }, [minScale, maxScale]);

  // Arc paths
  const fullTrackPath = describeArc(180, 180, 128, -120, 120);
  const progressPath = describeArc(180, 180, 128, -120, targetAngle);
  const alarmPath = describeArc(180, 180, 128, alarmAngle, tripAngle);
  const tripPath = describeArc(180, 180, 128, tripAngle, 120);

  // Normal dot coordinates
  const normalRad = (normalAngle * Math.PI) / 180;
  const normalDotX = 180 + 128 * Math.sin(normalRad);
  const normalDotY = 180 - 128 * Math.cos(normalRad);

  // Accessible narration
  const deviation = (value - normal).toFixed(1);
  const deviationSign = value >= normal ? "+" : "";
  const ariaDescription = `Pressure dial reading ${value.toFixed(1)} ${unit}. Normal baseline is ${normal} ${unit} (${deviationSign}${deviation} ${unit}). Alarm threshold is ${alarm} ${unit}. Trip threshold is ${trip} ${unit}.`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: typeof size === "number" ? `${size}px` : size,
        maxWidth: 420,
        margin: "0 auto",
        ...style,
      }}
      className={`forge-pressure-dial ${className}`}
    >
      <svg
        viewBox="0 0 360 360"
        role="img"
        aria-label={ariaDescription}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))",
        }}
      >
        <defs>
          {/* Subtle crescent bezel gradient */}
          <radialGradient id={gradientId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#25584C" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0A231E" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* 1. Outer Brass Bezel */}
        <circle cx="180" cy="180" r="172" fill="none" stroke="var(--brass)" strokeWidth="2" />

        {/* 2. Enamel Face & Inner Bezel Ring */}
        <circle cx="180" cy="180" r="164" fill={`url(#${gradientId})`} stroke="var(--bezel-ring)" strokeWidth="6" />

        {/* 3. Base Track Arc */}
        <path d={fullTrackPath} fill="none" stroke="var(--line-strong)" strokeWidth="10" />

        {/* 4. Progress Arc (from min to current reading) */}
        {progressPath && (
          <path
            d={progressPath}
            fill="none"
            stroke="var(--sage)"
            strokeWidth="10"
            strokeLinecap="round"
          />
        )}

        {/* 5. Alarm Zone Arc (Brass) */}
        {alarmPath && <path d={alarmPath} fill="none" stroke="var(--brass)" strokeWidth="10" />}

        {/* 6. Trip Zone Arc (Coral) */}
        {tripPath && <path d={tripPath} fill="none" stroke="var(--coral)" strokeWidth="10" />}

        {/* 7. Normal Baseline Dot Marker */}
        <circle cx={normalDotX} cy={normalDotY} r="4" fill="var(--ink)" />

        {/* 8. Ticks */}
        <g stroke="#8FA79D" opacity="0.85">
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1.toFixed(1)}
              y1={t.y1.toFixed(1)}
              x2={t.x2.toFixed(1)}
              y2={t.y2.toFixed(1)}
              strokeWidth={t.strokeWidth}
            />
          ))}
        </g>

        {/* 9. Numerals */}
        <g
          fill="var(--ink)"
          fontFamily="var(--font-display)"
          fontSize="20"
          textAnchor="middle"
          style={{ fontVariantNumeric: "lining-nums tabular-nums" }}
        >
          {ticks.map((t, idx) =>
            t.numeral ? (
              <text key={idx} x={t.numeral.x.toFixed(1)} y={t.numeral.y.toFixed(1)}>
                {t.numeral.text}
              </text>
            ) : null
          )}
        </g>

        {/* 10. Digital Readout & Unit Subtitle */}
        <text
          x="180"
          y="282"
          fill="var(--ink)"
          fontFamily="var(--font-display)"
          fontSize="40"
          textAnchor="middle"
          fontWeight="500"
          style={{ fontVariantNumeric: "lining-nums tabular-nums" }}
        >
          {value.toFixed(1)}
        </text>

        <text
          x="180"
          y="304"
          fill="var(--ink-3)"
          fontSize="13"
          textAnchor="middle"
          fontFamily="var(--font-ui)"
        >
          {unit}, {tag}
        </text>

        {/* 11. Needle Group */}
        <g
          style={{
            transformOrigin: "180px 180px",
            transform: `rotate(${currentNeedleAngle}deg)`,
            transition: animate ? "transform 2.2s cubic-bezier(.22, 1.15, .36, 1)" : "none",
          }}
        >
          <path d="M180 66 L187 188 L173 188 Z" fill="var(--brass)" />
          <circle cx="180" cy="180" r="10" fill="var(--brass)" />
          <circle cx="180" cy="180" r="3.5" fill="var(--face)" />
        </g>
      </svg>

      {label && (
        <div
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "13px",
            color: "var(--ink-2)",
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
