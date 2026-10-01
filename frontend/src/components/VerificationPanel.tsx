"use client";

import React, { useState } from "react";
import { VerificationCheck, VerificationResult, VerificationStatus } from "@/lib/api";

interface VerificationPanelProps {
  verification?: VerificationResult | null;
}

export function VerificationPanel({ verification }: VerificationPanelProps) {
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null);

  if (!verification) {
    return (
      <div className="card">
        <div className="card-header">
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem" }}>
            Verification & Trust Engine
          </span>
          <span className="badge badge-secondary">IDLE</span>
        </div>
        <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
            No verification result loaded.
          </p>
          <p style={{ fontSize: "0.78rem", marginTop: 6 }}>
            Run an agent query or image analysis to trigger independent deterministic verification.
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "VERIFIED":
        return <span className="badge badge-verified">VERIFIED</span>;
      case "PARTIALLY_VERIFIED":
        return <span className="badge badge-review">PARTIALLY VERIFIED</span>;
      case "NEEDS_REVIEW":
        return <span className="badge badge-review">NEEDS REVIEW</span>;
      case "INSUFFICIENT_EVIDENCE":
        return <span className="badge badge-insufficient">INSUFFICIENT EVIDENCE</span>;
      case "FAILED":
        return <span className="badge badge-failed">FAILED</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const getCheckStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "VERIFIED":
        return <span className="badge badge-verified">PASSED</span>;
      case "NEEDS_REVIEW":
        return <span className="badge badge-review">NEEDS REVIEW</span>;
      case "INSUFFICIENT_EVIDENCE":
        return <span className="badge badge-insufficient">INSUFFICIENT</span>;
      case "FAILED":
        return <span className="badge badge-failed">FAILED</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="card">
      {/* Overall Assessment Header */}
      <div className="card-header" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.05rem" }}>
              Independent Trust Assessment
            </span>
            {getStatusBadge(verification.status)}
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
            ID: {verification.verification_id} | EVALUATED: {verification.timestamp || "RECENT"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge badge-cyan">DETERMINISTIC PYTHON ENGINE</span>
          <span className="badge badge-secondary">{verification.checks.length} CHECKS</span>
        </div>
      </div>

      {/* Summary Box */}
      <div
        style={{
          background:
            verification.status === "VERIFIED"
              ? "rgba(16, 185, 129, 0.08)"
              : verification.status === "NEEDS_REVIEW"
              ? "rgba(255, 170, 0, 0.08)"
              : "rgba(244, 63, 94, 0.08)",
          border: `1px solid ${
            verification.status === "VERIFIED"
              ? "rgba(16, 185, 129, 0.3)"
              : verification.status === "NEEDS_REVIEW"
              ? "rgba(255, 170, 0, 0.3)"
              : "rgba(244, 63, 94, 0.3)"
          }`,
          borderRadius: "var(--radius-sm)",
          padding: "12px 14px",
          marginBottom: 16,
        }}
      >
        <div style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          color:
            verification.status === "VERIFIED"
              ? "var(--accent-emerald)"
              : verification.status === "NEEDS_REVIEW"
              ? "var(--accent-amber)"
              : "var(--accent-rose)",
          marginBottom: 4,
          textTransform: "uppercase",
        }}>
          Verification Engine Summary
        </div>
        <p style={{ fontSize: "0.84rem", color: "var(--text-primary)", lineHeight: 1.45 }}>
          {verification.summary}
        </p>
      </div>

      {/* Detected Parameter Variances / Conflicts if present */}
      {verification.conflicts && verification.conflicts.length > 0 && (
        <div
          style={{
            background: "rgba(255, 170, 0, 0.06)",
            border: "1px solid rgba(255, 170, 0, 0.35)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span className="badge badge-warn">PARAMETER VARIANCE DETECTED</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              Requires Human Engineering Review
            </span>
          </div>
          {verification.conflicts.map((c, i) => (
            <div key={i} style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.4 }}>
              <strong>{c.metric_or_topic.toUpperCase()}:</strong> {c.source_a} ({c.value_a}) vs {c.source_b} ({c.value_b})
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: 2 }}>{c.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* 7 Deterministic Checks Breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{
          fontSize: "0.78rem",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
        }}>
          Multi-Stage Deterministic Audit Checks
        </span>

        {verification.checks.map((chk: VerificationCheck) => {
          const isExpanded = expandedCheckId === chk.check_id;
          const hasDetails = chk.details && Object.keys(chk.details).length > 0;

          return (
            <div
              key={chk.check_id}
              style={{
                background: "var(--bg-surface-elevated)",
                border: "1px solid var(--bg-surface-border)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {getCheckStatusBadge(chk.status)}
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}>
                    {chk.check_type}
                  </span>
                </div>

                {hasDetails && (
                  <button
                    onClick={() => setExpandedCheckId(isExpanded ? null : chk.check_id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--accent-cyan)",
                      fontSize: "0.72rem",
                      fontFamily: "var(--font-mono)",
                      cursor: "pointer",
                    }}
                  >
                    {isExpanded ? "HIDE DETAILS ▲" : "SHOW DETAILS ▼"}
                  </button>
                )}
              </div>

              <p style={{ fontSize: "0.79rem", color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.4 }}>
                {chk.description}
              </p>

              {chk.evidence_ids && chk.evidence_ids.length > 0 && (
                <div style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginTop: 6,
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                }}>
                  <span>EVIDENCE:</span>
                  {chk.evidence_ids.map((id) => (
                    <span key={id} style={{ color: "var(--accent-cyan)" }}>
                      {id}
                    </span>
                  ))}
                </div>
              )}

              {isExpanded && hasDetails && (
                <pre className="code-block" style={{ marginTop: 8 }}>
                  {JSON.stringify(chk.details, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
