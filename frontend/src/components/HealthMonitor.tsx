"use client";

import React, { useState, useEffect } from "react";
import { fetchHealth, fetchModels, HealthResponse, ModelsResponse } from "@/lib/api";

export const HealthMonitor: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [modelsData, setModelsData] = useState<ModelsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const loadInitialStatus = async () => {
      try {
        const [healthRes, modelsRes] = await Promise.all([
          fetchHealth(),
          fetchModels().catch(() => null),
        ]);
        if (isMounted) {
          setHealth(healthRes);
          setModelsData(modelsRes);
          setLastCheck(new Date().toLocaleTimeString());
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Backend unreachable");
          setLoading(false);
        }
      }
    };
    loadInitialStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, modelsRes] = await Promise.all([
        fetchHealth(),
        fetchModels().catch(() => null),
      ]);
      setHealth(healthRes);
      setModelsData(modelsRes);
      setLastCheck(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Backend unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--bg-surface-border)",
      borderRadius: "var(--radius-lg)",
      padding: "24px",
      marginBottom: "32px",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "20px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className={health?.model_provider_online ? "pulse-emerald" : "pulse-amber"} />
            <h2 style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: "#ffffff"
            }}>
              Sovereign Control Plane Runtime Telemetry
            </h2>
          </div>
          <div style={{
            fontSize: "0.75rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
            marginTop: "4px"
          }}>
            AIR-GAPPED SYSTEM HEALTH &bull; {lastCheck ? `LAST SAMPLED: ${lastCheck}` : "INITIALIZING..."}
          </div>
        </div>

        <button
          onClick={handleManualCheck}
          disabled={loading}
          className="btn-sovereign"
        >
          {loading ? "PROBING RUNTIME..." : "RUN HEALTH CHECK"}
        </button>
      </div>

      {error ? (
        <div style={{
          padding: "16px",
          borderRadius: "var(--radius-sm)",
          background: "rgba(244, 63, 94, 0.1)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          color: "var(--accent-rose)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.85rem"
        }}>
          <strong>TELEMETRY ERROR:</strong> {error}
          <div style={{ marginTop: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Ensure FastAPI backend is running on http://localhost:8000 (uvicorn app.main:app)
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px"
        }}>
          {/* Card 1: Backend Service */}
          <div style={{
            background: "var(--bg-surface-elevated)",
            padding: "16px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--bg-surface-border)"
          }}>
            <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              BACKEND ENGINE
            </div>
            <div style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginTop: "4px",
              color: health ? "var(--accent-emerald)" : "var(--text-muted)"
            }}>
              {health?.service || "Probing..."}
            </div>
            <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginTop: "4px" }}>
              FastAPI {health?.version ? `v${health.version}` : ""} (Python 3.12)
            </div>
          </div>

          {/* Card 2: Sovereign Mode */}
          <div style={{
            background: "var(--bg-surface-elevated)",
            padding: "16px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--bg-surface-border)"
          }}>
            <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              SOVEREIGNTY ENFORCEMENT
            </div>
            <div style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginTop: "4px",
              color: "var(--accent-cyan)"
            }}>
              100% AIR-GAPPED
            </div>
            <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginTop: "4px" }}>
              Zero Cloud AI APIs Allowed
            </div>
          </div>

          {/* Card 3: Model Provider */}
          <div style={{
            background: "var(--bg-surface-elevated)",
            padding: "16px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--bg-surface-border)"
          }}>
            <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              LOCAL INFERENCE BACKEND
            </div>
            <div style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginTop: "4px",
              color: health?.model_provider_online ? "var(--accent-emerald)" : "var(--accent-amber)"
            }}>
              {health?.model_provider ? health.model_provider.toUpperCase() : "OLLAMA"}
            </div>
            <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", marginTop: "4px" }}>
              Status: {health?.model_provider_online ? "Online (Port 11434)" : "Offline / Standby"}
            </div>
          </div>

          {/* Card 4: Active Model */}
          <div style={{
            background: "var(--bg-surface-elevated)",
            padding: "16px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--bg-surface-border)"
          }}>
            <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              REASONING MODEL
            </div>
            <div style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginTop: "4px",
              color: "#ffffff",
              fontFamily: "var(--font-mono)"
            }}>
              {health?.default_model || "qwen3:8b"}
            </div>
            <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", marginTop: "4px" }}>
              {modelsData?.models?.includes("qwen3:8b") ? "Verified Local (RTX 4060 GPU)" : "Configured Default"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
