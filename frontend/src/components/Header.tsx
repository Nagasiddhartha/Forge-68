import React from "react";
import { Locale, TRANSLATIONS } from "@/lib/i18n";

export interface HeaderProps {
  locale?: Locale;
}

export const Header: React.FC<HeaderProps> = ({ locale = "en" }) => {
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;
  return (
    <header style={{
      borderBottom: "1px solid var(--bg-surface-border)",
      background: "rgba(14, 18, 26, 0.8)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      padding: "16px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: "32px",
          height: "32px",
          background: "linear-gradient(135deg, #00f0ff 0%, #0077ff 100%)",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 16px rgba(0, 240, 255, 0.4)",
          fontWeight: 900,
          color: "#07090e",
          fontSize: "18px",
          fontFamily: "var(--font-mono)"
        }}>
          F
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#ffffff"
            }}>
              FORGE
            </span>
            <span style={{
              fontSize: "0.7rem",
              fontFamily: "var(--font-mono)",
              background: "rgba(0, 240, 255, 0.12)",
              color: "var(--accent-cyan)",
              padding: "2px 6px",
              borderRadius: "4px",
              border: "1px solid rgba(0, 240, 255, 0.25)"
            }}>
              v0.1.0-FOUNDATION
            </span>
          </div>
          <div style={{
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
            textTransform: "uppercase"
          }}>
            {t.brandTitle}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          borderRadius: "6px",
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.25)"
        }}>
          <span className="pulse-emerald" />
          <span style={{
            fontSize: "0.75rem",
            fontFamily: "var(--font-mono)",
            color: "var(--accent-emerald)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            {t.navSovereignLocalRuntime}
          </span>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.75rem",
          fontFamily: "var(--font-mono)",
          color: "var(--text-muted)"
        }}>
          <span style={{ color: "var(--text-secondary)" }}>{t.policyGatewayActive}:</span>
          <span>{t.localOnly}</span>
        </div>
      </div>
    </header>
  );
};
