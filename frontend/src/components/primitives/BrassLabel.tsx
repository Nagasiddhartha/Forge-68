import React from "react";

export interface BrassLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "outline" | "subtle";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function BrassLabel({
  variant = "subtle",
  size = "sm",
  className = "",
  style,
  children,
  ...props
}: BrassLabelProps) {
  const isOutline = variant === "outline";
  const isSolid = variant === "solid";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: size === "sm" ? "2px 8px" : "4px 12px",
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-ui)",
        fontSize: size === "sm" ? "12px" : "13px",
        fontWeight: 500,
        letterSpacing: "0.04em",
        color: isSolid ? "var(--on-brass)" : "var(--brass)",
        backgroundColor: isSolid
          ? "var(--brass)"
          : isOutline
          ? "transparent"
          : "rgba(200, 161, 90, 0.12)",
        border: isOutline ? "1px solid var(--brass)" : "1px solid rgba(200, 161, 90, 0.25)",
        ...style,
      }}
      className={`brass-label ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
