"use client";

import React, { useState } from "react";
import {
  AgentQueryRequest,
  AgentQueryResponse,
  DataClassification,
  Role,
  VisionAnalyzeResponse,
  analyzeVision,
  queryAgent,
} from "@/lib/api";
import { ExecutionTrace } from "@/components/ExecutionTrace";
import { EvidencePanel } from "@/components/EvidencePanel";
import { VerificationPanel } from "@/components/VerificationPanel";

interface AIWorkspaceViewProps {
  role: Role;
  clearance: DataClassification;
  onExecutionComplete?: (resp: AgentQueryResponse) => void;
  lastResponse: AgentQueryResponse | null;
}

export function AIWorkspaceView({
  role,
  clearance,
  onExecutionComplete,
  lastResponse,
}: AIWorkspaceViewProps) {
  const [query, setQuery] = useState(
    "What is the normal operating pressure for Reactor R-204 and what is its recent maintenance history?"
  );
  const [selectedImage, setSelectedImage] = useState<string>("none");
  const [customBase64, setCustomBase64] = useState<string | null>(null);
  const [customFilename, setCustomFilename] = useState<string>("uploaded_image.png");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AgentQueryResponse | null>(lastResponse);
  const [visionDirectResult, setVisionDirectResult] = useState<VisionAnalyzeResponse | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"TRACE" | "EVIDENCE" | "VERIFICATION" | "VISION">("TRACE");

  const demoPresets = [
    {
      title: "Scenario 1: Combined Knowledge + Tool",
      text: "What is the normal operating pressure for Reactor R-204 and what is its recent maintenance history?",
      image: "none",
    },
    {
      title: "Scenario 2: Deterministic Calculations & Verification",
      text: "Calculate pressure variance and margin to trip limit if observed pressure is 33.0 bar on R-204.",
      image: "none",
    },
    {
      title: "Scenario 3: Multimodal Vision + SOP Verification",
      text: "Inspect the pressure gauge image for R-204 and verify against SOP operating limits.",
      image: "r204_pressure_gauge.png",
    },
    {
      title: "Scenario 4: Policy Gateway Denial",
      text: "Calibrate pressure relief valve on R-204 without supervisor authorization.",
      image: "none",
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const base64Data = resultStr.split(",")[1];
      setCustomBase64(base64Data);
      setSelectedImage("custom");
    };
    reader.readAsDataURL(file);
  };

  const handleRunQuery = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setVisionDirectResult(null);

    const payload: AgentQueryRequest = {
      query: query.trim(),
      role,
      classification: clearance,
      requester: `${role.toLowerCase()}_operator`,
    };

    if (selectedImage === "custom" && customBase64) {
      payload.image_base64 = customBase64;
    } else if (selectedImage !== "none") {
      payload.image_path = selectedImage;
    }

    try {
      const res = await queryAgent(payload);
      setResponse(res);
      if (onExecutionComplete) {
        onExecutionComplete(res);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectVisionAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let res: VisionAnalyzeResponse;
      if (selectedImage === "custom" && customBase64) {
        res = await analyzeVision({
          image_base64: customBase64,
          filename: customFilename,
          equipment_id: "R-204",
          prompt: "Analyze engineering imagery and extract all observed readings.",
          classification: clearance,
          role,
        });
      } else {
        const path = selectedImage === "none" ? "r204_pressure_gauge.png" : selectedImage;
        res = await analyzeVision({
          image_path: path,
          equipment_id: "R-204",
          prompt: "Analyze engineering imagery and extract all observed readings.",
          classification: clearance,
          role,
        });
      }
      setVisionDirectResult(res);
      setActiveSubTab("VISION");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Query Console Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem" }}>
              Industrial AI Reasoning Console
            </span>
            <span className="badge badge-cyan">SOVEREIGN WORKSPACE</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
            <span style={{ color: "var(--text-muted)" }}>ACTIVE CONTEXT:</span>
            <span className="badge badge-secondary">{role}</span>
            <span className="badge badge-secondary">{clearance}</span>
          </div>
        </div>

        {/* Demo Presets Bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>
            QUICK DEMO SCENARIOS:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                className="btn-preset"
                onClick={() => {
                  setQuery(preset.text);
                  setSelectedImage(preset.image);
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                  {preset.title}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {preset.text}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder="Enter operational question, telemetry analysis request, or equipment inspection command..."
            style={{
              width: "100%",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--bg-surface-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              padding: "10px 14px",
              resize: "vertical",
              outline: "none",
            }}
          />
        </div>

        {/* Multimodal Image Attachment & Action Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          borderTop: "1px solid var(--bg-surface-border)",
          paddingTop: 12,
        }}>
          {/* Image Context Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              IMAGE CONTEXT:
            </span>
            <select
              value={selectedImage}
              onChange={(e) => setSelectedImage(e.target.value)}
              style={{
                background: "var(--bg-surface-elevated)",
                border: "1px solid var(--bg-surface-border)",
                color: "var(--text-primary)",
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
              }}
            >
              <option value="none">None (Text-only)</option>
              <option value="r204_pressure_gauge.png">r204_pressure_gauge.png (Analog Dial ~33.0 bar)</option>
              <option value="r204_inspection_corrosion.png">r204_inspection_corrosion.png (Shell Wall ~2.2mm)</option>
              <option value="sample_jpeg.jpg">sample_jpeg.jpg (Offline Test JPEG)</option>
              <option value="sample_webp.webp">sample_webp.webp (Offline Test WebP)</option>
              {customBase64 && <option value="custom">Custom Uploaded: {customFilename}</option>}
            </select>

            <label
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px dashed var(--bg-surface-border)",
                padding: "5px 10px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.72rem",
                fontFamily: "var(--font-mono)",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              Upload Image...
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileUpload} style={{ display: "none" }} />
            </label>

            <button
              onClick={handleDirectVisionAnalyze}
              disabled={isLoading}
              className="btn-secondary"
              title="Inspect image directly with VisionProvider without agent loop"
            >
              Analyze Image Only
            </button>
          </div>

          {/* Execute Query Button */}
          <button
            onClick={handleRunQuery}
            disabled={isLoading || !query.trim()}
            className="btn-primary"
            style={{ minWidth: 160, justifyContent: "center" }}
          >
            {isLoading ? (
              <>
                <span className="pulse-cyan" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <span>EXECUTE AGENT LOOP ▶</span>
            )}
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: 14,
            padding: "10px 14px",
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.4)",
            borderRadius: "var(--radius-sm)",
            color: "#f87171",
            fontSize: "0.82rem",
            fontFamily: "var(--font-mono)",
          }}>
            [EXECUTION ERROR] {error}
          </div>
        )}
      </div>

      {/* Response Navigation Sub-Tabs */}
      {(response || visionDirectResult) && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <button
              onClick={() => setActiveSubTab("TRACE")}
              className={activeSubTab === "TRACE" ? "badge badge-cyan" : "badge badge-secondary"}
              style={{ cursor: "pointer", padding: "6px 14px" }}
            >
              EXECUTION TRACE (7 PHASES)
            </button>
            <button
              onClick={() => setActiveSubTab("EVIDENCE")}
              className={activeSubTab === "EVIDENCE" ? "badge badge-cyan" : "badge badge-secondary"}
              style={{ cursor: "pointer", padding: "6px 14px" }}
            >
              EVIDENCE SET ({((response?.evidence_set?.knowledge_evidence?.length || 0) + (response?.evidence_set?.tool_evidence?.length || 0) + (response?.evidence_set?.visual_evidence?.length || 0))})
            </button>
            <button
              onClick={() => setActiveSubTab("VERIFICATION")}
              className={activeSubTab === "VERIFICATION" ? "badge badge-cyan" : "badge badge-secondary"}
              style={{ cursor: "pointer", padding: "6px 14px" }}
            >
              VERIFICATION ENGINE ({response?.verification?.status || "PENDING"})
            </button>
            {visionDirectResult && (
              <button
                onClick={() => setActiveSubTab("VISION")}
                className={activeSubTab === "VISION" ? "badge badge-cyan" : "badge badge-secondary"}
                style={{ cursor: "pointer", padding: "6px 14px" }}
              >
                DIRECT VISION FINDINGS ({visionDirectResult.findings.length})
              </button>
            )}
          </div>

          {activeSubTab === "TRACE" && response && <ExecutionTrace response={response} />}

          {activeSubTab === "EVIDENCE" && (
            <EvidencePanel
              evidenceSet={response?.evidence_set}
              calculations={response?.verification?.calculations || []}
            />
          )}

          {activeSubTab === "VERIFICATION" && (
            <VerificationPanel verification={response?.verification} />
          )}

          {activeSubTab === "VISION" && visionDirectResult && (
            <div className="card">
              <div className="card-header">
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem" }}>
                  Multimodal Visual Observations
                </span>
                <span className="badge badge-verified">OBSERVER ACTIVE</span>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                marginBottom: 16,
                background: "var(--bg-surface-elevated)",
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
              }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>FILENAME: </span>
                  {visionDirectResult.image_provenance.filename}
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>MIME: </span>
                  {visionDirectResult.image_provenance.mime_type}
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>SIZE: </span>
                  {visionDirectResult.image_provenance.file_size_bytes} B
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>SHA256: </span>
                  {visionDirectResult.image_provenance.sha256_hash.slice(0, 16)}...
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {visionDirectResult.findings.map((f) => (
                  <div
                    key={f.finding_id}
                    style={{
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--bg-surface-border)",
                      padding: "12px 14px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span className="badge badge-insufficient">{f.finding_type}</span>
                      <span className="badge badge-secondary">CONFIDENCE: {(f.confidence * 100).toFixed(0)}%</span>
                    </div>

                    <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", marginBottom: 8 }}>
                      {f.description}
                    </p>

                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 12,
                      fontSize: "0.72rem",
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                    }}>
                      {f.equipment_id && <span>ASSET: {f.equipment_id}</span>}
                      {f.location && <span>LOCATION: {f.location}</span>}
                      {f.observed_value !== undefined && (
                        <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                          OBSERVED: {f.observed_value} {f.unit || ""}
                        </span>
                      )}
                      <span>SEVERITY: {f.severity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {visionDirectResult.verification && (
                <div style={{ marginTop: 16 }}>
                  <VerificationPanel verification={visionDirectResult.verification} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
