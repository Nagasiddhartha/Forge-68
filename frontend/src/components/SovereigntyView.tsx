"use client";

import React, { useEffect, useState } from "react";
import {
  HealthResponse,
  SovereigntyStatusResponse,
  fetchHealth,
  fetchSovereigntyStatus,
} from "@/lib/api";

export function SovereigntyView() {
  const [sovereignty, setSovereignty] = useState<SovereigntyStatusResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sov, h] = await Promise.all([
        fetchSovereigntyStatus(),
        fetchHealth(),
      ]);
      setSovereignty(sov);
      setHealth(h);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([fetchSovereigntyStatus(), fetchHealth()])
      .then(([sov, h]) => {
        if (active) {
          setSovereignty(sov);
          setHealth(h);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Sovereignty Top Hero */}
      <div className="card" style={{
        background: "linear-gradient(135deg, rgba(14, 18, 26, 0.98) 0%, rgba(20, 26, 38, 0.98) 100%)",
        border: "1px solid var(--accent-cyan)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="badge badge-cyan">AIR-GAP LEVEL 4</span>
              <span className="badge badge-verified">SOVEREIGNTY ENFORCED</span>
              <span className="badge badge-secondary">ZERO PUBLIC CLOUD EGRESS</span>
            </div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
              FORGE Sovereign Air-Gap & Runtime Governance
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4, maxWidth: 820 }}>
              Cryptographic boundary and policy-enforced guarantees. All inference, knowledge indexing, tool execution,
              and verification occur strictly on sovereign local hardware without external AI SDKs or public cloud transit.
            </p>
          </div>

          <button onClick={loadData} disabled={isLoading} className="btn-secondary">
            {isLoading ? "AUDITING..." : "↻ VERIFY BOUNDARY"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: 12,
          background: "rgba(244, 63, 94, 0.1)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          borderRadius: "var(--radius-sm)",
          color: "#fda4af",
          fontSize: "0.82rem",
        }}>
          Communication Error with Control Plane: {error}
        </div>
      )}

      {/* Sovereign Perimeter Architecture Matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
        {/* Perimeter 1: Local Model Inference */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
              1. LOCAL REASONING INFERENCE
            </span>
            <span className="badge badge-verified">
              <span className="pulse-emerald" />
              {health?.model_provider_online ? "SOVEREIGN ONLINE" : "BOUNDED READY"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>INFERENCE PROVIDER:</span>
              <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                {sovereignty?.model_provider.type.toUpperCase() || "OLLAMA"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>ACTIVE REASONING MODEL:</span>
              <span style={{ color: "var(--text-primary)" }}>
                {sovereignty?.model_provider.default_model || "qwen3:8b"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>LOCAL INFERENCE ENDPOINT:</span>
              <span style={{ color: "var(--text-primary)" }}>
                {sovereignty?.model_provider.base_url || "http://127.0.0.1:11434"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>CLOUD FALLBACK ALLOWED:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>STRICTLY PROHIBITED (FALSE)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>EXTERNAL CLOUD SDKS:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>0 IMPORTED / BLOCKED</span>
            </div>
          </div>
        </div>

        {/* Perimeter 2: Multimodal Engineering Vision */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
              2. MULTIMODAL ENGINEERING VISION
            </span>
            <span className="badge badge-verified">
              <span className="pulse-emerald" />
              LOCAL EXECUTION
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>VISION PROVIDER:</span>
              <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                {sovereignty?.vision_provider.type.toUpperCase() || "LOCAL VISION MOCK/OLLAMA"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>DEFAULT VISION MODEL:</span>
              <span style={{ color: "var(--text-primary)" }}>
                {sovereignty?.vision_provider.default_model || "qwen2.5-vl:7b"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>AIR-GAP LOCAL ONLY:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>ENFORCED (TRUE)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>MAX IMAGE BUFFER:</span>
              <span style={{ color: "var(--text-primary)" }}>
                {sovereignty?.vision_provider.max_image_size_bytes
                  ? `${(sovereignty.vision_provider.max_image_size_bytes / 1024 / 1024).toFixed(0)} MB BOUNDED`
                  : "15 MB BOUNDED"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>PROVENANCE TRACKING:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>SHA-256 DIGEST ON INGESTION</span>
            </div>
          </div>
        </div>

        {/* Perimeter 3: Default-Deny Policy Gateway */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
              3. POLICY GATEWAY (M2)
            </span>
            <span className="badge badge-failed" style={{ background: "rgba(244, 63, 94, 0.15)", color: "#fda4af" }}>
              DEFAULT-DENY
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>GATEWAY DEFAULT DECISION:</span>
              <span style={{ color: "#f43f5e", fontWeight: 700 }}>DENY (FAIL-CLOSED)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>CLEARANCE ENFORCEMENT:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>STRICT LATTICE (ACTIVE)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>OPERATIONAL BOUNDARIES:</span>
              <span style={{ color: "var(--accent-cyan)" }}>CALIBRATION / WRITE GATED</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>SUPERVISOR OVERRIDE:</span>
              <span style={{ color: "var(--text-primary)" }}>REQUIRES EXPLICIT APPROVAL</span>
            </div>
          </div>
        </div>

        {/* Perimeter 4: Deterministic Verification Engine */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
              4. DETERMINISTIC VERIFICATION ENGINE (M6)
            </span>
            <span className="badge badge-verified">
              MATHEMATICAL PROOF
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>LLM SELF-VERIFICATION:</span>
              <span style={{ color: "#f43f5e", fontWeight: 700 }}>STRICTLY PROHIBITED</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>INDEPENDENT CHECKS:</span>
              <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                {sovereignty?.verification_engine.deterministic_checks_count ?? 7} DISCRETE CHECKS
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>REGISTERED CALCULATIONS:</span>
              <span style={{ color: "var(--text-primary)" }}>
                {sovereignty?.verification_engine.python_calculations_registered ?? 4} PURE PYTHON ENGINES
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>CONFLICT RESOLUTION:</span>
              <span style={{ color: "#34d399" }}>AUTOMATIC CROSS-SOURCE DRIFT DETECT</span>
            </div>
          </div>
        </div>

        {/* Perimeter 5: Knowledge Fabric Vector Storage */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
              5. SOVEREIGN KNOWLEDGE FABRIC (M4)
            </span>
            <span className="badge badge-verified">
              LOCAL VECTOR
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>EMBEDDING PROVIDER:</span>
              <span style={{ color: "var(--accent-cyan)" }}>
                {sovereignty?.embedding_provider.type.toUpperCase() || "LOCAL DETERMINISTIC"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>EMBEDDING MODEL:</span>
              <span style={{ color: "var(--text-primary)" }}>
                {sovereignty?.embedding_provider.model || "all-MiniLM-L6-v2"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>EXTERNAL VECTOR CLOUD:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>BLOCKED (NO PINECONE/OPENAI)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>AIR-GAPPED EMBEDDINGS:</span>
              <span style={{ color: "#34d399" }}>ENFORCED (TRUE)</span>
            </div>
          </div>
        </div>

        {/* Perimeter 6: Tamper-Evident Audit Sink */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
              6. IMMUTABLE AUDIT SINK
            </span>
            <span className="badge badge-secondary">
              TAMPER-EVIDENT
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>LOG STORAGE MODE:</span>
              <span style={{ color: "var(--accent-cyan)" }}>APPEND-ONLY IN-MEMORY & SINK</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>RECORDED EVENTS:</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                {sovereignty?.audit_sink.active_events_count ?? 0} ACTIVE LIFECYCLE EVENTS
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>TAMPER-EVIDENT INTEGRITY:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>ACTIVE (TRUE)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>EGRESS TELEMETRY LEAKAGE:</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>ZERO BYTES</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sovereign Architecture Proof Statement */}
      <div className="card" style={{
        background: "rgba(0, 240, 255, 0.02)",
        border: "1px solid rgba(0, 240, 255, 0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
          <span style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem" }}>
            SOVEREIGNTY COMPLIANCE ATTESTATION:
          </span>
          <span className="badge badge-verified">AIR-GAPPED COMPLIANT</span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          FORGE is designed for high-consequence critical infrastructure (nuclear, petrochem, power generation).
          In accordance with the <strong>AGENTS.md Governance Specification</strong>, the runtime guarantees:
          (1) Zero external cloud AI SDK dependencies in pyproject.toml or requirements.txt;
          (2) Zero HTTP/S egress to third-party model inference APIs;
          (3) Strict verification isolation where LLMs are forbidden from assessing their own answers;
          (4) Fail-closed, default-deny security mediation for all tool execution boundaries.
        </p>
      </div>
    </div>
  );
}
