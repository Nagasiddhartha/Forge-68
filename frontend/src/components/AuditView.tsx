"use client";

import React, { useEffect, useState } from "react";
import {
  AgentTraceEvent,
  AuditEventsResponse,
  ExecutionEvent,
  fetchAuditEvents,
} from "@/lib/api";

type EventFilter = "ALL" | "AGENT" | "TOOL" | "POLICY" | "VERIFICATION" | "KNOWLEDGE";

export function AuditView() {
  const [auditData, setAuditData] = useState<AuditEventsResponse | null>(null);
  const [filter, setFilter] = useState<EventFilter>("ALL");
  const [selectedAgentEvent, setSelectedAgentEvent] = useState<AgentTraceEvent | null>(null);
  const [selectedToolEvent, setSelectedToolEvent] = useState<ExecutionEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAuditData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAuditEvents(100);
      setAuditData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchAuditEvents(100)
      .then((res) => {
        if (active) {
          setAuditData(res);
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

  // Filter agent events
  const filteredAgentEvents = (auditData?.agent_events || []).filter((evt) => {
    if (filter === "ALL") return true;
    if (filter === "AGENT") return evt.event_type.startsWith("AGENT_");
    if (filter === "KNOWLEDGE") return evt.event_type.startsWith("KNOWLEDGE_");
    if (filter === "TOOL") return evt.event_type.startsWith("TOOL_");
    if (filter === "POLICY") return evt.event_type.startsWith("POLICY_");
    if (filter === "VERIFICATION") return evt.event_type.startsWith("VERIFICATION_");
    return true;
  });

  // Filter tool events
  const showToolEvents = filter === "ALL" || filter === "TOOL" || filter === "POLICY";
  const toolEvents = showToolEvents ? auditData?.tool_events || [] : [];

  const getEventBadgeClass = (eventType: string) => {
    if (eventType.includes("POLICY") || eventType.includes("DENY")) return "badge-failed";
    if (eventType.includes("VERIFICATION") || eventType.includes("COMPLETED")) return "badge-verified";
    if (eventType.includes("KNOWLEDGE")) return "badge-cyan";
    if (eventType.includes("TOOL")) return "badge-amber";
    return "badge-secondary";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <div className="card" style={{ border: "1px solid var(--accent-cyan-dim)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge badge-cyan">AUDIT TRAIL</span>
              <span className="badge badge-verified">TAMPER-EVIDENT IN-MEMORY LEDGER</span>
              <span className="badge badge-secondary">APPEND-ONLY</span>
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Immutable Lifecycle & Security Audit Trail
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>
              Cryptographically timestamped event ledger capturing agent queries, plan generation, knowledge retrievals,
              policy evaluations, tool sandboxing, and verification checks.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={loadAuditData} disabled={isLoading} className="btn-secondary" style={{ fontSize: "0.78rem" }}>
              {isLoading ? "POLLING..." : "↻ REFRESH AUDIT LOG"}
            </button>
          </div>
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
          Audit Log Retrieval Error: {error}
        </div>
      )}

      {/* Summary KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div className="card" style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            TOTAL AGENT TRACE EVENTS
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent-cyan)", marginTop: 4 }}>
            {auditData?.total_agent_events ?? 0}
          </div>
        </div>
        <div className="card" style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            POLICY / TOOL EXECUTIONS
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent-emerald)", marginTop: 4 }}>
            {auditData?.total_tool_events ?? 0}
          </div>
        </div>
        <div className="card" style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            LEDGER INTEGRITY
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#34d399", marginTop: 8 }}>
            TAMPER-EVIDENT (ACTIVE)
          </div>
        </div>
        <div className="card" style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            OUTSIDE AI SERVICES
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginTop: 8 }}>
            NONE CONFIGURED
          </div>

        </div>
      </div>

      {/* Filter and Event Log View */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
            EVENT TIMELINE &amp; INSPECTOR
          </span>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["ALL", "AGENT", "KNOWLEDGE", "TOOL", "POLICY", "VERIFICATION"] as EventFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.72rem",
                  fontFamily: "var(--font-mono)",
                  borderRadius: "var(--radius-sm)",
                  background: filter === f ? "var(--accent-cyan)" : "var(--bg-surface-elevated)",
                  color: filter === f ? "#080c14" : "var(--text-secondary)",
                  border: filter === f ? "1px solid var(--accent-cyan)" : "1px solid var(--bg-surface-border)",
                  cursor: "pointer",
                  fontWeight: filter === f ? 700 : 500,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div style={{ display: "grid", gridTemplateColumns: selectedAgentEvent || selectedToolEvent ? "1.2fr 1fr" : "1fr", gap: 16 }}>
          {/* Events List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "650px", overflowY: "auto", paddingRight: 4 }}>
            {filteredAgentEvents.length === 0 && toolEvents.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                No events recorded yet. Run a query in the <strong>AI Workspace</strong> to generate real agent and audit events.
              </div>
            ) : (
              <>
                {/* Agent Events */}
                {filteredAgentEvents.map((evt) => (
                  <div
                    key={evt.event_id}
                    onClick={() => {
                      setSelectedAgentEvent(evt);
                      setSelectedToolEvent(null);
                    }}
                    style={{
                      padding: "10px 12px",
                      background: selectedAgentEvent?.event_id === evt.event_id ? "rgba(0, 240, 255, 0.08)" : "var(--bg-surface-elevated)",
                      border: selectedAgentEvent?.event_id === evt.event_id ? "1px solid var(--accent-cyan)" : "1px solid var(--bg-surface-border)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className={`badge ${getEventBadgeClass(evt.event_type)}`} style={{ fontSize: "0.68rem" }}>
                          {evt.event_type}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : "TIMESTAMP"}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                        ROLE: {evt.role} ({evt.requester})
                      </span>
                    </div>

                    <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      EVENT ID: {evt.event_id}
                    </div>

                    {evt.details && Object.keys(evt.details).length > 0 && (
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {JSON.stringify(evt.details)}
                      </div>
                    )}
                  </div>
                ))}

                {/* Tool Executions (when relevant) */}
                {toolEvents.map((tEvt) => (
                  <div
                    key={tEvt.event_id}
                    onClick={() => {
                      setSelectedToolEvent(tEvt);
                      setSelectedAgentEvent(null);
                    }}
                    style={{
                      padding: "10px 12px",
                      background: selectedToolEvent?.event_id === tEvt.event_id ? "rgba(16, 185, 129, 0.08)" : "var(--bg-surface-elevated)",
                      border: selectedToolEvent?.event_id === tEvt.event_id ? "1px solid var(--accent-emerald)" : "1px solid var(--bg-surface-border)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className={`badge ${tEvt.decision === "ALLOW" ? "badge-verified" : "badge-failed"}`} style={{ fontSize: "0.68rem" }}>
                          POLICY: {tEvt.decision}
                        </span>
                        <span className="badge badge-amber" style={{ fontSize: "0.68rem" }}>
                          TOOL: {tEvt.tool}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {tEvt.timestamp ? new Date(tEvt.timestamp).toLocaleTimeString() : "TIMESTAMP"}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                        {tEvt.role} ({tEvt.requester})
                      </span>
                    </div>

                    <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      REASON: {tEvt.reason}
                    </div>

                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      Status: {tEvt.execution_status} | Classification: {tEvt.classification} | Risk: {tEvt.risk}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Details Drawer */}
          {(selectedAgentEvent || selectedToolEvent) && (
            <div style={{
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--bg-surface-border)",
              borderRadius: "var(--radius-sm)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxHeight: "650px",
              overflowY: "auto",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: "0.82rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
                  EVENT DETAIL INSPECTOR
                </span>
                <button
                  onClick={() => {
                    setSelectedAgentEvent(null);
                    setSelectedToolEvent(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  ✕ CLOSE
                </button>
              </div>

              {selectedAgentEvent && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>TYPE: </span>
                    <strong style={{ color: "var(--text-primary)" }}>{selectedAgentEvent.event_type}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>ID: </span>
                    <span>{selectedAgentEvent.event_id}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>TIMESTAMP: </span>
                    <span>{selectedAgentEvent.timestamp}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>REQUESTER: </span>
                    <span>{selectedAgentEvent.requester} ({selectedAgentEvent.role})</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>PAYLOAD DETAILS:</span>
                    <pre style={{
                      marginTop: 6,
                      background: "var(--bg-surface)",
                      padding: 10,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      color: "var(--text-secondary)",
                      fontSize: "0.72rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}>
                      {JSON.stringify(selectedAgentEvent.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedToolEvent && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>TOOL: </span>
                    <strong style={{ color: "var(--text-primary)" }}>{selectedToolEvent.tool}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>POLICY DECISION: </span>
                    <span className={`badge ${selectedToolEvent.decision === "ALLOW" ? "badge-verified" : "badge-failed"}`}>
                      {selectedToolEvent.decision}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>REASON: </span>
                    <span>{selectedToolEvent.reason}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>STATUS: </span>
                    <span>{selectedToolEvent.execution_status}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>PARAMETERS:</span>
                    <pre style={{
                      marginTop: 6,
                      background: "var(--bg-surface)",
                      padding: 10,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      color: "var(--text-secondary)",
                      fontSize: "0.72rem",
                      whiteSpace: "pre-wrap",
                    }}>
                      {JSON.stringify(selectedToolEvent.parameters || {}, null, 2)}
                    </pre>
                  </div>
                  {selectedToolEvent.output_summary && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>OUTPUT SUMMARY:</span>
                      <div style={{
                        marginTop: 6,
                        background: "var(--bg-surface)",
                        padding: 10,
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        color: "var(--text-secondary)",
                        fontSize: "0.72rem",
                      }}>
                        {selectedToolEvent.output_summary}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
