import React from "react";

export interface InstrumentPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function InstrumentPanel({
  title,
  subtitle,
  footer,
  children,
  className = "",
  style,
  ...props
}: InstrumentPanelProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        backgroundColor: "var(--bg-1)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-panel)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
      className={`instrument-panel ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          {title && (
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "0.02em",
              }}
            >
              {title}
            </div>
          )}
          {subtitle && (
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "12px",
                color: "var(--ink-3)",
                marginTop: 2,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}

      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        {children}
      </div>

      {footer && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid var(--line)",
            width: "100%",
            textAlign: "center",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
