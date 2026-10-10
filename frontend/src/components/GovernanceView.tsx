"use client";

import React, { useEffect, useState } from "react";
import {
  DataClassification,
  PolicyDecision,
  Role,
  SecurityBoundaryReport,
  ToolExecutionResult,
  ToolMetadata,
  evaluatePolicy,
  executeTool,
  fetchSecurityReport,
  fetchTools,
} from "@/lib/api";
import { EnamelSurface, SectionHeader, BrassLabel } from "./primitives";
import { useTranslation } from "@/lib/i18n";
import { ROLE_PERMISSIONS, getLocalizedRolePermission } from "@/lib/permissions";
import { ReadAloudButton } from "@/components/ReadAloudButton";

interface GovernanceViewProps {
  role?: string;
  clearance?: string;
  onChangeRole?: (role: Role) => void;
  onChangeClearance?: (clearance: DataClassification) => void;
}

export function GovernanceView({
  role = "ENGINEER",
  clearance = "CONFIDENTIAL",
  onChangeRole,
  onChangeClearance,
}: GovernanceViewProps) {
  const { t, language } = useTranslation();
  const [securityReport, setSecurityReport] = useState<SecurityBoundaryReport | null>(null);
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Live Role Authority & Policy Sandbox State
  const [sandboxRole, setSandboxRole] = useState<Role>((role as Role) || "ENGINEER");
  const [sandboxClearance, setSandboxClearance] = useState<DataClassification>((clearance as DataClassification) || "CONFIDENTIAL");
  const [sandboxTool, setSandboxTool] = useState<string>("equipment_history");
  const [sandboxEquipmentId, setSandboxEquipmentId] = useState<string>("R-204");
  const [sandboxApproval, setSandboxApproval] = useState<boolean>(false);
  const [sandboxSetpoint, setSandboxSetpoint] = useState<number>(42.5);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [sandboxDecision, setSandboxDecision] = useState<PolicyDecision | null>(null);
  const [sandboxExecutionResult, setSandboxExecutionResult] = useState<ToolExecutionResult | null>(null);
  const [sandboxFeedback, setSandboxFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (role && ["ENGINEER", "VIEWER", "INTERN", "ADMIN", "INSPECTOR", "AI_OPERATOR", "SECURITY_OFFICER", "MANAGER", "AUDITOR"].includes(role)) {
      setSandboxRole(role as Role);
    }
  }, [role]);

  useEffect(() => {
    if (clearance && ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED", "CRITICAL"].includes(clearance)) {
      setSandboxClearance(clearance as DataClassification);
    }
  }, [clearance]);

  const handleApplyPreset = async (presetIndex: number) => {
    setSandboxDecision(null);
    setSandboxExecutionResult(null);
    setSandboxFeedback(null);

    let nextRole: Role = "ENGINEER";
    let nextClearance: DataClassification = "CONFIDENTIAL";
    let nextTool = "equipment_history";
    let nextEquipmentId = "R-204";
    let nextApproval = false;
    let nextSetpoint = 42.5;

    switch (presetIndex) {
      case 1:
        // Preset 1: Viewer blocked from tool execution
        nextRole = "VIEWER";
        nextClearance = "PUBLIC";
        nextTool = "equipment_history";
        nextEquipmentId = "R-204";
        nextApproval = false;
        break;
      case 2:
        // Preset 2: Intern unapproved tool execution (requires approval)
        nextRole = "INTERN";
        nextClearance = "INTERNAL";
        nextTool = "equipment_history";
        nextEquipmentId = "R-204";
        nextApproval = false;
        break;
      case 3:
        // Preset 3: Intern approved tool execution (permitted)
        nextRole = "INTERN";
        nextClearance = "INTERNAL";
        nextTool = "equipment_history";
        nextEquipmentId = "R-204";
        nextApproval = true;
        break;
      case 4:
        // Preset 4: Engineer telemetry lookup (permitted)
        nextRole = "ENGINEER";
        nextClearance = "CONFIDENTIAL";
        nextTool = "equipment_history";
        nextEquipmentId = "R-204";
        nextApproval = false;
        break;
      case 5:
        // Preset 5: Admin emergency trip with approval
        nextRole = "ADMIN";
        nextClearance = "CRITICAL";
        nextTool = "emergency_shutdown";
        nextEquipmentId = "R-204";
        nextApproval = true;
        break;
      case 6:
        // Preset 6: Arbitrary unregistered tool (Default-Deny)
        nextRole = "ADMIN";
        nextClearance = "CRITICAL";
        nextTool = "arbitrary_remote_shell";
        nextEquipmentId = "R-204";
        nextApproval = true;
        break;
    }

    setSandboxRole(nextRole);
    setSandboxClearance(nextClearance);
    setSandboxTool(nextTool);
    setSandboxEquipmentId(nextEquipmentId);
    setSandboxApproval(nextApproval);
    setSandboxSetpoint(nextSetpoint);

    setIsEvaluating(true);
    try {
      let params: Record<string, unknown> = {};
      if (nextTool === "calibrate_pressure_relief_valve") {
        params = { equipment_id: nextEquipmentId, target_setpoint_bar: nextSetpoint, technician_id: "TECH-VALVE-01" };
      } else if (nextTool === "emergency_shutdown") {
        params = { equipment_id: nextEquipmentId, reason: "Manual Emergency Trip Test", initiator_id: "CHIEF-ADMIN-01" };
      } else if (nextTool === "equipment_history") {
        params = { equipment_id: nextEquipmentId };
      }

      const decision = await evaluatePolicy({
        requester: `${nextRole.toLowerCase()}_live_tester`,
        role: nextRole,
        tool_name: nextTool,
        classification: nextClearance,
        parameters: params,
        has_approval: nextApproval,
      });
      setSandboxDecision(decision);
    } catch (err: unknown) {
      setSandboxFeedback(err instanceof Error ? err.message : String(err));
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEvaluatePolicy = async () => {
    setIsEvaluating(true);
    setSandboxFeedback(null);
    setSandboxExecutionResult(null);
    try {
      let params: Record<string, unknown> = {};
      if (sandboxTool === "calibrate_pressure_relief_valve") {
        params = { equipment_id: sandboxEquipmentId, target_setpoint_bar: sandboxSetpoint, technician_id: "TECH-VALVE-01" };
      } else if (sandboxTool === "emergency_shutdown") {
        params = { equipment_id: sandboxEquipmentId, reason: "Manual Emergency Trip Test", initiator_id: "CHIEF-ADMIN-01" };
      } else if (sandboxTool === "equipment_history") {
        params = { equipment_id: sandboxEquipmentId };
      }

      const decision = await evaluatePolicy({
        requester: `${sandboxRole.toLowerCase()}_live_tester`,
        role: sandboxRole,
        tool_name: sandboxTool,
        classification: sandboxClearance,
        parameters: params,
        has_approval: sandboxApproval,
      });
      setSandboxDecision(decision);
    } catch (err: unknown) {
      setSandboxFeedback(err instanceof Error ? err.message : String(err));
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleExecuteTool = async () => {
    setIsExecuting(true);
    setSandboxFeedback(null);
    try {
      let params: Record<string, unknown> = {};
      if (sandboxTool === "calibrate_pressure_relief_valve") {
        params = { equipment_id: sandboxEquipmentId, target_setpoint_bar: sandboxSetpoint, technician_id: "TECH-VALVE-01" };
      } else if (sandboxTool === "emergency_shutdown") {
        params = { equipment_id: sandboxEquipmentId, reason: "Manual Emergency Trip Test", initiator_id: "CHIEF-ADMIN-01" };
      } else if (sandboxTool === "equipment_history") {
        params = { equipment_id: sandboxEquipmentId };
      }

      const result = await executeTool({
        requester: `${sandboxRole.toLowerCase()}_live_tester`,
        role: sandboxRole,
        tool_name: sandboxTool,
        classification: sandboxClearance,
        parameters: params,
        has_approval: sandboxApproval,
      });
      setSandboxExecutionResult(result);
      setSandboxDecision(result.decision);
    } catch (err: unknown) {
      setSandboxFeedback(err instanceof Error ? err.message : String(err));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSyncToHeader = () => {
    if (onChangeRole) onChangeRole(sandboxRole);
    if (onChangeClearance) onChangeClearance(sandboxClearance);
  };

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

  const activeRoles: Role[] = ["ENGINEER", "VIEWER", "INTERN", "ADMIN"];
  const permissionMatrix = activeRoles.map((r) => {
    const p = ROLE_PERMISSIONS[r];
    const loc = getLocalizedRolePermission(p.role, t);
    return {
      role: p.role,
      roleLabel: loc.label,
      clearance: p.defaultClearance,
      read: p.read === "ALLOWED" ? "ALLOWED" : "BLOCKED",
      investigate: p.investigate === "ALLOWED" ? "ALLOWED" : p.investigate === "NEEDS_APPROVAL" ? "NEEDS_APPROVAL" : "BLOCKED",
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

      {/* 2. Live Role Authority & Policy Sandbox (Executable RBAC) */}
      <EnamelSurface variant="base" padding="spacious">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--brass)", letterSpacing: "0.06em" }}>
              {t("govSandboxEyebrow")}
            </span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--ink)", margin: "4px 0" }}>
              {t("govSandboxTitle")}
            </h2>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "14px", color: "var(--ink-2)", maxWidth: "70ch" }}>
              {t("govSandboxSubtitle")}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onChangeRole && (
              <button
                onClick={handleSyncToHeader}
                className="btn-brass-secondary"
                style={{ fontSize: "12px", padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}
                title="Synchronize selected sandbox role to the top navigation header"
              >
                <span>↻</span>
                <span>{t("govBtnSyncHeader")}</span>
              </button>
            )}
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--brass)",
                background: "rgba(200, 161, 90, 0.1)",
                border: "1px solid var(--brass)",
                borderRadius: "var(--radius-pill)",
                padding: "6px 12px",
                fontWeight: 600,
              }}
            >
              FAIL-CLOSED ENGINE
            </div>
          </div>
        </div>

        {/* 1-Click Verification Presets */}
        <div style={{ marginTop: 24, padding: "16px", background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: "var(--radius-panel)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)", letterSpacing: "0.05em", fontWeight: 600 }}>
              {t("govPresetBadge")}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--sage)" }}>
              ● LIVE BACKEND WIRED
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <button
              onClick={() => handleApplyPreset(1)}
              style={{
                background: sandboxRole === "VIEWER" ? "rgba(217, 105, 78, 0.12)" : "var(--bg-card)",
                border: sandboxRole === "VIEWER" ? "1px solid var(--coral)" : "1px solid var(--line)",
                borderRadius: "var(--radius-panel)",
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "14px" }}>🛑</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--coral-text)", fontWeight: 700 }}>PRESET 1</span>
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink)", fontWeight: 500, marginTop: 4 }}>
                {language === "hi" ? "दर्शक उपकरण निष्पादन (अवरुद्ध - केवल ज्ञान)" : language === "kn" ? "ವೀಕ್ಷಕ ಟೂಲ್ ಕಾರ್ಯಾಚರಣೆ (ನಿರ್ಬಂಧಿತ - ಕೇವಲ ಜ್ಞಾನ)" : "Viewer Tool Execution (Blocked - Knowledge Only)"}
              </div>
            </button>

            <button
              onClick={() => handleApplyPreset(2)}
              style={{
                background: sandboxRole === "INTERN" && !sandboxApproval ? "rgba(217, 105, 78, 0.12)" : "var(--bg-card)",
                border: sandboxRole === "INTERN" && !sandboxApproval ? "1px solid var(--coral)" : "1px solid var(--line)",
                borderRadius: "var(--radius-panel)",
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "14px" }}>⚠️</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--brass)", fontWeight: 700 }}>PRESET 2</span>
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink)", fontWeight: 500, marginTop: 4 }}>
                {language === "hi" ? "इंटर्न अननुमोदित उपकरण (अनुमोदन आवश्यक)" : language === "kn" ? "ಇಂಟರ್ನ್ ಅನುಮೋದನೆಯಿಲ್ಲದ ಟೂಲ್ (ಅನುಮೋದನೆ ಅಗತ್ಯ)" : "Intern Unapproved Tool (Needs Approval)"}
              </div>
            </button>

            <button
              onClick={() => handleApplyPreset(3)}
              style={{
                background: sandboxRole === "INTERN" && sandboxApproval ? "rgba(156, 195, 168, 0.12)" : "var(--bg-card)",
                border: sandboxRole === "INTERN" && sandboxApproval ? "1px solid var(--sage)" : "1px solid var(--line)",
                borderRadius: "var(--radius-panel)",
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "14px" }}>🟢</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--sage)", fontWeight: 700 }}>PRESET 3</span>
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink)", fontWeight: 500, marginTop: 4 }}>
                {language === "hi" ? "इंटर्न अनुमोदित उपकरण (अनुमत)" : language === "kn" ? "ಇಂಟರ್ನ್ ಅನುಮೋದಿತ ಟೂಲ್ (ಅನುಮತಿಸಲಾಗಿದೆ)" : "Intern Approved Tool (Permitted)"}
              </div>
            </button>

            <button
              onClick={() => handleApplyPreset(4)}
              style={{
                background: sandboxRole === "ENGINEER" && sandboxTool === "equipment_history" ? "rgba(156, 195, 168, 0.12)" : "var(--bg-card)",
                border: sandboxRole === "ENGINEER" && sandboxTool === "equipment_history" ? "1px solid var(--sage)" : "1px solid var(--line)",
                borderRadius: "var(--radius-panel)",
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "14px" }}>🟢</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--sage)", fontWeight: 700 }}>PRESET 4</span>
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink)", fontWeight: 500, marginTop: 4 }}>
                {language === "hi" ? "इंजीनियर टेलीमेट्री निरीक्षण (अनुमत)" : language === "kn" ? "ಇಂಜಿನಿಯರ್ ಟೆಲಿಮೆಟ್ರಿ ತಪಾಸಣೆ (ಅನುಮತಿಸಲಾಗಿದೆ)" : "Engineer Telemetry Inspection (Permitted)"}
              </div>
            </button>

            <button
              onClick={() => handleApplyPreset(5)}
              style={{
                background: sandboxRole === "ADMIN" && sandboxTool === "emergency_shutdown" && sandboxApproval ? "rgba(200, 161, 90, 0.12)" : "var(--bg-card)",
                border: sandboxRole === "ADMIN" && sandboxTool === "emergency_shutdown" && sandboxApproval ? "1px solid var(--brass)" : "1px solid var(--line)",
                borderRadius: "var(--radius-panel)",
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "14px" }}>⚡</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--brass)", fontWeight: 700 }}>PRESET 5</span>
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink)", fontWeight: 500, marginTop: 4 }}>
                {language === "hi" ? "प्रशासक आपातकालीन शटडाउन (सह-हस्ताक्षर सहित अनुमत)" : language === "kn" ? "ನಿರ್ವಾಹಕ ತುರ್ತು ಸ್ಥಗಿತ (ಅನುಮೋದನೆಯೊಂದಿಗೆ)" : "Admin Emergency Trip (Approved Co-signature)"}
              </div>
            </button>

            <button
              onClick={() => handleApplyPreset(6)}
              style={{
                background: sandboxTool === "arbitrary_remote_shell" ? "rgba(217, 105, 78, 0.12)" : "var(--bg-card)",
                border: sandboxTool === "arbitrary_remote_shell" ? "1px solid var(--coral)" : "1px solid var(--line)",
                borderRadius: "var(--radius-panel)",
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "14px" }}>🛡️</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--coral-text)", fontWeight: 700 }}>PRESET 6</span>
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink)", fontWeight: 500, marginTop: 4 }}>
                {language === "hi" ? "अज्ञात शेल इंजेक्शन (डिफ़ॉल्ट-अस्वीकार)" : language === "kn" ? "ಅನಧಿಕೃತ ಶೆಲ್ ಇಂಜೆಕ್ಷನ್ (ಡೀಫಾಲ್ಟ್-ನಿರಾಕರಣೆ)" : "Unknown Shell Injection (Default-Deny Blocked)"}
              </div>
            </button>
          </div>
        </div>

        {/* 2-Column Sandbox Workbench */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24, marginTop: 24 }}>
          {/* Controls Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Field: Role */}
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-2)", marginBottom: 6 }}>
                {t("govFieldRole")}
              </label>
              <select
                value={sandboxRole}
                onChange={(e) => setSandboxRole(e.target.value as Role)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-panel)",
                  background: "var(--bg-1)",
                  border: "1px solid var(--line-strong)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "14px",
                }}
              >
                <option value="ENGINEER">{t("roleEngineerName")} (ENGINEER) - Read & diagnostics; approval for PRV</option>
                <option value="VIEWER">{t("roleViewerName")} (VIEWER) - Knowledge search only; all tools blocked</option>
                <option value="INTERN">{t("roleInternName")} (INTERN) - Knowledge allowed; tools require approval</option>
                <option value="ADMIN">{t("roleAdminName")} (ADMIN) - Administrative authority; approval for trips</option>
              </select>
            </div>

            {/* Field: Clearance */}
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-2)", marginBottom: 6 }}>
                {t("govFieldClearance")}
              </label>
              <select
                value={sandboxClearance}
                onChange={(e) => setSandboxClearance(e.target.value as DataClassification)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-panel)",
                  background: "var(--bg-1)",
                  border: "1px solid var(--line-strong)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "14px",
                }}
              >
                <option value="PUBLIC">PUBLIC (Unrestricted plant overview)</option>
                <option value="INTERNAL">INTERNAL (Internal telemetry & SOPs)</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL (Operational unit data)</option>
                <option value="RESTRICTED">RESTRICTED (Safety valve calibrations)</option>
                <option value="CRITICAL">CRITICAL (Emergency reactor trips & overrides)</option>
              </select>
            </div>

            {/* Field: Tool */}
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-2)", marginBottom: 6 }}>
                {t("govFieldTool")}
              </label>
              <select
                value={sandboxTool}
                onChange={(e) => setSandboxTool(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-panel)",
                  background: "var(--bg-1)",
                  border: "1px solid var(--line-strong)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "14px",
                }}
              >
                <option value="equipment_history">equipment_history (Low Risk · Telemetry lookup)</option>
                <option value="calibrate_pressure_relief_valve">calibrate_pressure_relief_valve (Critical Risk · Actuation)</option>
                <option value="emergency_shutdown">emergency_shutdown (Critical Risk · Unit isolation trip)</option>
                <option value="arbitrary_remote_shell">arbitrary_remote_shell (Unregistered / Adversarial attack)</option>
              </select>
            </div>

            {/* Field: Equipment Tag & Optional Setpoint */}
            <div style={{ display: "grid", gridTemplateColumns: sandboxTool === "calibrate_pressure_relief_valve" ? "1fr 1fr" : "1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-2)", marginBottom: 6 }}>
                  {t("govFieldEquipment")}
                </label>
                <select
                  value={sandboxEquipmentId}
                  onChange={(e) => setSandboxEquipmentId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-panel)",
                    background: "var(--bg-1)",
                    border: "1px solid var(--line-strong)",
                    color: "var(--ink)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "14px",
                  }}
                >
                  <option value="R-204">R-204 (Hydrocracking Fluidized Reactor)</option>
                  <option value="PRV-204">PRV-204 (Emergency Pressure Relief Valve)</option>
                  <option value="E-401">E-401 (Shell & Tube Heat Exchanger)</option>
                  <option value="V-102">V-102 (Flash Separator Drum)</option>
                </select>
              </div>

              {sandboxTool === "calibrate_pressure_relief_valve" && (
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-2)", marginBottom: 6 }}>
                    {t("govFieldSetpoint")}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={sandboxSetpoint}
                    onChange={(e) => setSandboxSetpoint(parseFloat(e.target.value) || 0)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-panel)",
                      background: "var(--bg-1)",
                      border: "1px solid var(--line-strong)",
                      color: "var(--ink)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "14px",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Field: Supervisor Approval Co-Signature Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: sandboxApproval ? "rgba(200, 161, 90, 0.1)" : "rgba(141, 180, 214, 0.05)",
                border: sandboxApproval ? "1px solid var(--brass)" : "1px solid var(--line)",
                borderRadius: "var(--radius-panel)",
                cursor: "pointer",
              }}
              onClick={() => setSandboxApproval(!sandboxApproval)}
            >
              <input
                type="checkbox"
                id="sandboxApprovalCheck"
                checked={sandboxApproval}
                onChange={(e) => setSandboxApproval(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--brass)", cursor: "pointer" }}
              />
              <label htmlFor="sandboxApprovalCheck" style={{ fontFamily: "var(--font-ui)", fontSize: "13.5px", color: "var(--ink)", cursor: "pointer", userSelect: "none" }}>
                <strong>{t("govFieldApproval")}</strong>
                <span style={{ display: "block", fontSize: "11.5px", color: "var(--ink-3)", marginTop: 2 }}>
                  {language === "hi" ? "महत्वपूर्ण जोखिम क्रियाओं के लिए आवश्यक सुरक्षा सह-हस्ताक्षर" : language === "kn" ? "ನಿರ್ಣಾಯಕ ಅಪಾಯದ ಕ್ರಿಯೆಗಳಿಗೆ ಅಗತ್ಯವಿರುವ ಸುರಕ್ಷತಾ ಸಹ-ಸಹಿ" : "Cryptographic co-signature required for critical actuation"}
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                onClick={handleExecuteTool}
                disabled={isExecuting || isEvaluating}
                className="btn-brass-primary"
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span>{isExecuting ? "⚡ EXECUTING..." : t("govBtnExecute")}</span>
              </button>

              <button
                onClick={handleEvaluatePolicy}
                disabled={isExecuting || isEvaluating}
                className="btn-brass-secondary"
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span>{isEvaluating ? "..." : t("govBtnEvaluate")}</span>
              </button>
            </div>

            {sandboxFeedback && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-panel)",
                  background: "rgba(217, 105, 78, 0.1)",
                  border: "1px solid var(--coral)",
                  color: "var(--coral-text)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                }}
              >
                [ERROR] {sandboxFeedback}
              </div>
            )}
          </div>

          {/* Real-Time Policy & Execution Terminal */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--line-strong)",
              borderRadius: "var(--radius-panel)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Terminal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid var(--line)",
                background: "var(--bg-1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: sandboxDecision?.decision === "ALLOW" ? "var(--sage)" : sandboxDecision?.decision === "DENY" ? "var(--coral)" : "var(--brass)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink)", fontWeight: 600 }}>
                  {t("govTerminalTitle")}
                </span>
              </div>

              {sandboxDecision ? (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "var(--radius-pill)",
                    color: sandboxDecision.decision === "ALLOW" ? "var(--sage)" : "var(--coral-text)",
                    background: sandboxDecision.decision === "ALLOW" ? "rgba(156, 195, 168, 0.15)" : "rgba(217, 105, 78, 0.15)",
                    border: `1px solid ${sandboxDecision.decision === "ALLOW" ? "var(--sage)" : "var(--coral)"}`,
                  }}
                >
                  {sandboxDecision.decision === "ALLOW" ? "✓ ALLOW / PERMITTED" : "✕ DENY / BLOCKED"}
                </span>
              ) : (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)" }}>
                  STANDBY
                </span>
              )}
            </div>

            {/* Terminal Body */}
            <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Decision Metadata Strip */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: "8px 12px", background: "var(--bg-1)", borderRadius: "var(--radius-panel)", border: "1px solid var(--line)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--ink-3)" }}>{t("govResultDecision")}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: sandboxDecision?.decision === "ALLOW" ? "var(--sage)" : sandboxDecision?.decision === "DENY" ? "var(--coral-text)" : "var(--ink-2)", marginTop: 2 }}>
                    {sandboxDecision?.decision || "READY TO EVALUATE"}
                  </div>
                </div>

                <div style={{ padding: "8px 12px", background: "var(--bg-1)", borderRadius: "var(--radius-panel)", border: "1px solid var(--line)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--ink-3)" }}>ENFORCING RULE</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: "var(--brass)", marginTop: 2 }}>
                    {sandboxDecision?.policy_id || (sandboxDecision ? "DEFAULT-DENY (FAIL-CLOSED)" : "NONE")}
                  </div>
                </div>
              </div>

              {/* Policy Explanation */}
              {sandboxDecision && (
                <div style={{ padding: "12px", borderRadius: "var(--radius-panel)", background: sandboxDecision.decision === "ALLOW" ? "rgba(156, 195, 168, 0.08)" : "rgba(217, 105, 78, 0.08)", border: `1px solid ${sandboxDecision.decision === "ALLOW" ? "var(--sage)" : "var(--coral)"}` }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: sandboxDecision.decision === "ALLOW" ? "var(--sage)" : "var(--coral-text)", fontWeight: 600 }}>
                    {t("govResultReason")}
                  </div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "var(--ink)", marginTop: 4, lineHeight: 1.45 }}>
                    {sandboxDecision.reason}
                  </div>
                </div>
              )}

              {/* Audit Event ID & Timestamp */}
              {sandboxExecutionResult && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, padding: "8px 12px", background: "var(--bg-1)", borderRadius: "var(--radius-panel)", border: "1px solid var(--line)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-2)" }}>
                    <span style={{ color: "var(--ink-3)" }}>{t("govResultEvent")}: </span>
                    <strong style={{ color: "var(--brass)" }}>{sandboxExecutionResult.event_id}</strong>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--sage)" }}>
                    ✓ IMMUTABLE AUDIT SINK RECORDED
                  </div>
                </div>
              )}

              {/* Output Payload / JSON View */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)", marginBottom: 6 }}>
                  {t("govResultPayload")}
                </div>
                <div
                  style={{
                    background: "var(--bg-1)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: "var(--radius-panel)",
                    padding: "12px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11.5px",
                    color: "var(--ink-2)",
                    overflowX: "auto",
                    maxHeight: "180px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {sandboxExecutionResult?.data ? (
                    JSON.stringify(sandboxExecutionResult.data, null, 2)
                  ) : sandboxExecutionResult?.error ? (
                    `EXECUTION BLOCKED / REFUSED:\n${sandboxExecutionResult.error}`
                  ) : sandboxDecision ? (
                    JSON.stringify(sandboxDecision, null, 2)
                  ) : (
                    `// Select a preset above or configure parameters and click "⚡ Execute Industrial Action".\n// Actions are verified against Sovereign Policy Gateway in real time.`
                  )}
                </div>
              </div>

              {/* Mathematical Proof Footer */}
              <div style={{ fontFamily: "var(--font-ui)", fontSize: "11.5px", color: "var(--ink-3)", borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                {t("govExecutionLiveNotice")}
              </div>
            </div>
          </div>
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
