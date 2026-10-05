import React from "react";

export type TimelineStepStatus = "done" | "active" | "pending" | "skipped";

export interface TimelineStepProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number | string;
  label: string;
  status: TimelineStepStatus;
  detail?: string;
  isLast?: boolean;
}

export function TimelineStep({
  step,
  label,
  status,
  detail,
  isLast = false,
  className = "",
  style,
  ...props
}: TimelineStepProps) {
  const statusStyles: Record<TimelineStepStatus, { color: string; border: string; bg: string; dot: string }> = {
    done: {
      color: "var(--ink)",
      border: "var(--sage)",
      bg: "rgba(156, 195, 168, 0.12)",
      dot: "var(--sage)",
    },
    active: {
      color: "var(--brass)",
      border: "var(--brass)",
      bg: "rgba(200, 161, 90, 0.15)",
      dot: "var(--brass)",
    },
    pending: {
      color: "var(--ink-3)",
      border: "var(--line)",
      bg: "transparent",
      dot: "var(--line)",
    },
    skipped: {
      color: "var(--ink-3)",
      border: "var(--line)",
      bg: "transparent",
      dot: "var(--mist)",
    },
  };

  const st = statusStyles[status];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        position: "relative",
        paddingBottom: isLast ? 0 : 20,
        ...style,
      }}
      className={`timeline-step ${className}`}
      {...props}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: `1.5px solid ${st.border}`,
            backgroundColor: st.bg,
            color: st.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 600,
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          {status === "done" ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            step
          )}
        </div>
        {!isLast && (
          <div
            style={{
              width: 1,
              backgroundColor: "var(--line)",
              flexGrow: 1,
              minHeight: 20,
              marginTop: 4,
            }}
          />
        )}
      </div>

      <div style={{ paddingTop: 2 }}>
        <div
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "14px",
            fontWeight: status === "active" ? 600 : 500,
            color: st.color,
          }}
        >
          {label}
        </div>
        {detail && (
          <div
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "12px",
              color: "var(--ink-3)",
              marginTop: 2,
            }}
          >
            {detail}
          </div>
        )}
      </div>
    </div>
  );
}
