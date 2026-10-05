import React from "react";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  title,
  eyebrow,
  description,
  action,
  className = "",
  style,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        paddingBottom: 12,
        borderBottom: "1px solid var(--line)",
        ...style,
      }}
      className={`section-header ${className}`}
      {...props}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "var(--brass)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "28px",
            lineHeight: 1.15,
            color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "14px",
              lineHeight: 1.5,
              color: "var(--ink-2)",
              marginTop: 4,
              maxWidth: "60ch",
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
