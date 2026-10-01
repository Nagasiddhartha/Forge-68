"use client";

import React from "react";
import { AgentQueryResponse } from "@/lib/api";

interface ExecutionTraceProps {
  response: AgentQueryResponse;
}

export function ExecutionTrace({ response }: ExecutionTraceProps) {
  const plan = response.agent_plan || response.plan;
  const policyDecisions = response.policy_decisions || [];
  const knowledgeEvidence = response.evidence_set?.knowledge_evidence || [];
  const visualEvidence = response.evidence_set?.visual_evidence || [];
  const verification = response.verification;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: "1px solid var(--bg-surface-border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem" }}>
            Deterministic Execution Trace
          </span>
          <span className="badge badge-cyan">AUDITABLE LIFECYCLE</span>
        </div>

        {response.execution_event_id && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
            EVENT: {response.execution_event_id}
          </span>
        )}
      </div>

      {/* Step 1: User Request */}
      <div className="trace-step">
        <div className="trace-node">1</div>
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-surface-border)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-cyan)" }}>
              AGENT_REQUEST (INGESTED)
            </span>
            <span className="badge badge-secondary">PHASE 1</span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{response.query}</p>
        </div>
      </div>

      {/* Step 2: Agent Plan */}
      <div className="trace-step">
        <div className="trace-node">2</div>
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-surface-border)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-cyan)" }}>
                AGENT_PLAN_CREATED (QWEN3 8B)
              </span>
              {plan && <span className="badge badge-cyan">ACTION: {plan.action.toUpperCase()}</span>}
            </div>
          </div>

          {plan?.reasoning && (
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 8, fontStyle: "italic" }}>
              &quot;{plan.reasoning}&quot;
            </p>
          )}

          {plan && (
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              background: "#05070a",
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
            }}>
              <span>KNOWLEDGE QUERIES: {plan.knowledge_queries?.length || 0}</span>
              <span>TOOL CALLS: {plan.tool_calls?.length || 0}</span>
              <span>CALCULATIONS: {plan.calculations?.length || 0}</span>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Knowledge Retrieval */}
      {knowledgeEvidence.length > 0 && (
        <div className="trace-step">
          <div className="trace-node">3</div>
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--bg-surface-border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38bdf8" }}>
                KNOWLEDGE_RETRIEVAL_COMPLETED
              </span>
              <span className="badge badge-secondary">{knowledgeEvidence.length} CHUNKS RETRIEVED</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {knowledgeEvidence.map((k) => (
                <div key={k.evidence_id} style={{
                  fontSize: "0.76rem",
                  fontFamily: "var(--font-mono)",
                  background: "var(--bg-surface-elevated)",
                  padding: "6px 10px",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <span>{k.source_reference} ({k.filename})</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span className="badge badge-secondary">{k.classification}</span>
                    {k.retrieval_score && (
                      <span style={{ color: "var(--accent-cyan)" }}>
                        {(k.retrieval_score * 100).toFixed(0)}% MATCH
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Tools & Policy Gateway */}
      {policyDecisions.length > 0 && (
        <div className="trace-step">
          <div className="trace-node">4</div>
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--bg-surface-border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-amber)" }}>
                POLICY_EVALUATED & TOOL_EXECUTION
              </span>
              <span className="badge badge-secondary">{policyDecisions.length} EVALUATIONS</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {policyDecisions.map((pd, idx) => {
                const isAllow = pd.decision === "ALLOW";
                return (
                  <div
                    key={idx}
                    style={{
                      background: "var(--bg-surface-elevated)",
                      border: `1px solid ${isAllow ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
                      padding: "8px 10px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className={isAllow ? "badge badge-allow" : "badge badge-deny"}>
                          {pd.decision}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700 }}>
                          {pd.tool}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                        POLICY: {pd.policy_id || "GATEWAY_RULE"}
                      </span>
                    </div>

                    <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: 4 }}>
                      {pd.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Visual Evidence if present */}
      {visualEvidence.length > 0 && (
        <div className="trace-step">
          <div className="trace-node">5</div>
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--bg-surface-border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-purple)" }}>
                MULTIMODAL_OBSERVATIONS_INGESTED
              </span>
              <span className="badge badge-insufficient">{visualEvidence.length} VISUAL RECORDS</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {visualEvidence.map((v) => (
                <div key={v.evidence_id} style={{
                  fontSize: "0.78rem",
                  background: "var(--bg-surface-elevated)",
                  padding: "8px 10px",
                  borderRadius: 3,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="badge badge-insufficient">{v.finding_type || "OBSERVATION"}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      SHA256: {v.source_image_hash?.slice(0, 16)}...
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>{v.retrieved_text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Verification Assessment */}
      {verification && (
        <div className="trace-step">
          <div className="trace-node">6</div>
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--bg-surface-border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-emerald)" }}>
                VERIFICATION_COMPLETED (DETERMINISTIC CHECKS)
              </span>
              <span className={
                verification.status === "VERIFIED"
                  ? "badge badge-verified"
                  : verification.status === "NEEDS_REVIEW"
                  ? "badge badge-review"
                  : "badge badge-failed"
              }>
                {verification.status}
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {verification.summary}
            </p>
          </div>
        </div>
      )}

      {/* Step 7: Final Grounded Response */}
      <div className="trace-step">
        <div className="trace-node" style={{ borderColor: "var(--accent-emerald)", color: "var(--accent-emerald)" }}>
          7
        </div>
        <div style={{
          background: "linear-gradient(180deg, var(--bg-surface) 0%, rgba(16, 185, 129, 0.04) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          borderRadius: "var(--radius-sm)",
          padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-emerald)" }}>
              AGENT_FINAL_RESPONSE (EVIDENCE GROUNDED)
            </span>
            <span className="badge badge-verified">DELIVERED TO OPERATOR</span>
          </div>

          <div style={{
            fontSize: "0.88rem",
            color: "var(--text-primary)",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}>
            {response.final_answer}
          </div>
        </div>
      </div>
    </div>
  );
}
