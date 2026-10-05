import React from "react";

export interface TechnicalLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  mono?: boolean;
  children: React.ReactNode;
}

export function TechnicalLabel({
  mono = false,
  className = "",
  style,
  children,
  ...props
}: TechnicalLabelProps) {
  return (
    <span
      style={{
        fontFamily: mono ? "var(--font-mono)" : "var(--font-ui)",
        fontSize: mono ? "12px" : "13px",
        color: "var(--ink-3)",
        letterSpacing: mono ? "0.05em" : "normal",
        ...style,
      }}
      className={`technical-label ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
