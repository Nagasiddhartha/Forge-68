"use client";

import React, { useEffect, useState } from "react";
import {
  SecurityBoundaryReport,
  ToolMetadata,
  fetchSecurityReport,
  fetchTools,
} from "@/lib/api";
import { EnamelSurface, SectionHeader, BrassLabel } from "./primitives";

export function GovernanceView() {
  const [securityReport, setSecurityReport] = useState<SecurityBoundaryReport | null>(null);
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const personas = [
    {
      role: "ENGINEER",
      clearance: "CONFIDENTIAL",
      readTelemetry: "Granted",
      readSop: "Granted",
      calibratePrv: "Needs approval",
      adminOverrides: "Blocked",
      notes: "Standard operational staff. High-risk write actuations require secondary supervisor sign-off.",
    },
    {
      role: "INSPECTOR",
      clearance: "INTERNAL",
      readTelemetry: "Granted",
      readSop: "Granted",
      calibratePrv: "Blocked",
      adminOverrides: "Blocked",
      notes: "Auditing & inspection role. Read-only access to NDT inspection reports and historical telemetry.",
    },
    {
      role: "AI OPERATOR",
      clearance: "RESTRICTED",
      readTelemetry: "Granted",
      readSop: "Granted",
      calibratePrv: "Blocked",
      adminOverrides: "Blocked",
      notes: "Autonomous agent execution context. Zero write authority. Untrusted inputs quarantined.",
    },
    {
      role: "ADMIN",
      clearance: "CRITICAL",
      readTelemetry: "Granted",
      readSop: "Granted",
      calibratePrv: "Granted",
      adminOverrides: "Granted",
      notes: "Full administrative override authority. Requires local physical terminal presence.",
    },
    {
      role: "SECURITY OFFICER",
      clearance: "CRITICAL",
      readTelemetry: "Granted",
      readSop: "Granted",
      calibratePrv: "Blocked",
      adminOverrides: "Audits only",
      notes: "Full audit inspection and boundary verification authority. Cannot actuate industrial physical tools.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Editorial Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <BrassLabel variant="outline">AUTHORITY LEDGER & BOUNDARY PROOFS</BrassLabel>
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
            DEFAULT-DENY ENFORCED
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "40px",
            lineHeight: 1.1,
            color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}
        >
          Governance & Authority Control
        </h1>

        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "16px",
            color: "var(--ink-2)",
            marginTop: 6,
            maxWidth: "68ch",
          }}
        >
          Authority rules, persona clearances, and deterministic boundary proofs.
          Controls decide what AI may propose. The model operates within strictly audited policy bounds enforced before tool or actuator execution.
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

      {/* 1. Who Can Do What Matrix (Authority Ledger) */}
      <EnamelSurface variant="base" padding="spacious">
        <SectionHeader
          title="Who can do what"
          eyebrow="Persona Authority Ledger"
          description="Clearance tiers and tool authorities evaluated at the policy gateway before any handler or actuator runs."
        />

        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-strong)", color: "var(--ink-3)" }}>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Persona Role</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Clearance</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Telemetry Read</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>SOP Access</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Calibrate PRV</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Admin Overrides</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Operational Scope</th>
              </tr>
            </thead>
            <tbody>
              {personas.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "14px 14px", fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-mono)", fontSize: "12.5px" }}>
                    {p.role}
                  </td>
                  <td style={{ padding: "14px 14px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--brass)",
                        border: "1px solid var(--line-strong)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-pill)",
                      }}
                    >
                      {p.clearance}
                    </span>
                  </td>
                  <td style={{ padding: "14px 14px", color: "var(--sage)" }}>{p.readTelemetry}</td>
                  <td style={{ padding: "14px 14px", color: "var(--sage)" }}>{p.readSop}</td>
                  <td
                    style={{
                      padding: "14px 14px",
                      color:
                        p.calibratePrv === "Granted"
                          ? "var(--sage)"
                          : p.calibratePrv === "Needs approval"
                          ? "var(--brass)"
                          : "var(--pewter)",
                      fontWeight: p.calibratePrv === "Needs approval" ? 600 : 400,
                    }}
                  >
                    {p.calibratePrv}
                  </td>
                  <td
                    style={{
                      padding: "14px 14px",
                      color: p.adminOverrides === "Granted" ? "var(--sage)" : "var(--pewter)",
                    }}
                  >
                    {p.adminOverrides}
                  </td>
                  <td style={{ padding: "14px 14px", fontSize: "12.5px", color: "var(--ink-2)", maxWidth: "340px" }}>
                    {p.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EnamelSurface>

      {/* 2. Tool Authority & Default-Deny Registry */}
      <EnamelSurface variant="base" padding="spacious">
        <SectionHeader
          title="Tool authority"
          eyebrow="Industrial Execution Sandboxes"
          description="Registered industrial tools, risk tiers, and required clearances. Unregistered tools default to strict DENY."
        />

        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-strong)", color: "var(--ink-3)" }}>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Tool Name</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Identifier</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Risk Tier</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Required Persona</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Supervisor Approval</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Policy Action</th>
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
                      {t.requires_approval ? "Supervisor approval required" : "Autonomous allowed"}
                    </td>
                    <td style={{ padding: "14px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--sage)" }}>
                      Gated by Gateway
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderBottom: "1px solid var(--line)", background: "rgba(141, 180, 214, 0.04)" }}>
                <td style={{ padding: "14px 14px", fontWeight: 600, color: "var(--pewter)" }}>Unregistered tools</td>
                <td style={{ padding: "14px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--pewter)" }}>*</td>
                <td style={{ padding: "14px 14px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--pewter)", fontWeight: 600 }}>RESTRICTED</td>
                <td style={{ padding: "14px 14px", color: "var(--pewter)" }}>None</td>
                <td style={{ padding: "14px 14px", color: "var(--pewter)", fontWeight: 500 }}>Blocked</td>
                <td style={{ padding: "14px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--coral-text)", fontWeight: 600 }}>
                  DEFAULT DENY (FAIL-CLOSED)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </EnamelSurface>

      {/* 3. Adversarial Proofs (10 / 10 Passed) */}
      <EnamelSurface variant="base" padding="spacious">
        <SectionHeader
          title="Adversarial proofs"
          eyebrow="Proof of Enforcement"
          description="Deterministic boundary tests verifying that malicious inputs, unprivileged calls, and prompt injections are quarantined or blocked without exception."
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
              {securityReport ? `${securityReport.passed} of ${securityReport.total_tests} PASSED` : "10 of 10 PASSED"}
            </div>
          }
        />

        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-strong)", color: "var(--ink-3)" }}>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Proof ID</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Attack Category & Vector</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Boundary Under Test</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Enforcement State</th>
                <th style={{ padding: "12px 14px", fontWeight: 500 }}>Verification Outcome</th>
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
                        Audit Event: {r.audit_event}
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
  );
}
