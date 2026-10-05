import React from "react";

export interface EnamelSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "base" | "elevated" | "deep" | "hero";
  hairline?: "all" | "bottom" | "top" | "none";
  padding?: "none" | "compact" | "normal" | "spacious";
  children: React.ReactNode;
}

export function EnamelSurface({
  variant = "base",
  hairline = "all",
  padding = "normal",
  className = "",
  style,
  children,
  ...props
}: EnamelSurfaceProps) {
  const bgMap = {
    deep: "var(--bg-0)",
    base: "var(--bg-1)",
    elevated: "var(--bg-2)",
    hero: "var(--bg-1)",
  };

  const radiusMap = {
    deep: "0",
    base: "var(--radius-panel)",
    elevated: "var(--radius-panel)",
    hero: "var(--radius-hero)",
  };

  const paddingMap = {
    none: "0",
    compact: "12px 16px",
    normal: "20px 24px",
    spacious: "32px 40px",
  };

  const borderStyles: React.CSSProperties =
    hairline === "all"
      ? { border: "1px solid var(--line)" }
      : hairline === "bottom"
      ? { borderBottom: "1px solid var(--line)" }
      : hairline === "top"
      ? { borderTop: "1px solid var(--line)" }
      : {};

  return (
    <div
      style={{
        backgroundColor: bgMap[variant],
        borderRadius: radiusMap[variant],
        padding: paddingMap[padding],
        ...borderStyles,
        ...style,
      }}
      className={`enamel-surface ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
