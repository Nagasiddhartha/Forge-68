import React from "react";

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  emphasis?: "subtle" | "strong";
}

export function Divider({
  orientation = "horizontal",
  emphasis = "subtle",
  className = "",
  style,
  ...props
}: DividerProps) {
  const color = emphasis === "strong" ? "var(--line-strong)" : "var(--line)";

  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        style={{
          width: 1,
          alignSelf: "stretch",
          backgroundColor: color,
          margin: "0 12px",
          ...style,
        }}
        className={`divider-v ${className}`}
      />
    );
  }

  return (
    <hr
      style={{
        border: "none",
        height: 1,
        backgroundColor: color,
        width: "100%",
        margin: "16px 0",
        ...style,
      }}
      className={`divider-h ${className}`}
      {...props}
    />
  );
}
