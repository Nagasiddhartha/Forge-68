"use client";

import React, { useState } from "react";
import {
  AgentQueryResponse,
  DataClassification,
  Role,
} from "@/lib/api";
import { useRuntimeCapabilities } from "@/lib/runtime";
import { AppShell, ShellDestination } from "@/components/shell";
import { PressureDial } from "@/components/instruments";
import { EnamelSurface, VerdictBadge, Metric } from "@/components/primitives";
import { OverviewView } from "@/components/OverviewView";
import { AIWorkspaceView } from "@/components/AIWorkspaceView";
import { KnowledgeView } from "@/components/KnowledgeView";
import { EvidencePanel } from "@/components/EvidencePanel";
import { VerificationPanel } from "@/components/VerificationPanel";
import { AuditView } from "@/components/AuditView";
import { SovereigntyView } from "@/components/SovereigntyView";
import { GovernanceView } from "@/components/GovernanceView";
import { Locale, TRANSLATIONS } from "@/lib/i18n";

type MissionSubView = "overview" | "workspace" | "evidence" | "verification";

export default function Home() {
  const [destination, setDestination] = useState<ShellDestination>("missions");
  const [missionSubView, setMissionSubView] = useState<MissionSubView>("overview");
  const [role, setRole] = useState<Role>("ENGINEER");
  const [clearance, setClearance] = useState<DataClassification>("CONFIDENTIAL");
  const [locale, setLocale] = useState<Locale>("en");
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;
  const [lastResponse, setLastResponse] = useState<AgentQueryResponse | null>(null);

  // Live truthful runtime capability model
  const runtime = useRuntimeCapabilities();

  const handleExecutionComplete = (resp: AgentQueryResponse) => {
    setLastResponse(resp);
  };

  return (
    <AppShell
      activeDestination={destination}
      onSelectDestination={setDestination}
      role={role}
      onChangeRole={setRole}
      clearance={clearance}
      onChangeClearance={setClearance}
      runtime={runtime}
      onRefreshRuntime={runtime.refresh}
      locale={locale}
      onChangeLocale={setLocale}
    >
      {/* =========================================================================
          1. MISSIONS DESTINATION
          ========================================================================= */}
      {destination === "missions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Hero Instrument Section conforming to Prototype Direction 1 */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1.08fr 0.92fr",
              alignItems: "center",
              gap: 32,
              padding: "36px 44px",
              backgroundColor: "var(--bg-1)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-hero)",
            }}
            className="missions-hero-grid"
          >
            {/* Left: Product Thesis & Case Findings */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <VerdictBadge verdict="REVIEW_REQUIRED" locale={locale} />
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: "clamp(34px, 4.4vw, 54px)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.01em",
                  color: "var(--ink)",
                  fontVariantNumeric: "lining-nums tabular-nums",
                }}
              >
                {t.heroTitle}
              </h1>

              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "16px",
                  lineHeight: 1.6,
                  color: "var(--ink-2)",
                  marginTop: 18,
                  marginBottom: 24,
                  maxWidth: "50ch",
                }}
              >
                {t.heroSubtitle}
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
                <button
                  onClick={() => setMissionSubView("workspace")}
                  className="btn-brass-primary"
                >
                  {t.startMissionBtn}
                </button>
                <button
                  onClick={() => setMissionSubView("overview")}
                  className="btn-brass-secondary"
                >
                  {t.inspectTelemetryBtn}
                </button>
              </div>

              {/* Fact Strip conforming to Section 9.5 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  paddingTop: 20,
                  borderTop: "1px solid var(--line-strong)",
                  flexWrap: "wrap",
                }}
              >
                <Metric value="31.2" unit="bar" label={t.baselineMetric} subtext={t.baselineSubtext} />
                <div style={{ width: 1, height: 42, backgroundColor: "var(--line-strong)" }} />
                <Metric value="+1.8" unit="bar" label={t.deviationMetric} highlight={true} subtext={t.deviationSubtext} />
                <div style={{ width: 1, height: 42, backgroundColor: "var(--line-strong)" }} />
                <Metric value="0.5" unit="bar" label={t.distanceToAlarmMetric} subtext={t.alarmSubtext} />
              </div>
            </div>

            {/* Right: Signature Hero Pressure Dial (Section 11 Foundation) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <PressureDial
                value={33.0}
                normal={31.2}
                alarm={33.5}
                trip={35.0}
                unit="bar"
                tag="PI-204"
                label={t.dialLabel}
                locale={locale}
              />
            </div>
          </section>

          {/* Mission Sub-Navigation for complete feature access */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--line)",
              paddingBottom: 10,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 8 }}>
                {t.missionViewsLabel}
              </span>
              {[
                { id: "overview", label: t.tabOverview },
                { id: "workspace", label: t.tabWorkspace },
                { id: "evidence", label: t.tabEvidence },
                { id: "verification", label: t.tabVerification },
              ].map((sub) => {
                const isSelected = missionSubView === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setMissionSubView(sub.id as MissionSubView)}
                    style={{
                      background: isSelected ? "var(--bg-2)" : "none",
                      border: isSelected ? "1px solid var(--line-strong)" : "1px solid transparent",
                      borderRadius: "var(--radius-pill)",
                      color: isSelected ? "var(--ink)" : "var(--ink-2)",
                      fontFamily: "var(--font-ui)",
                      fontSize: "13px",
                      padding: "5px 14px",
                      cursor: "pointer",
                      transition: "all var(--dur-fast) var(--ease-out)",
                    }}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>

            <span style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink-3)" }}>
              {t.clearanceLabel} <strong style={{ color: "var(--brass)" }}>{clearance}</strong> · {t.roleLabel} <strong style={{ color: "var(--ink)" }}>{role}</strong>
            </span>
          </div>

          {/* Sub-view Content */}
          {missionSubView === "overview" && (
            <OverviewView onNavigateToWorkspace={() => setMissionSubView("workspace")} locale={locale} />
          )}

          {missionSubView === "workspace" && (
            <AIWorkspaceView
              role={role}
              clearance={clearance}
              onExecutionComplete={handleExecutionComplete}
              lastResponse={lastResponse}
              locale={locale}
            />
          )}

          {missionSubView === "evidence" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <EnamelSurface variant="base" padding="normal">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--ink)" }}>
                      {t.evidenceHeaderTitle}
                    </h2>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: "14px", color: "var(--ink-2)", marginTop: 2 }}>
                      {t.evidenceHeaderDesc}
                    </p>
                  </div>
                  {!lastResponse && (
                    <button
                      onClick={() => setMissionSubView("workspace")}
                      className="btn-brass-primary"
                      style={{ fontSize: "13px" }}
                    >
                      {t.runWorkspaceQueryBtn}
                    </button>
                  )}
                </div>
              </EnamelSurface>

              <EvidencePanel
                evidenceSet={lastResponse?.evidence_set}
                calculations={lastResponse?.verification?.calculation_results || lastResponse?.verification?.calculations || []}
                title="Execution Evidence Records"
                locale={locale}
              />
            </div>
          )}

          {missionSubView === "verification" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <EnamelSurface variant="base" padding="normal">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--ink)" }}>
                      {t.verificationHeaderTitle}
                    </h2>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: "14px", color: "var(--ink-2)", marginTop: 2 }}>
                      {t.verificationHeaderDesc}
                    </p>
                  </div>
                  {!lastResponse && (
                    <button
                      onClick={() => setMissionSubView("workspace")}
                      className="btn-brass-primary"
                      style={{ fontSize: "13px" }}
                    >
                      {t.executeInWorkspaceBtn}
                    </button>
                  )}
                </div>
              </EnamelSurface>

              <VerificationPanel verification={lastResponse?.verification} locale={locale} />
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          2. LIBRARY DESTINATION
          ========================================================================= */}
      {destination === "library" && (
        <KnowledgeView clearance={clearance} locale={locale} />
      )}

      {/* =========================================================================
          3. GOVERNANCE DESTINATION
          ========================================================================= */}
      {destination === "governance" && (
        <GovernanceView role={role} locale={locale} />
      )}

      {/* =========================================================================
          4. AUDIT DESTINATION
          ========================================================================= */}
      {destination === "audit" && (
        <AuditView locale={locale} />
      )}

      {/* =========================================================================
          5. BOUNDARY DESTINATION
          ========================================================================= */}
      {destination === "boundary" && (
        <SovereigntyView locale={locale} />
      )}

      <style jsx>{`
        @media (max-width: 960px) {
          .missions-hero-grid {
            grid-template-columns: 1fr !important;
            padding: 24px 20px !important;
          }
        }
      `}</style>
    </AppShell>
  );
}
