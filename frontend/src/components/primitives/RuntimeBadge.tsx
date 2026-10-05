import React from "react";
import { StatusIndicator, SemanticStatus } from "./StatusIndicator";

export interface RuntimeBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  status: SemanticStatus;
  subtext?: string;
  pulse?: boolean;
}

export function RuntimeBadge({
  label,
  status,
  subtext,
  pulse = false,
  className = "",
  style,
  ...props
}: RuntimeBadgeProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 10px",
        borderRadius: "var(--radius-pill)",
        backgroundColor: "var(--bg-2)",
        border: "1px solid var(--line)",
        fontFamily: "var(--font-ui)",
        fontSize: "12px",
        color: "var(--ink)",
        ...style,
      }}
      className={`runtime-badge ${className}`}
      {...props}
    >
      <StatusIndicator status={status} pulse={pulse} size="sm" />
      <span style={{ fontWeight: 500, letterSpacing: "0.02em" }}>{label}</span>
      {subtext && (
        <span style={{ color: "var(--ink-3)", borderLeft: "1px solid var(--line)", paddingLeft: 6 }}>
          {subtext}
        </span>
      )}
    </div>
  );
}
