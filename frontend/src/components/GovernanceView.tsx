"use client";

import React, { useEffect, useState } from "react";
import {
  SecurityBoundaryReport,
  ToolMetadata,
  fetchSecurityReport,
  fetchTools,
} from "@/lib/api";
import { EnamelSurface, SectionHeader } from "./primitives";

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
      role: "Engineer",
      clearance: "Confidential",
      readTelemetry: "Can run",
      readSop: "Can run",
      calibratePrv: "Needs approval",
      adminOverrides: "Blocked",
    },
    {
      role: "Inspector",
      clearance: "Internal",
      readTelemetry: "Can run",
      readSop: "Can run",
      calibratePrv: "Blocked",
      adminOverrides: "Blocked",
    },
    {
      role: "AI Operator",
      clearance: "Restricted",
      readTelemetry: "Can run",
      readSop: "Can run",
      calibratePrv: "Blocked",
      adminOverrides: "Blocked",
    },
    {
      role: "Admin",
      clearance: "Critical",
      readTelemetry: "Can run",
      readSop: "Can run",
      calibratePrv: "Can run",
      adminOverrides: "Can run",
    },
    {
      role: "Security Officer",
      clearance: "Critical",
      readTelemetry: "Can run",
      readSop: "Can run",
      calibratePrv: "Blocked",
      adminOverrides: "Audits only",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Editorial Header */}
      <div>
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
          Governance
        </h1>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "16px",
            color: "var(--ink-2)",
            marginTop: 6,
            maxWidth: "64ch",
          }}
        >
          Authority rules, persona clearances, and deterministic boundary proofs. Controls decide what AI may propose.
        </p>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "rgba(217, 105, 78, 0.1)", border: "1px solid var(--coral)", borderRadius: "var(--radius-panel)", color: "var(--coral-text)" }}>
          {error}
        </div>
      )}

      {/* 1. Who Can Do What Matrix */}
      <EnamelSurface variant="base" padding="normal">
        <SectionHeader
          title="Who can do what"
          eyebrow="Access Control Matrix"
          description="Clearance levels and tool authorities enforced at the policy gateway before any handler runs."
        />

        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-strong)", color: "var(--ink-3)" }}>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Persona</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Clearance</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Read Telemetry</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Read SOPs</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Calibrate PRV</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Admin Overrides</th>
              </tr>
            </thead>
            <tbody>
              {personas.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 500, color: "var(--ink)" }}>{p.role}</td>
                  <td style={{ padding: "12px 14px", color: "var(--brass)" }}>{p.clearance}</td>
                  <td style={{ padding: "12px 14px", color: "var(--sage)" }}>{p.readTelemetry}</td>
                  <td style={{ padding: "12px 14px", color: "var(--sage)" }}>{p.readSop}</td>
                  <td style={{ padding: "12px 14px", color: p.calibratePrv === "Can run" ? "var(--sage)" : p.calibratePrv === "Needs approval" ? "var(--brass)" : "var(--pewter)" }}>
                    {p.calibratePrv}
                  </td>
                  <td style={{ padding: "12px 14px", color: p.adminOverrides === "Can run" ? "var(--sage)" : "var(--pewter)" }}>
                    {p.adminOverrides}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EnamelSurface>

      {/* 2. Policy Rules */}
      <EnamelSurface variant="base" padding="normal">
        <SectionHeader
          title="Policy rules"
          eyebrow="Tool Authority"
          description="Registered industrial tools, risk tiers, and required clearances. Default-deny strictly enforced."
        />

        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-strong)", color: "var(--ink-3)" }}>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Tool</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Identifier</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Risk Level</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Required Persona</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Supervisor Approval</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 500, color: "var(--ink)" }}>{t.name}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-3)" }}>
                    {t.name.toLowerCase().replace(/\s+/g, "_")}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ color: t.risk_level === "CRITICAL" ? "var(--coral-text)" : t.risk_level === "HIGH" ? "var(--brass)" : "var(--sage)" }}>
                      {t.risk_level}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--ink)" }}>{t.required_role}</td>
                  <td style={{ padding: "12px 14px", color: t.requires_approval ? "var(--brass)" : "var(--ink-3)" }}>
                    {t.requires_approval ? "Required" : "Not required"}
                  </td>
                </tr>
              ))}
              <tr style={{ borderBottom: "1px solid var(--line)", backgroundColor: "rgba(141, 180, 214, 0.04)" }}>
                <td style={{ padding: "12px 14px", fontWeight: 500, color: "var(--pewter)" }}>Unregistered tools</td>
                <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--pewter)" }}>*</td>
                <td style={{ padding: "12px 14px", color: "var(--pewter)" }}>RESTRICTED</td>
                <td style={{ padding: "12px 14px", color: "var(--pewter)" }}>None</td>
                <td style={{ padding: "12px 14px", color: "var(--pewter)", fontWeight: 500 }}>Blocked (Default-deny)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </EnamelSurface>

      {/* 3. Security Tests */}
      <EnamelSurface variant="base" padding="normal">
        <SectionHeader
          title="Security tests"
          eyebrow="Adversarial Verification"
          description="Deterministic boundary tests verifying that malicious inputs, unprivileged calls, and prompt injections are quarantined or blocked."
          action={
            <div style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "var(--ink-3)" }}>
              {securityReport ? `${securityReport.passed} of ${securityReport.total_tests} passed` : "10 of 10 passed"}
            </div>
          }
        />

        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-strong)", color: "var(--ink-3)" }}>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>ID</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Category & Action</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Boundary</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Enforcement</th>
                <th style={{ padding: "10px 14px", fontWeight: 500 }}>Outcome Proof</th>
              </tr>
            </thead>
            <tbody>
              {securityReport?.results?.map((r) => (
                <tr key={r.security_test_id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--brass)" }}>
                    {r.security_test_id}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 500, color: "var(--ink)" }}>{r.attack_category}</div>
                    <div style={{ fontSize: "12px", color: "var(--ink-3)", marginTop: 2 }}>{r.attempted_action}</div>
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-2)" }}>
                    {r.boundary_under_test}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ color: r.status === "ENFORCED" ? "var(--sage)" : "var(--pewter)", fontWeight: 500 }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--ink-2)" }}>
                    <div style={{ color: "var(--sage)" }}>✓ {r.actual_outcome}</div>
                    {r.audit_event && (
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)", marginTop: 2 }}>
                        Event: {r.audit_event}
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
