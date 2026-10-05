import React from "react";

export interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  subtext?: string;
  unit?: string;
  highlight?: boolean;
}

export function Metric({
  value,
  label,
  subtext,
  unit,
  highlight = false,
  className = "",
  style,
  ...props
}: MetricProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        ...style,
      }}
      className={`metric-stat ${className}`}
      {...props}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "36px",
            lineHeight: 1,
            color: highlight ? "var(--brass)" : "var(--ink)",
            fontVariantNumeric: "lining-nums tabular-nums",
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "14px",
              color: "var(--ink-3)",
            }}
          >
            {unit}
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "13px",
          color: "var(--ink-2)",
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>
      {subtext && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--ink-3)",
            marginTop: 2,
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
}
