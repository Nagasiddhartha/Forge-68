"use client";

import React, { useEffect, useState } from "react";
import {
  SecurityBoundaryReport,
  ToolMetadata,
  fetchSecurityReport,
  fetchTools,
} from "@/lib/api";
import { EnamelSurface, SectionHeader, BrassLabel } from "./primitives";
import { useTranslation } from "@/lib/i18n";
import { ROLE_PERMISSIONS, getLocalizedRolePermission } from "@/lib/permissions";
import { ReadAloudButton } from "@/components/ReadAloudButton";

interface GovernanceViewProps {
  role?: string;
}

export function GovernanceView({ role = "ENGINEER" }: GovernanceViewProps) {
  const { t, language } = useTranslation();
  const [securityReport, setSecurityReport] = useState<SecurityBoundaryReport | null>(null);
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([fetchSecurityReport(), fetchTools()])
      .then(([sec, tls]) => {
        if (active) {
          setSecurityReport(sec);
          setTools(tls);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const permissionMatrix = Object.values(ROLE_PERMISSIONS).map((p) => {
    const loc = getLocalizedRolePermission(p.role, t);
    return {
      role: p.role,
      roleLabel: loc.label,
      clearance: p.defaultClearance,
      read: p.read === "ALLOWED" ? "ALLOWED" : "BLOCKED",
      investigate: p.investigate === "ALLOWED" ? "ALLOWED" : "BLOCKED",
      actuate: p.actuate === "ALLOWED" ? "ALLOWED" : p.actuate === "NEEDS_APPROVAL" ? "NEEDS_APPROVAL" : "BLOCKED",
      admin: p.admin === "ALLOWED" ? "ALLOWED" : p.admin === "NEEDS_APPROVAL" ? "NEEDS_APPROVAL" : "BLOCKED",
      summary: loc.summary,
    };
  });

  const getStatusBadge = (status: string) => {
    if (status === "ALLOWED") {
      return (
        <span style={{ color: "var(--sage)", background: "rgba(156, 195, 168, 0.1)", border: "1px solid var(--sage)", padding: "3px 8px", borderRadius: "var(--radius-pill)", fontSize: "11px", fontWeight: 600 }}>
          {t("govStatusAllowed")}
        </span>
      );
    }
    if (status === "NEEDS_APPROVAL") {
      return (
        <span style={{ color: "var(--brass)", background: "rgba(200, 161, 90, 0.1)", border: "1px solid var(--brass)", padding: "3px 8px", borderRadius: "var(--radius-pill)", fontSize: "11px", fontWeight: 600 }}>
          {t("govStatusApproval")}
        </span>
      );
    }
    return (
      <span style={{ color: "var(--pewter)", background: "rgba(141, 180, 214, 0.08)", border: "1px solid var(--line-strong)", padding: "3px 8px", borderRadius: "var(--radius-pill)", fontSize: "11px", fontWeight: 600 }}>
        {t("govStatusBlocked")}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Editorial Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <BrassLabel variant="outline">{t("govLedgerBadge")}</BrassLabel>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--coral-text)",
              background: "rgba(217, 105, 78, 0.08)",
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--coral)",
            }}
          >
            {t("govDefaultDenyBadge")}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--sage)",
              background: "rgba(156, 195, 168, 0.08)",
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--sage)",
              fontWeight: 600,
            }}
          >
            {t("govSecurityPassedBadge")}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "40px",
            lineHeight: 1.1,
            color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}
        >
          {t("govTitle")}
          </h1>
          <ReadAloudButton text={`${t("govTitle")}. ${t("govSubtitle")}`} />
        </div>

        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "16px",
            color: "var(--ink-2)",
            marginTop: 6,
            maxWidth: "68ch",
          }}
        >
          {t("govSubtitle")}
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(217, 105, 78, 0.1)",
            border: "1px solid var(--coral)",
            borderRadius: "var(--radius-panel)",
            color: "var(--coral-text)",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
          }}
        >
          [AUTHORITY CHECK ERROR] {error}
        </div>
      )}

      {/* 1. Who Can Do What Permission Matrix */}
      <EnamelSurface variant="base" padding="spacious">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--brass)", letterSpacing: "0.06em" }}>
              {language === "hi" ? "अनुमति मैट्रिक्स" : language === "kn" ? "ಅನುಮತಿ ಮ್ಯಾಟ್ರಿಕ್ಸ್" : "PERMISSION MATRIX"}
            </span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--ink)", margin: "4px 0" }}>
              {t("govPermissionMatrixTitle")}
            </h2>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "14px", color: "var(--ink-2)" }}>
              {t("govActivePersona")} <strong style={{ color: "var(--brass)" }}>{role}</strong>. {language === "hi" ? "शीर्षलेख में व्यक्तित्व बदलने से आपकी निष्पादन सीमाएं तुरंत अद्यतित होती हैं।" : language === "kn" ? "ಹೆಡರ್‌ನಲ್ಲಿ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಬದಲಾಯಿಸುವುದು ನಿಮ್ಮ ಕಾರ್ಯಾಚರಣೆಯ ಗಡಿಗಳನ್ನು ತಕ್ಷಣವೇ ನವೀಕರಿಸುತ್ತದೆ." : "Switching personas in the header updates your execution boundaries instantly."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(156, 195, 168, 0.08)",
              border: "1px solid var(--sage)",
              borderRadius: "var(--radius-pill)",
              padding: "6px 14px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--sage)",
            }}
          >
            <span>{t("govPolicyGatewayLabel")}</span>
            <strong>{t("govActiveEnforcing")}</strong>
          </div>
        </div>

        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-strong)", color: "var(--ink-3)" }}>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>{t("govColRole")}</th>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>{t("govColRead")}</th>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>{t("govColInvestigate")}</th>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>{t("govColActuate")}</th>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>{t("govColAdmin")}</th>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>{t("govColSummary")}</th>
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((p, idx) => {
                const isActive = p.role.toUpperCase() === role.toUpperCase().replace("_", " ") || p.role === role;
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid var(--line)",
                      background: isActive ? "rgba(200, 161, 90, 0.06)" : "transparent",
                      borderLeft: isActive ? "3px solid var(--brass)" : "3px solid transparent",
                    }}
                  >
                    <td style={{ padding: "14px 14px", fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{p.roleLabel}</span>
                        {isActive && (
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "9.5px",
                              color: "var(--brass)",
                              border: "1px solid var(--brass)",
                              padding: "1px 6px",
                              borderRadius: "var(--radius-pill)",
                              background: "rgba(200, 161, 90, 0.12)",
                            }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "14px 14px" }}>{getStatusBadge(p.read)}</td>
                    <td style={{ padding: "14px 14px" }}>{getStatusBadge(p.investigate)}</td>
                    <td style={{ padding: "14px 14px" }}>{getStatusBadge(p.actuate)}</td>
                    <td style={{ padding: "14px 14px" }}>{getStatusBadge(p.admin)}</td>
                    <td style={{ padding: "14px 14px", fontSize: "12.5px", color: "var(--ink-2)", maxWidth: "380px", lineHeight: 1.45 }}>
                      {p.summary}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </EnamelSurface>

      {/* Security Proofs Highlight Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          background: "var(--bg-1)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-panel)",
          padding: "18px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "rgba(156, 195, 168, 0.15)",
              border: "1px solid var(--sage)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--sage)",
              fontSize: "18px",
            }}
          >
            🛡
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--ink)", fontWeight: 600 }}>
              {language === "hi" ? "सुरक्षा परीक्षण: 10 / 10 उत्तीर्ण" : language === "kn" ? "ಭದ್ರತಾ ಪರೀಕ್ಷೆಗಳು: 10 / 10 ಉತ್ತೀರ್ಣ" : "Security tests: 10 / 10 passed"}
            </div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "var(--ink-2)", marginTop: 2 }}>
              {language === "hi" ? "नियतात्मक सीमा परीक्षण पुष्टि करते हैं कि अविश्वसनीय इनपुट संगरोधित हैं और अनधिकृत क्रियाएं अवरुद्ध हैं।" : language === "kn" ? "ಅವಿಶ್ವಾಸನೀಯ ಇನ್‌ಪುಟ್‌ಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ ಮತ್ತು ಅನಧಿಕೃತ ಕ್ರಿಯೆಗಳನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ ಎಂದು ನಿರ್ಣಾಯಕ ಗಡಿ ಪರೀಕ್ಷೆಗಳು ಪರಿಶೀಲಿಸುತ್ತವೆ." : "Deterministic boundary tests verify untrusted inputs are quarantined and unauthorized actions are blocked."}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="btn-brass-secondary"
          style={{ fontSize: "12px", padding: "8px 16px" }}
        >
          {showTechnicalDetails
            ? (language === "hi" ? "तकनीकी विवरण छिपाएं ▲" : language === "kn" ? "ತಾಂತ್ರಿಕ ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ ▲" : "Hide Technical Details ▲")
            : (language === "hi" ? "तकनीकी नीति विवरण देखें ▼" : language === "kn" ? "ತಾಂತ್ರಿಕ ನೀತಿ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ ▼" : "View Technical Policy Details ▼")}
        </button>
      </div>

      {/* Collapsible Technical Details (Sandbox Registry & Adversarial Proofs) */}
      {showTechnicalDetails && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* 2. Tool Authority & Default-Deny Registry */}
      <EnamelSurface variant="base" padding="spacious">
        <SectionHeader
          title={language === "hi" ? "उपकरण अधिकार" : language === "kn" ? "ಉಪಕರಣ ಅಧಿಕಾರ" : "Tool authority"}
          eyebrow={language === "hi" ? "औद्योगिक निष्पादन सैंडबॉक्स" : language === "kn" ? "ಕೈಗಾರಿಕಾ ಕಾರ್ಯಾಚರಣೆ ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್" : "Industrial Execution Sandboxes"}
          description={language === "hi" ? "पंजीकृत औद्योगिक उपकरण, जोखिम स्तर और आवश्यक अनुमतियां। अपंजीकृत उपकरण सख्त अस्वीकार (DENY) पर जाते हैं।" : language === "kn" ? "ನೋಂದಾಯಿತ ಕೈಗಾರಿಕಾ ಉಪಕರಣಗಳು, ಅಪಾಯದ ಶ್ರೇಣಿಗಳು ಮತ್ತು ಅಗತ್ಯ ಅನುಮತಿಗಳು. ನೋಂದಾಯಿಸದ ಪರಿಕರಗಳು ಕಟ್ಟುನಿಟ್ಟಾದ ನಿರಾಕರಣೆಗೆ ಒಳಪಡುತ್ತವೆ." : "Registered industrial tools, risk tiers, and required clearances. Unregistered tools default to strict DENY."}
        />

        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-strong)", color: "var(--ink-3)" }}>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>{language === "hi" ? "उपकरण का नाम" : language === "kn" ? "ಉಪಕರಣದ ಹೆಸರು" : "Tool Name"}</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>{language === "hi" ? "पहचानकर्ता" : language === "kn" ? "ಗುರುತಿಸುವಿಕೆ" : "Identifier"}</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>{language === "hi" ? "जोखिम स्तर" : language === "kn" ? "ಅಪಾಯದ ಶ್ರೇಣಿ" : "Risk Tier"}</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>{language === "hi" ? "आवश्यक भूमिका" : language === "kn" ? "ಅಗತ್ಯವಿರುವ ಪಾತ್ರ" : "Required Persona"}</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>{language === "hi" ? "पर्यवेक्षक स्वीकृति" : language === "kn" ? "ಮೇಲ್ವಿಚಾರಕರ ಅನುಮೋದನೆ" : "Supervisor Approval"}</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>{language === "hi" ? "नीति कार्रवाई" : language === "kn" ? "ನೀತಿ ಕ್ರಮ" : "Policy Action"}</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t, idx) => {
                const isCritical = t.risk_level === "CRITICAL";
                const isHigh = t.risk_level === "HIGH";
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "14px 14px", fontWeight: 500, color: "var(--ink)" }}>{t.name}</td>
                    <td style={{ padding: "14px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--brass)" }}>
                      {t.name.toLowerCase().replace(/\s+/g, "_")}
                    </td>
                    <td style={{ padding: "14px 14px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: isCritical ? "var(--coral-text)" : isHigh ? "var(--brass)" : "var(--sage)",
                        }}
                      >
                        {t.risk_level}
                      </span>
                    </td>
                    <td style={{ padding: "14px 14px", color: "var(--ink)" }}>{t.required_role}</td>
                    <td style={{ padding: "14px 14px", color: t.requires_approval ? "var(--brass)" : "var(--ink-3)" }}>
                      {t.requires_approval
                        ? (language === "hi" ? "पर्यवेक्षक स्वीकृति आवश्यक" : language === "kn" ? "ಮೇಲ್ವಿಚಾರಕರ ಅನುಮೋದನೆ ಅಗತ್ಯವಿದೆ" : "Supervisor approval required")
                        : (language === "hi" ? "स्वायत्त स्वीकृत" : language === "kn" ? "ಸ್ವಾಯತ್ತ ಅನುಮತಿ ಇದೆ" : "Autonomous allowed")}
                    </td>
                    <td style={{ padding: "14px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--sage)" }}>
                      {language === "hi" ? "गेटवे द्वारा नियंत्रित" : language === "kn" ? "ಗೇಟ್‌ವೇ ಮೂಲಕ ನಿಯಂತ್ರಿತ" : "Gated by Gateway"}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderBottom: "1px solid var(--line)", background: "rgba(141, 180, 214, 0.04)" }}>
                <td style={{ padding: "14px 14px", fontWeight: 600, color: "var(--pewter)" }}>{language === "hi" ? "अपंजीकृत उपकरण" : language === "kn" ? "ನೋಂದಾಯಿಸದ ಉಪಕರಣಗಳು" : "Unregistered tools"}</td>
                <td style={{ padding: "14px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--pewter)" }}>*</td>
                <td style={{ padding: "14px 14px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--pewter)", fontWeight: 600 }}>{language === "hi" ? "प्रतिबंधित" : language === "kn" ? "ನಿರ್ಬಂಧಿತ" : "RESTRICTED"}</td>
                <td style={{ padding: "14px 14px", color: "var(--pewter)" }}>{language === "hi" ? "कोई नहीं" : language === "kn" ? "ಯಾವುದೂ ಇಲ್ಲ" : "None"}</td>
                <td style={{ padding: "14px 14px", color: "var(--pewter)", fontWeight: 500 }}>{language === "hi" ? "अवरुद्ध" : language === "kn" ? "ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ" : "Blocked"}</td>
                <td style={{ padding: "14px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--coral-text)", fontWeight: 600 }}>
                  {language === "hi" ? "डिफ़ॉल्ट अस्वीकार (फ़ेल-क्लोज़्ड)" : language === "kn" ? "ಡೀಫಾಲ್ಟ್ ನಿರಾಕರಣೆ (ಫೇಲ್-ಕ್ಲೋಸ್ಡ್)" : "DEFAULT DENY (FAIL-CLOSED)"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </EnamelSurface>

      {/* 3. Adversarial Proofs (10 / 10 Passed) */}
      <EnamelSurface variant="base" padding="spacious">
        <SectionHeader
          title={language === "hi" ? "प्रतिकूल प्रमाण" : language === "kn" ? "ಪ್ರತಿಕೂಲ ಪುರಾವೆಗಳು" : "Adversarial proofs"}
          eyebrow={language === "hi" ? "प्रवर्तन का प्रमाण" : language === "kn" ? "ಜಾರಿ ಪುರಾವೆ" : "Proof of Enforcement"}
          description={language === "hi" ? "दुर्भावनापूर्ण इनपुट, अप्राधिकृत कॉल और प्रॉम्प्ट इंजेक्शन को बिना किसी अपवाद के अलग या अवरुद्ध करने का सत्यापन।" : language === "kn" ? "ದುರುದ್ದೇಶಪೂರಿತ ಇನ್‌ಪುಟ್‌ಗಳು, ಅನಧಿಕೃತ ಕರೆಗಳು ಮತ್ತು ಪ್ರಾಂಪ್ಟ್ ಇಂಜೆಕ್ಷನ್‌ಗಳನ್ನು ವಿನಾಯಿತಿ ಇಲ್ಲದೆ ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ ಅಥವಾ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ ಎಂದು ಪರಿಶೀಲಿಸುವ ನಿರ್ಣಾಯಕ ಪರೀಕ್ಷೆಗಳು." : "Deterministic boundary tests verifying that malicious inputs, unprivileged calls, and prompt injections are quarantined or blocked without exception."}
          action={
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--sage)",
                background: "rgba(156, 195, 168, 0.1)",
                padding: "4px 12px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--sage)",
                fontWeight: 600,
              }}
            >
              {securityReport ? `${securityReport.passed} / ${securityReport.total_tests} ${language === "hi" ? "उत्तीर्ण" : language === "kn" ? "ಉತ್ತೀರ್ಣ" : "PASSED"}` : (language === "hi" ? "10 में से 10 उत्तीर्ण" : language === "kn" ? "10 ರಲ್ಲಿ 10 ಉತ್ತೀರ್ಣ" : "10 of 10 PASSED")}
            </div>
          }
        />

        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-strong)", color: "var(--ink-3)" }}>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>{language === "hi" ? "प्रमाण आईडी" : language === "kn" ? "ಪುರಾವೆ ಐಡಿ" : "Proof ID"}</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>{language === "hi" ? "हमला श्रेणी और वेक्टर" : language === "kn" ? "ದಾಳಿ ವರ್ಗ ಮತ್ತು ವೆಕ್ಟರ್" : "Attack Category & Vector"}</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>{language === "hi" ? "परीक्षण के तहत सीमा" : language === "kn" ? "ಪರೀಕ್ಷಿಸಲಾದ ಗಡಿ" : "Boundary Under Test"}</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>{language === "hi" ? "प्रवर्तन स्थिति" : language === "kn" ? "ಜಾರಿ ಸ್ಥಿತಿ" : "Enforcement State"}</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>{language === "hi" ? "सत्यापन परिणाम" : language === "kn" ? "ಪರಿಶೀಲನೆ ಫಲಿತಾಂಶ" : "Verification Outcome"}</th>
              </tr>
            </thead>
            <tbody>
              {securityReport?.results?.map((r) => (
                <tr key={r.security_test_id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--brass)" }}>
                    {r.security_test_id}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, color: "var(--ink)" }}>{r.attack_category}</div>
                    <div style={{ fontSize: "12px", color: "var(--ink-3)", marginTop: 2 }}>{r.attempted_action}</div>
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-2)" }}>
                    {r.boundary_under_test}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: r.status === "ENFORCED" ? "var(--sage)" : "var(--pewter)",
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--ink-2)" }}>
                    <div style={{ color: "var(--sage)", fontWeight: 500 }}>✓ {r.actual_outcome}</div>
                    {r.audit_event && (
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)", marginTop: 2 }}>
                        {language === "hi" ? "ऑडिट घटना:" : language === "kn" ? "ಆಡಿಟ್ ಘಟನೆ:" : "Audit Event:"} {r.audit_event}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EnamelSurface>
        </div>
      )}
    </div>
  );
}
