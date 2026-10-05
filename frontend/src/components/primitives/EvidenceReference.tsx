import React from "react";

export interface EvidenceReferenceProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  index: number;
  source?: string;
  active?: boolean;
}

export function EvidenceReference({
  index,
  source,
  active = false,
  className = "",
  style,
  ...props
}: EvidenceReferenceProps) {
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 20,
        height: 20,
        padding: "0 5px",
        borderRadius: "var(--radius-pill)",
        backgroundColor: active ? "var(--brass)" : "var(--bg-3)",
        color: active ? "var(--on-brass)" : "var(--ink-2)",
        border: "1px solid var(--line-strong)",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        fontWeight: 600,
        lineHeight: 1,
        cursor: "pointer",
        transition: "all var(--dur-fast) var(--ease-out)",
        verticalAlign: "super",
        margin: "0 2px",
        ...style,
      }}
      title={source ? `Evidence Source [${index}]: ${source}` : `Evidence Reference [${index}]`}
      className={`evidence-reference ${className}`}
      {...props}
    >
      {index}
    </button>
  );
}
