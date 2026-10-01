"use client";

import React, { useEffect, useState } from "react";
import {
  AgentQueryResponse,
  DataClassification,
  HealthResponse,
  Role,
  fetchHealth,
} from "@/lib/api";
import { NavTab, Navigation } from "@/components/Navigation";
import { OverviewView } from "@/components/OverviewView";
import { AIWorkspaceView } from "@/components/AIWorkspaceView";
import { KnowledgeView } from "@/components/KnowledgeView";
import { EvidencePanel } from "@/components/EvidencePanel";
import { VerificationPanel } from "@/components/VerificationPanel";
import { AuditView } from "@/components/AuditView";
import { SovereigntyView } from "@/components/SovereigntyView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [role, setRole] = useState<Role>("ENGINEER");
  const [clearance, setClearance] = useState<DataClassification>("CONFIDENTIAL");
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [lastResponse, setLastResponse] = useState<AgentQueryResponse | null>(null);

  // Poll health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const h = await fetchHealth();
        setHealth(h);
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleExecutionComplete = (resp: AgentQueryResponse) => {
    setLastResponse(resp);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }} className="bg-grid">
      {/* Sovereign Control Plane Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        role={role}
        onChangeRole={setRole}
        clearance={clearance}
        onChangeClearance={setClearance}
        backendOnline={backendOnline}
        version={health?.version || "0.8.0"}
      />

      {/* Main Operational Container */}
      <main style={{
        flex: 1,
        maxWidth: "1440px",
        width: "100%",
        margin: "0 auto",
        padding: "24px 24px 48px",
      }}>
        {activeTab === "overview" && (
          <OverviewView onNavigateToWorkspace={() => setActiveTab("workspace")} />
        )}

        {activeTab === "workspace" && (
          <AIWorkspaceView
            role={role}
            clearance={clearance}
            onExecutionComplete={handleExecutionComplete}
            lastResponse={lastResponse}
          />
        )}

        {activeTab === "knowledge" && (
          <KnowledgeView clearance={clearance} />
        )}

        {activeTab === "evidence" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ border: "1px solid var(--accent-cyan-dim)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span className="badge badge-cyan">EVIDENCE REGISTRY</span>
                    <span className="badge badge-verified">CRYPTOGRAPHIC PROVENANCE</span>
                  </div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Multi-Source Evidence Inspection Console
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>
                    Inspect typed evidence records across Document Chunks, Sandboxed Tool Executions, Visual Inspections, and Deterministic Calculations.
                  </p>
                </div>
                {!lastResponse && (
                  <button
                    onClick={() => setActiveTab("workspace")}
                    className="btn-primary"
                    style={{ fontSize: "0.78rem" }}
                  >
                    RUN WORKSPACE QUERY ▶
                  </button>
                )}
              </div>
            </div>

            <EvidencePanel
              evidenceSet={lastResponse?.evidence_set}
              calculations={lastResponse?.verification?.calculation_results || lastResponse?.verification?.calculations || []}
              title="Execution Evidence Records"
            />
          </div>
        )}

        {activeTab === "verification" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ border: "1px solid var(--accent-cyan-dim)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span className="badge badge-cyan">VERIFICATION CENTER</span>
                    <span className="badge badge-verified">DETERMINISTIC EVALUATION</span>
                    <span className="badge badge-failed">LLM SELF-VERIFICATION FORBIDDEN</span>
                  </div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Autonomous Verification Engine (M6)
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>
                    Independent verification evaluating provenance, completeness, policy compliance, parameter consistency,
                    and mathematical calculations without relying on LLM self-evaluation.
                  </p>
                </div>
                {!lastResponse && (
                  <button
                    onClick={() => setActiveTab("workspace")}
                    className="btn-primary"
                    style={{ fontSize: "0.78rem" }}
                  >
                    EXECUTE QUERY IN WORKSPACE ▶
                  </button>
                )}
              </div>
            </div>

            <VerificationPanel verification={lastResponse?.verification} />
          </div>
        )}

        {activeTab === "audit" && (
          <AuditView />
        )}

        {activeTab === "sovereignty" && (
          <SovereigntyView />
        )}
      </main>

      {/* Industrial Footer */}
      <footer style={{
        borderTop: "1px solid var(--bg-surface-border)",
        background: "var(--bg-surface)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.72rem",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span>FORGE CONTROL PLANE // AIR-GAPPED INDUSTRIAL RUNTIME</span>
          <span style={{ color: "var(--accent-cyan)" }}>POLICY: DEFAULT-DENY</span>
          <span style={{ color: "#34d399" }}>CLOUD SDKs: 0 LOADED</span>
        </div>
        <div>
          ACTIVE CLEARANCE: <strong style={{ color: "var(--text-primary)" }}>{clearance}</strong> &bull; PERSONA: <strong style={{ color: "var(--text-primary)" }}>{role}</strong>
        </div>
      </footer>
    </div>
  );
}
