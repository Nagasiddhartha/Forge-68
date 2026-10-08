import React from "react";
import { Locale, TRANSLATIONS } from "@/lib/i18n";

export type VerdictType =
  | "VERIFIED"
  | "REVIEW_REQUIRED"
  | "INSUFFICIENT_EVIDENCE"
  | "ACTION_BLOCKED"
  | "QUARANTINED"
  | "FAILED";

export interface VerdictBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  verdict: VerdictType | string;
  locale?: Locale;
}

export function VerdictBadge({ verdict, locale = "en", className = "", style, ...props }: VerdictBadgeProps) {
  const normVerdict = verdict.toUpperCase().replace(/\s+/g, "_");
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  const getLocalizedLabel = (norm: string): string => {
    switch (norm) {
      case "VERIFIED":
        return t.verified;
      case "REVIEW_REQUIRED":
      case "NEEDS_REVIEW":
        return t.needsReview;
      case "INSUFFICIENT_EVIDENCE":
        return t.insufficientEvidence;
      case "ACTION_BLOCKED":
      case "POLICY_DENIED":
        return t.actionBlocked;
      case "QUARANTINED":
        return t.quarantined;
      case "FAILED":
        return t.failed;
      default:
        return verdict;
    }
  };

  const config: Record<
    string,
    { outlineColor: string; textColor: string; bg: string; icon: React.ReactNode; isDashed?: boolean }
  > = {
    VERIFIED: {
      outlineColor: "var(--sage)",
      textColor: "var(--sage)",
      bg: "rgba(156, 195, 168, 0.08)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    REVIEW_REQUIRED: {
      outlineColor: "var(--brass)",
      textColor: "var(--brass)",
      bg: "rgba(200, 161, 90, 0.08)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    NEEDS_REVIEW: {
      outlineColor: "var(--brass)",
      textColor: "var(--brass)",
      bg: "rgba(200, 161, 90, 0.08)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    INSUFFICIENT_EVIDENCE: {
      outlineColor: "var(--mist)",
      textColor: "var(--mist)",
      bg: "rgba(159, 177, 169, 0.08)",
      isDashed: true,
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3">
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    ACTION_BLOCKED: {
      outlineColor: "var(--pewter)",
      textColor: "var(--pewter)",
      bg: "rgba(141, 180, 214, 0.08)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    POLICY_DENIED: {
      outlineColor: "var(--pewter)",
      textColor: "var(--pewter)",
      bg: "rgba(141, 180, 214, 0.08)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    QUARANTINED: {
      outlineColor: "var(--pewter)",
      textColor: "var(--pewter)",
      bg: "rgba(141, 180, 214, 0.08)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    FAILED: {
      outlineColor: "var(--coral)",
      textColor: "var(--coral-text)",
      bg: "rgba(217, 105, 78, 0.08)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  };

  const item = config[normVerdict] || {
    outlineColor: "var(--mist)",
    textColor: "var(--mist)",
    bg: "rgba(159, 177, 169, 0.08)",
    icon: null,
  };

  const label = getLocalizedLabel(normVerdict);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-ui)",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: 1,
        letterSpacing: "0.02em",
        border: `${item.isDashed ? "1px dashed" : "1px solid"} ${item.outlineColor}`,
        color: item.textColor,
        backgroundColor: item.bg,
        ...style,
      }}
      className={`verdict-badge ${className}`}
      {...props}
    >
      {item.icon}
      <span>{label}</span>
    </span>
  );
}
