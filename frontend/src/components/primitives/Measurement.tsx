import React from "react";

export interface MeasurementProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  unit: string;
  tag?: string;
  delta?: string | number;
  status?: "normal" | "warning" | "alarm";
}

export function Measurement({
  value,
  unit,
  tag,
  delta,
  status = "normal",
  className = "",
  style,
  ...props
}: MeasurementProps) {
  const statusColor = {
    normal: "var(--ink)",
    warning: "var(--brass)",
    alarm: "var(--coral)",
  }[status];

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 2,
        ...style,
      }}
      className={`measurement-block ${className}`}
      {...props}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "32px",
            lineHeight: 1,
            color: statusColor,
            fontVariantNumeric: "lining-nums tabular-nums",
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "14px",
            color: "var(--ink-3)",
          }}
        >
          {unit}
        </span>
        {delta && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: status === "warning" ? "var(--brass)" : "var(--ink-2)",
              paddingLeft: 4,
            }}
          >
            {delta}
          </span>
        )}
      </div>
      {tag && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--ink-3)",
          }}
        >
          {tag}
        </span>
      )}
    </div>
  );
}
