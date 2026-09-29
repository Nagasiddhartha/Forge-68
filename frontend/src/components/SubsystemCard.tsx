import React from "react";

export interface SubsystemCardProps {
  code: string;
  name: string;
  description: string;
  status: "active" | "ready" | "staged";
  path: string;
  details: string;
}

export const SubsystemCard: React.FC<SubsystemCardProps> = ({
  code,
  name,
  description,
  status,
  path,
  details
}) => {
  const statusColors = {
    active: { text: "var(--accent-emerald)", bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.3)" },
    ready: { text: "var(--accent-cyan)", bg: "rgba(0, 240, 255, 0.1)", border: "rgba(0, 240, 255, 0.3)" },
    staged: { text: "var(--accent-amber)", bg: "rgba(255, 170, 0, 0.1)", border: "rgba(255, 170, 0, 0.3)" },
  };

  const currentTheme = statusColors[status];

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--bg-surface-border)",
      borderRadius: "var(--radius-md)",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      transition: "all 0.2s ease-in-out",
      position: "relative",
      overflow: "hidden"
    }}>
      <div>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px"
        }}>
          <span style={{
            fontSize: "0.75rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
            letterSpacing: "0.08em"
          }}>
            {code}
          </span>
          <span style={{
            fontSize: "0.68rem",
            fontFamily: "var(--font-mono)",
            color: currentTheme.text,
            background: currentTheme.bg,
            border: `1px solid ${currentTheme.border}`,
            padding: "2px 8px",
            borderRadius: "4px",
            textTransform: "uppercase",
            fontWeight: 700
          }}>
            {status}
          </span>
        </div>

        <h3 style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "8px"
        }}>
          {name}
        </h3>

        <p style={{
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          lineHeight: "1.45",
          marginBottom: "16px"
        }}>
          {description}
        </p>
      </div>

      <div style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        paddingTop: "12px",
        marginTop: "12px"
      }}>
        <div style={{
          fontSize: "0.72rem",
          fontFamily: "var(--font-mono)",
          color: "var(--text-muted)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>{path}</span>
          <span style={{ color: "var(--text-secondary)" }}>{details}</span>
        </div>
      </div>
    </div>
  );
};
