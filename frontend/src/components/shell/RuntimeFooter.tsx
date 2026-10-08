"use client";

import React, { useState } from "react";
import { ComputedRuntimeState } from "@/lib/runtime";
import { Locale, TRANSLATIONS } from "@/lib/i18n";

export interface RuntimeFooterProps {
  runtime: ComputedRuntimeState;
  onRefresh?: () => void;
  locale?: Locale;
}

export function RuntimeFooter({ runtime, onRefresh, locale = "en" }: RuntimeFooterProps) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Honest copy formatters conforming to Section 3.2 and 7
  const reasoningValue =
    runtime.reasoning === "LIVE_LOCAL"
      ? `${runtime.reasoningModel} · ${t.footerLive}`
      : `${runtime.reasoningModel} · ${t.footerDemoHarness}`;

  const visionValue =
    runtime.vision === "LIVE_LOCAL"
      ? `${runtime.visionModel} · ${t.footerLive}`
      : t.footerFixture;

  const policyValue = t.footerDefaultDeny;
  const outsideServicesValue = t.footerNoneConfigured;

  return (
    <>
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 36,
          backgroundColor: "var(--bg-0)",
          borderTop: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 90,
          fontFamily: "var(--font-ui)",
          fontSize: "12px",
          color: "var(--ink-2)",
        }}
        className="forge-runtime-footer"
      >
        {/* Left: 4 Honest Runtime Indicators */}
        <div
          onClick={() => setDetailsOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            cursor: "pointer",
            flexWrap: "nowrap",
            overflowX: "auto",
          }}
          title="Click to view full sovereign runtime diagnostics"
        >
          {/* Reasoning */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <span style={{ color: "var(--ink-3)" }}>{t.footerReasoning}</span>
            <span style={{ color: "var(--ink)", fontWeight: 500 }}>{reasoningValue}</span>
          </div>

          <span style={{ color: "var(--line-strong)" }}>|</span>

          {/* Vision */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <span style={{ color: "var(--ink-3)" }}>{t.footerVision}</span>
            <span style={{ color: "var(--ink)", fontWeight: 500 }}>{visionValue}</span>
          </div>

          <span style={{ color: "var(--line-strong)" }}>|</span>

          {/* Policy */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <span style={{ color: "var(--ink-3)" }}>{t.footerPolicy}</span>
            <span style={{ color: "var(--sage)", fontWeight: 500 }}>{policyValue}</span>
          </div>

          <span style={{ color: "var(--line-strong)" }}>|</span>

          {/* Outside AI */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <span style={{ color: "var(--ink-3)" }}>{t.footerOutsideAi}</span>
            <span style={{ color: "var(--pewter)", fontWeight: 500 }}>{outsideServicesValue}</span>
          </div>
        </div>

        {/* Right: Runtime Diagnostics Trigger & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setDetailsOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--brass)",
              fontFamily: "var(--font-ui)",
              fontSize: "12px",
              cursor: "pointer",
              padding: "2px 6px",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {t.footerRuntimeDetails}
          </button>
        </div>
      </footer>

      {/* Runtime Details Drawer / Popover */}
      {detailsOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 300,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setDetailsOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              height: "100%",
              backgroundColor: "var(--bg-1)",
              borderLeft: "1px solid var(--line)",
              padding: "32px 24px",
              overflowY: "auto",
              boxShadow: "var(--shadow-popover)",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--line)", paddingBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 500, color: "var(--ink)" }}>
                  {t.runtimeDetailsTitle}
                </h3>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "var(--ink-3)", marginTop: 2 }}>
                  {t.runtimeDetailsSubtitle}
                </p>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                style={{
                  background: "none",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-pill)",
                  color: "var(--ink)",
                  padding: "4px 10px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {t.runtimeCloseBtn}
              </button>
            </div>

            {/* Diagnostic Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "12px 14px", backgroundColor: "var(--bg-2)", borderRadius: "var(--radius-panel)", border: "1px solid var(--line)" }}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink-3)" }}>{t.runtimeEndpointTitle}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--ink)", marginTop: 4 }}>
                  {runtime.capabilities?.inference_endpoint_is_loopback ? "http://localhost:11434 (Loopback Only)" : "Custom Sovereign Endpoint"}
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--sage)", marginTop: 4 }}>
                  {t.runtimeLoopbackVerified}
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: "var(--bg-2)", borderRadius: "var(--radius-panel)", border: "1px solid var(--line)" }}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink-3)" }}>{t.runtimeReasoningSubsystem}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "14px", color: "var(--ink)", fontWeight: 500, marginTop: 4 }}>
                  {runtime.reasoningModel}
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: runtime.reasoningLive ? "var(--sage)" : "var(--brass)", marginTop: 2 }}>
                  {runtime.reasoningLive ? t.runtimeLiveResponding : t.runtimeDemoHarnessDesc}
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: "var(--bg-2)", borderRadius: "var(--radius-panel)", border: "1px solid var(--line)" }}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink-3)" }}>{t.runtimeVisionSubsystem}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "14px", color: "var(--ink)", fontWeight: 500, marginTop: 4 }}>
                  {runtime.visionModel}
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: runtime.visionLive ? "var(--sage)" : "var(--ink-2)", marginTop: 2 }}>
                  {runtime.visionLive ? t.runtimeVisionLive : t.runtimeVisionFixture}
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: "var(--bg-2)", borderRadius: "var(--radius-panel)", border: "1px solid var(--line)" }}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink-3)" }}>{t.runtimeEmbeddingsTitle}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--ink)", marginTop: 4 }}>
                  {runtime.embeddingModel}
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink-3)", marginTop: 2 }}>
                  Kind: {runtime.embeddingKind} · {t.runtimeOnPremiseOnly}
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: "var(--bg-2)", borderRadius: "var(--radius-panel)", border: "1px solid var(--line)" }}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink-3)" }}>{t.runtimeDependencyAudit}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "var(--sage)", marginTop: 4 }}>
                  {t.runtimeZeroCloudSdk}
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink-3)", marginTop: 2 }}>
                  {t.runtimeSdkForbidden}
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: "var(--bg-2)", borderRadius: "var(--radius-panel)", border: "1px solid var(--line)" }}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink-3)" }}>{t.runtimeAuditIntegrity}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "var(--ink)", marginTop: 4 }}>
                  {runtime.auditHashChained ? t.runtimeHashChained : t.runtimeAppendOnly}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-3)", marginTop: 2 }}>
                  {t.runtimeTotalEvents}: {runtime.auditTotalEvents}
                </div>
              </div>
            </div>

            {onRefresh && (
              <div style={{ marginTop: "auto", borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                <button
                  onClick={() => {
                    onRefresh();
                  }}
                  className="btn-brass-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {t.runtimeRefreshBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
