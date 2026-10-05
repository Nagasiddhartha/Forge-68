import React from "react";

export type SemanticStatus =
  | "verified"
  | "review"
  | "blocked"
  | "quarantined"
  | "failed"
  | "unavailable"
  | "info";

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: SemanticStatus;
  label?: string;
  pulse?: boolean;
  size?: "sm" | "md";
}

export function StatusIndicator({
  status,
  label,
  pulse = false,
  size = "md",
  className = "",
  style,
  ...props
}: StatusIndicatorProps) {
  const dotColorMap: Record<SemanticStatus, string> = {
    verified: "var(--sage)",
    review: "var(--brass)",
    blocked: "var(--pewter)",
    quarantined: "var(--pewter)",
    failed: "var(--coral)",
    unavailable: "var(--mist)",
    info: "var(--ink-2)",
  };

  const dotSize = size === "sm" ? 6 : 8;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--font-ui)",
        fontSize: size === "sm" ? "12px" : "13px",
        color: "var(--ink)",
        ...style,
      }}
      className={`status-indicator ${className}`}
      {...props}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          backgroundColor: dotColorMap[status],
          boxShadow: pulse ? `0 0 6px ${dotColorMap[status]}` : "none",
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      {label && <span>{label}</span>}
    </span>
  );
}
