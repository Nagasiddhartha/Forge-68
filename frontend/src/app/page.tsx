import React from "react";
import { Header } from "@/components/Header";
import { HealthMonitor } from "@/components/HealthMonitor";
import { SubsystemCard, SubsystemCardProps } from "@/components/SubsystemCard";

const SUBSYSTEMS: SubsystemCardProps[] = [
  {
    code: "MOD-01",
    name: "Model Provider Abstraction",
    description: "Pluggable sovereign inference gateway. Decouples agents from local runtime providers (Ollama, vLLM) with zero cloud SDK dependencies.",
    status: "active",
    path: "backend/app/models/",
    details: "OllamaProvider + Mock"
  },
  {
    code: "MOD-02",
    name: "Core Control Loop & Orchestrator",
    description: "Autonomous task dispatching, agent state transitions, and deterministic execution scheduling for industrial control workflows.",
    status: "ready",
    path: "backend/app/core/",
    details: "Lifecycle Scheduler"
  },
  {
    code: "MOD-03",
    name: "Security & Policy Gateway",
    description: "Zero-trust safety layer enforcing industrial execution constraints, operational boundary checks, and authorization tokens.",
    status: "ready",
    path: "backend/app/security/",
    details: "Boundary Validator"
  },
  {
    code: "MOD-04",
    name: "Sovereign Knowledge & RAG",
    description: "Air-gapped vector search and semantic retrieval using on-premise embeddings and local vector storage engines.",
    status: "ready",
    path: "backend/app/knowledge/",
    details: "Local Vector Store"
  },
  {
    code: "MOD-05",
    name: "Industrial Tool Sandboxes",
    description: "Audited execution harnesses for industrial protocols: SCADA queries, PLC telemetry, SQL mutations, and file operations.",
    status: "ready",
    path: "backend/app/tools/",
    details: "Protocol Adapters"
  },
  {
    code: "MOD-06",
    name: "Telemetry & Document Ingestion",
    description: "Streaming telemetry ingestion pipelines and local document parsers for schematics, technical manuals, and sensor data.",
    status: "ready",
    path: "backend/app/ingestion/",
    details: "Stream Ingester"
  },
  {
    code: "MOD-07",
    name: "Verification & Evidence Engine",
    description: "Deterministic proof generation, hallucination filtering, and cryptographic audit signatures before any physical actuation.",
    status: "ready",
    path: "backend/app/verification/",
    details: "Proof Validator"
  },
  {
    code: "MOD-08",
    name: "Tamper-Evident Audit Bus",
    description: "Append-only cryptographic event ledger capturing all prompts, completions, tool invocations, and state mutations.",
    status: "ready",
    path: "backend/app/audit/",
    details: "Immutable Ledger"
  }
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }} className="bg-grid">
      <Header />

      <main style={{
        flex: 1,
        maxWidth: "1400px",
        width: "100%",
        margin: "0 auto",
        padding: "36px 24px"
      }}>
        {/* Hero Section */}
        <section style={{ marginBottom: "32px" }}>
          <div style={{
            display: "inline-block",
            fontSize: "0.72rem",
            fontFamily: "var(--font-mono)",
            background: "rgba(0, 240, 255, 0.08)",
            color: "var(--accent-cyan)",
            padding: "4px 10px",
            borderRadius: "4px",
            border: "1px solid rgba(0, 240, 255, 0.2)",
            marginBottom: "12px",
            letterSpacing: "0.06em",
            textTransform: "uppercase"
          }}>
            Foundation Milestone &bull; Operational Control Plane
          </div>

          <h1 style={{
            fontSize: "2.4rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: "1.2",
            color: "#ffffff",
            marginBottom: "12px"
          }}>
            FORGE Industrial AI Control Plane
          </h1>

          <p style={{
            fontSize: "1.05rem",
            color: "var(--text-secondary)",
            maxWidth: "850px",
            lineHeight: "1.6"
          }}>
            Engineered exclusively for sovereign, air-gapped industrial infrastructure.
            Delivers autonomous agent orchestration, verification gateways, and audited tool execution
            with strictly zero transmission to external AI clouds.
          </p>
        </section>

        {/* Real-time Health Telemetry */}
        <HealthMonitor />

        {/* Monorepo Architecture Subsystems */}
        <section>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <div>
              <h2 style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#ffffff"
              }}>
                Architecture Subsystems & Monorepo Modules
              </h2>
              <p style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginTop: "2px"
              }}>
                Modular boundaries governing sovereign agent orchestration, safety verification, and execution.
              </p>
            </div>
            <div style={{
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              color: "var(--accent-cyan)",
              background: "rgba(0, 240, 255, 0.05)",
              border: "1px solid rgba(0, 240, 255, 0.2)",
              padding: "4px 10px",
              borderRadius: "4px"
            }}>
              8 MODULE DOMAINS ACTIVE
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: "20px"
          }}>
            {SUBSYSTEMS.map((subsystem) => (
              <SubsystemCard key={subsystem.code} {...subsystem} />
            ))}
          </div>
        </section>
      </main>

      <footer style={{
        borderTop: "1px solid var(--bg-surface-border)",
        background: "var(--bg-surface)",
        padding: "20px 24px",
        marginTop: "48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        fontSize: "0.78rem",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)"
      }}>
        <div>
          <span>FORGE CONTROL PLANE &bull; RUNTIME GOVERNANCE SPECIFICATION ACTIVE (AGENTS.md)</span>
        </div>
        <div>
          <span>ZERO EXTERNAL AI APIS &bull; SOVEREIGN LOCAL INFERENCE</span>
        </div>
      </footer>
    </div>
  );
}
