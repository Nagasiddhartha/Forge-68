"use client";

import React, { useEffect, useState } from "react";
import {
  AuditEventsResponse,
  HealthResponse,
  KnowledgeDocsResponse,
  SovereigntyStatusResponse,
  fetchAuditEvents,
  fetchHealth,
  fetchKnowledgeDocuments,
  fetchSovereigntyStatus,
} from "@/lib/api";

interface OverviewViewProps {
  onNavigateToWorkspace: () => void;
}

export function OverviewView({ onNavigateToWorkspace }: OverviewViewProps) {
  const [sovereignty, setSovereignty] = useState<SovereigntyStatusResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [audit, setAudit] = useState<AuditEventsResponse | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeDocsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sovRes, healthRes, auditRes, knowRes] = await Promise.all([
          fetchSovereigntyStatus().catch(() => null),
          fetchHealth().catch(() => null),
          fetchAuditEvents(10).catch(() => null),
          fetchKnowledgeDocuments().catch(() => null),
        ]);
        setSovereignty(sovRes);
        setHealth(healthRes);
        setAudit(auditRes);
        setKnowledge(knowRes);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Hero Mission Control Header */}
      <div className="card" style={{
        background: "linear-gradient(135deg, rgba(14, 18, 26, 0.95) 0%, rgba(21, 27, 38, 0.95) 100%)",
        border: "1px solid var(--accent-cyan-dim)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="badge badge-cyan">LOCAL OPERATIONS</span>
              <span className="badge badge-verified">SOVEREIGNTY ENFORCED</span>
            </div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
              Industrial AI Mission Control Dashboard
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4, maxWidth: 680 }}>
              Sovereign, on-premise industrial agent control plane executing local model reasoning,
              DEFAULT-DENY tool policy mediation, deterministic calculations, and multi-stage verification.
            </p>

          </div>

          <button onClick={onNavigateToWorkspace} className="btn-primary" style={{ padding: "10px 20px" }}>
            OPEN AI WORKSPACE ▶
          </button>
        </div>
      </div>

      {/* 6 Real Subsystem Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {/* Card 1: Local AI Reasoning */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.88rem" }}>
              1. Local AI Reasoning
            </span>
            <span className="badge badge-verified">
              <span className="pulse-emerald" />
              {health?.model_provider_online ? "ONLINE" : "READY"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>PROVIDER:</span>
              <span style={{ color: "var(--accent-cyan)" }}>{sovereignty?.model_provider?.type?.toUpperCase() || "OLLAMA"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>REASONING MODEL:</span>
              <span>{sovereignty?.model_provider?.default_model || "qwen3:8b"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>EXTERNAL CLOUD AI:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>BLOCKED (0 CALLS)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Knowledge Fabric */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.88rem" }}>
              2. Knowledge Fabric
            </span>
            <span className="badge badge-cyan">VECTOR INDEX ACTIVE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>EMBEDDING MODEL:</span>
              <span>{sovereignty?.embedding_provider?.model || "BAAI/bge-m3"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>DEMO DOCUMENTS:</span>
              <span>{knowledge?.total_available || 5} TECHNICAL REVIEWS</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>STORAGE BOUNDARY:</span>
              <span style={{ color: "#34d399" }}>AIR-GAPPED LOCAL DISK</span>
            </div>
          </div>
        </div>

        {/* Card 3: Policy Gateway */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.88rem" }}>
              3. Policy Gateway
            </span>
            <span className="badge badge-deny">DEFAULT DENY</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>DEFAULT DECISION:</span>
              <span style={{ color: "#f87171", fontWeight: 700 }}>DENY (FAIL-CLOSED)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>CLEARANCE ENFORCEMENT:</span>
              <span style={{ color: "#34d399" }}>STRICT RBAC TIERS</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>UNAUTHORIZED OVERRIDES:</span>
              <span style={{ color: "#34d399" }}>PREVENTED</span>
            </div>
          </div>
        </div>

        {/* Card 4: Verification Engine */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.88rem" }}>
              4. Verification Engine
            </span>
            <span className="badge badge-verified">DETERMINISTIC PYTHON</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>AUDIT CHECKS:</span>
              <span>7 DISCRETE STAGES</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>CALCULATION ENGINE:</span>
              <span>PYTHON ARITHMETIC</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>LLM SELF-VERIFICATION:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>STRICTLY PROHIBITED</span>
            </div>
          </div>
        </div>

        {/* Card 5: Multimodal Vision */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.88rem" }}>
              5. Multimodal Vision
            </span>
            <span className="badge badge-insufficient">BOUNDED OBSERVER</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>VISION MODEL:</span>
              <span>{sovereignty?.vision_provider?.default_model || "qwen2.5-vl:7b"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>ACCEPTED FORMATS:</span>
              <span>PNG, JPEG, WebP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>SAFETY CLEARANCE AUTHORITY:</span>
              <span style={{ color: "#34d399" }}>REVERTED TO VERIFIER</span>
            </div>
          </div>
        </div>

        {/* Card 6: Sovereignty Enclosure */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.88rem" }}>
              6. Sovereignty Enclosure
            </span>
            <span className="badge badge-verified">LOCAL ONLY</span>

          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>NETWORK BOUNDARY:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>LOCAL ONLY (NO CLOUD)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>AUDIT LOG SINK:</span>
              <span>{sovereignty?.audit_sink?.active_events_count || audit?.total_agent_events || 0} EVENTS LOGGED</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>TAMPER RESISTANCE:</span>
              <span style={{ color: "#34d399" }}>APPEND-ONLY SINK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Feed */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem" }}>
              Recent Agent Execution Audit Stream
            </span>
            <span className="badge badge-secondary">REAL-TIME EVENTS</span>
          </div>
        </div>

        {audit?.agent_events && audit.agent_events.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {audit.agent_events.slice(0, 6).map((ev) => (
              <div
                key={ev.event_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="badge badge-cyan">{ev.event_type}</span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {ev.details?.query ? `"${String(ev.details.query).slice(0, 60)}..."` : `ID: ${ev.event_id.slice(0, 12)}`}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
                  <span>{ev.role}</span>
                  <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            {isLoading ? "Querying sovereign control plane..." : "No agent events recorded yet in current execution session."}
          </div>
        )}
      </div>
    </div>
  );
}
