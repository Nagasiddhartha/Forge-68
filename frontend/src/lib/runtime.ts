import { useEffect, useState, useCallback } from "react";
import { fetchRuntimeCapabilities, RuntimeCapabilities } from "./api";

export type ReasoningStatus = "LIVE_LOCAL" | "DEMO_LOCAL" | "UNAVAILABLE";
export type VisionStatus = "LIVE_LOCAL" | "DEMO_LOCAL" | "UNAVAILABLE";
export type BackendStatus = "ONLINE" | "OFFLINE";
export type CloudAIStatus = "NOT_CONFIGURED" | "BLOCKED";

export interface ComputedRuntimeState {
  backend: BackendStatus;
  reasoning: ReasoningStatus;
  reasoningModel: string;
  reasoningLive: boolean;
  vision: VisionStatus;
  visionModel: string;
  visionLive: boolean;
  cloudAI: CloudAIStatus;
  policyDefault: string;
  embeddingModel: string;
  embeddingKind: string;
  auditPersisted: boolean;
  auditHashChained: boolean;
  auditTotalEvents: number;
  capabilities: RuntimeCapabilities | null;
  lastChecked: string;
  isLoading: boolean;
  error: string | null;
}

export const DEFAULT_RUNTIME_STATE: ComputedRuntimeState = {
  backend: "ONLINE",
  reasoning: "DEMO_LOCAL",
  reasoningModel: "qwen3:8b",
  reasoningLive: false,
  vision: "DEMO_LOCAL",
  visionModel: "qwen2.5-vl:7b",
  visionLive: false,
  cloudAI: "NOT_CONFIGURED",
  policyDefault: "deny",
  embeddingModel: "",
  embeddingKind: "deterministic_fallback",
  auditPersisted: false,
  auditHashChained: false,
  auditTotalEvents: 0,
  capabilities: null,
  lastChecked: "",
  isLoading: true,
  error: null,
};

export function computeRuntimeState(
  caps: RuntimeCapabilities | null,
  isOnline: boolean,
  fetchError: string | null = null
): ComputedRuntimeState {
  if (!isOnline || !caps) {
    return {
      backend: isOnline ? "ONLINE" : "OFFLINE",
      reasoning: "UNAVAILABLE",
      reasoningModel: caps?.reasoning?.model || "qwen3:8b",
      reasoningLive: false,
      vision: "UNAVAILABLE",
      visionModel: caps?.vision?.model || "qwen2.5-vl:7b",
      visionLive: false,
      cloudAI: "BLOCKED",
      policyDefault: caps?.policy?.default || "deny",
      embeddingModel: caps?.embedding?.model || "local-sovereign",
      embeddingKind: caps?.embedding?.kind || "deterministic_fallback",
      auditPersisted: false,
      auditHashChained: false,
      auditTotalEvents: 0,
      capabilities: caps,
      lastChecked: new Date().toISOString(),
      isLoading: false,
      error: fetchError || (isOnline ? null : "Backend unreachable"),
    };
  }

  // Reasoning evaluation
  let reasoningStatus: ReasoningStatus = "UNAVAILABLE";
  if (caps.reasoning?.reachable && caps.reasoning?.live_for_runs) {
    reasoningStatus = "LIVE_LOCAL";
  } else {
    reasoningStatus = "DEMO_LOCAL";
  }

  // Vision evaluation
  let visionStatus: VisionStatus = "UNAVAILABLE";
  if (caps.vision?.installed && caps.vision?.mode === "live") {
    visionStatus = "LIVE_LOCAL";
  } else {
    visionStatus = "DEMO_LOCAL";
  }

  return {
    backend: "ONLINE",
    reasoning: reasoningStatus,
    reasoningModel: caps.reasoning?.model || "qwen3:8b",
    reasoningLive: caps.reasoning?.live_for_runs || false,
    vision: visionStatus,
    visionModel: caps.vision?.model || "qwen2.5-vl:7b",
    visionLive: caps.vision?.mode === "live",
    cloudAI: caps.outside_ai_services_configured === 0 ? "NOT_CONFIGURED" : "BLOCKED",
    policyDefault: caps.policy?.default || "deny",
    embeddingModel: caps.embedding?.model || "",
    embeddingKind: caps.embedding?.kind || "deterministic_fallback",
    auditPersisted: caps.audit?.persisted || false,
    auditHashChained: caps.audit?.hash_chained || false,
    auditTotalEvents: caps.audit?.total_events || 0,
    capabilities: caps,
    lastChecked: new Date().toISOString(),
    isLoading: false,
    error: null,
  };
}

export function useRuntimeCapabilities(pollIntervalMs: number = 30000) {
  const [state, setState] = useState<ComputedRuntimeState>(DEFAULT_RUNTIME_STATE);

  const refresh = useCallback(async () => {
    try {
      const caps = await fetchRuntimeCapabilities();
      setState(computeRuntimeState(caps, true, null));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to query runtime capabilities";
      setState((prev) => computeRuntimeState(prev.capabilities, false, msg));
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchCaps = () => {
      fetchRuntimeCapabilities()
        .then((caps) => {
          if (active) setState(computeRuntimeState(caps, true, null));
        })
        .catch((err) => {
          if (active) {
            const msg = err instanceof Error ? err.message : "Failed to query runtime capabilities";
            setState((prev) => computeRuntimeState(prev.capabilities, false, msg));
          }
        });
    };

    fetchCaps();
    const timer = setInterval(fetchCaps, pollIntervalMs);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [pollIntervalMs]);

  return {
    ...state,
    refresh,
  };
}


/**
 * Honest copy helpers conforming to AGENTS.md & Section 3/7 Honesty Rules
 */
export function getReasoningCopy(reasoning: ReasoningStatus, model: string): string {
  switch (reasoning) {
    case "LIVE_LOCAL":
      return `LOCAL INFERENCE · LIVE (${model})`;
    case "DEMO_LOCAL":
      return `DEMO HARNESS · LOCAL (${model})`;
    case "UNAVAILABLE":
      return "REASONING SERVICE OFFLINE";
  }
}

export function getVisionCopy(vision: VisionStatus, model: string): string {
  switch (vision) {
    case "LIVE_LOCAL":
      return `VISION · LIVE LOCAL (${model})`;
    case "DEMO_LOCAL":
      return "VISION · DEMO FIXTURE (ADVISORY)";
    case "UNAVAILABLE":
      return "VISION SERVICE OFFLINE";
  }
}

export function getAuditCopy(hashChained: boolean, count: number): string {
  if (hashChained) {
    return `HASH-CHAINED AUDIT (${count} events)`;
  }
  return `LOCAL APPEND-ONLY AUDIT (${count} events)`;
}
