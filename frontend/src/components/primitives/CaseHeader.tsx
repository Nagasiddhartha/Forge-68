import React from "react";
import { VerdictBadge } from "./VerdictBadge";
import { Locale, TRANSLATIONS } from "@/lib/i18n";

export interface CaseHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  asset?: string;
  persona?: string;
  clearance?: string;
  timestamp?: string;
  verdict?: string;
  breadcrumb?: string;
  actions?: React.ReactNode;
  locale?: Locale;
}

export function CaseHeader({
  title,
  asset,
  persona,
  clearance,
  timestamp,
  verdict,
  breadcrumb = "Missions",
  actions,
  className = "",
  style,
  locale = "en",
  ...props
}: CaseHeaderProps) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingBottom: 20,
        borderBottom: "1px solid var(--line)",
        ...style,
      }}
      className={`case-header ${className}`}
      {...props}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "var(--ink-3)" }}>
            {breadcrumb}
          </span>
          {verdict && <VerdictBadge verdict={verdict} locale={locale} />}
        </div>
        {actions && <div>{actions}</div>}
      </div>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "clamp(30px, 3.8vw, 44px)",
          lineHeight: 1.08,
          color: "var(--ink)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h1>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
          fontFamily: "var(--font-ui)",
          fontSize: "13px",
          color: "var(--ink-2)",
        }}
      >
        {asset && (
          <div>
            <span style={{ color: "var(--ink-3)" }}>{t.caseAssetLabel}: </span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}>{asset}</span>
          </div>
        )}
        {persona && (
          <div>
            <span style={{ color: "var(--ink-3)" }}>{t.casePersonaLabel}: </span>
            <span>{persona}</span>
          </div>
        )}
        {clearance && (
          <div>
            <span style={{ color: "var(--ink-3)" }}>{t.caseClearanceLabel}: </span>
            <span style={{ color: "var(--brass)" }}>{clearance}</span>
          </div>
        )}
        {timestamp && (
          <div>
            <span style={{ color: "var(--ink-3)" }}>{t.caseLoggedLabel}: </span>
            <span>{timestamp}</span>
          </div>
        )}
      </div>
    </div>
  );
}
