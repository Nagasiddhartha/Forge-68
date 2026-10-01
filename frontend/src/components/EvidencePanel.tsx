"use client";

import React, { useState } from "react";
import { CalculationResult, EvidenceRecord, EvidenceSet } from "@/lib/api";

interface EvidencePanelProps {
  evidenceSet?: EvidenceSet | null;
  evidenceList?: EvidenceRecord[];
  calculations?: CalculationResult[];
  title?: string;
}

export function EvidencePanel({
  evidenceSet,
  evidenceList,
  calculations = [],
  title = "Evidence Registry",
}: EvidencePanelProps) {
  const [filter, setFilter] = useState<"ALL" | "KNOWLEDGE" | "TOOL" | "VISUAL" | "CALCULATION">("ALL");

  // Gather items
  const allRecords: EvidenceRecord[] = evidenceList
    ? evidenceList
    : evidenceSet
    ? [
        ...(evidenceSet.knowledge_evidence || []),
        ...(evidenceSet.tool_evidence || []),
        ...(evidenceSet.visual_evidence || []),
      ]
    : [];

  const filteredRecords = allRecords.filter((rec) => {
    if (filter === "ALL") return true;
    if (filter === "KNOWLEDGE") return rec.source_type === "knowledge_document";
    if (filter === "TOOL") return rec.source_type === "LOCAL_INDUSTRIAL_TOOL";
    if (filter === "VISUAL") return rec.source_type === "visual_inspection";
    return true;
  });

  const showCalculations = (filter === "ALL" || filter === "CALCULATION") && calculations.length > 0;

  const totalCount = allRecords.length + calculations.length;

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem" }}>
            {title}
          </span>
          <span className="badge badge-secondary">{totalCount} ITEMS</span>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["ALL", "KNOWLEDGE", "TOOL", "VISUAL", "CALCULATION"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={filter === tab ? "badge badge-cyan" : "badge badge-secondary"}
              style={{ cursor: "pointer", background: filter === tab ? undefined : "transparent" }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {totalCount === 0 ? (
        <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
            No verified evidence records captured.
          </p>
          <p style={{ fontSize: "0.78rem", marginTop: 6 }}>
            Submit an engineering inquiry in the AI Workspace or perform a search in the Knowledge Fabric.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Calculations section */}
          {showCalculations &&
            calculations.map((calc) => (
              <div
                key={calc.calculation_id}
                style={{
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="badge badge-verified">CALCULATION</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 600 }}>
                      {calc.calculation_type}
                    </span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    ID: {calc.calculation_id}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "8px 0" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Result:</span>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "var(--accent-emerald)",
                  }}>
                    {calc.result} {calc.units}
                  </span>
                </div>

                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                  {calc.description}
                </p>

                <div style={{
                  fontSize: "0.72rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                  background: "#05070a",
                  padding: "6px 10px",
                  borderRadius: 3,
                }}>
                  Inputs: {JSON.stringify(calc.inputs)}
                </div>
              </div>
            ))}

          {/* Evidence Records */}
          {filteredRecords.map((record) => {
            const isKnowledge = record.source_type === "knowledge_document";
            const isTool = record.source_type === "LOCAL_INDUSTRIAL_TOOL";
            const isVisual = record.source_type === "visual_inspection";

            let typeBadgeClass = "badge-secondary";
            let typeLabel = record.source_type;
            if (isKnowledge) {
              typeBadgeClass = "badge-cyan";
              typeLabel = "DOCUMENT";
            } else if (isTool) {
              typeBadgeClass = "badge-warn";
              typeLabel = "TOOL EXECUTION";
            } else if (isVisual) {
              typeBadgeClass = "badge-insufficient";
              typeLabel = "VISUAL FINDING";
            }

            return (
              <div
                key={record.evidence_id}
                style={{
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--bg-surface-border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 14px",
                }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={`badge ${typeBadgeClass}`}>{typeLabel}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-primary)" }}>
                      {record.source_reference}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="badge badge-secondary">{record.classification}</span>
                    {record.verified && <span className="badge badge-verified">VERIFIED</span>}
                  </div>
                </div>

                {/* Provenance Metadata Row */}
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 14,
                  fontSize: "0.72rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                  marginBottom: 10,
                  borderBottom: "1px dashed var(--bg-surface-border)",
                  paddingBottom: 6,
                }}>
                  <span>EVD ID: {record.evidence_id}</span>
                  {record.tool_execution_id && <span>EXEC ID: {record.tool_execution_id}</span>}
                  {record.filename && <span>FILE: {record.filename}</span>}
                  {record.source_image_hash && <span>SHA256: {record.source_image_hash.slice(0, 16)}...</span>}
                  {record.retrieval_score && <span>SIMILARITY: {(record.retrieval_score * 100).toFixed(1)}%</span>}
                </div>

                {/* Payload / Content */}
                {record.retrieved_text ? (
                  <p style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.45,
                    background: "rgba(0,0,0,0.2)",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)",
                    fontFamily: isVisual || isKnowledge ? "var(--font-sans)" : "var(--font-mono)",
                  }}>
                    {record.retrieved_text}
                  </p>
                ) : (
                  <pre className="code-block" style={{ maxHeight: 180 }}>
                    {typeof record.retrieved_data === "object"
                      ? JSON.stringify(record.retrieved_data, null, 2)
                      : String(record.retrieved_data)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
