/**
 * FORGE Regional Multilingual Dictionary (English, Hindi, Kannada).
 * Tailored for Mangalore Refinery and Petrochemicals Limited (MRPL) operational context.
 * Provides exhaustive translations across all views, cards, metrics, and technical labels.
 */

export type Locale = "en" | "hi" | "kn";

export interface I18nTranslations {
  navMissions: string;
  navKnowledge: string;
  navGovernance: string;
  navAudit: string;
  navBoundary: string;
  brandTitle: string;
  localOnly: string;
  offline: string;
  airGappedBadge: string;
  personaLabel: string;
  clearanceOverride: string;
  clearanceLabel: string;
  roleLabel: string;
  selectPersonaTitle: string;
  rbacEnforcedBadge: string;
  selectPersonaDesc: string;
  roleEngineer: string;
  roleInspector: string;
  roleAiOperator: string;
  roleAdmin: string;
  roleSecurityOfficer: string;
  roleSummaryEngineer: string;
  roleSummaryInspector: string;
  roleSummaryAiOperator: string;
  roleSummaryAdmin: string;
  roleSummarySecurityOfficer: string;
  verified: string;
  needsReview: string;
  deniedByPolicy: string;
  quarantined: string;
  offlineFallbackBadge: string;
  insufficientEvidence: string;
  actionBlocked: string;
  failed: string;
  heroTitle: string;
  heroSubtitle: string;
  startMissionBtn: string;
  inspectTelemetryBtn: string;
  baselineMetric: string;
  deviationMetric: string;
  distanceToAlarmMetric: string;
  baselineSubtext: string;
  deviationSubtext: string;
  alarmSubtext: string;
  dialLabel: string;
  missionViewsLabel: string;
  tabOverview: string;
  tabWorkspace: string;
  tabEvidence: string;
  tabVerification: string;
  caseBadge: string;
  facilityUnit: string;
  caseTitle: string;
  caseDescription: string;
  openWorkspaceBtn: string;
  primaryParamsHeader: string;
  telemetryPoint: string;
  currentCondition: string;
  currentConditionSubtext: string;
  observedDeviation: string;
  aboveNominalLimit: string;
  highAlarmLimit: string;
  marginRemaining: string;
  tripThreshold: string;
  safetyInterlockShutdown: string;
  multiSourceDossierTitle: string;
  multiSourceCorroboration: string;
  multiSourceDesc: string;
  verificationSpineTitle: string;
  nonLlmVerificationSpine: string;
  verificationSpineDesc: string;
  controlsBoundariesTitle: string;
  defaultDenyPolicyGateway: string;
  controlsBoundariesDesc: string;
  evidenceHeaderTitle: string;
  evidenceHeaderDesc: string;
  runWorkspaceQueryBtn: string;
  verificationHeaderTitle: string;
  verificationHeaderDesc: string;
  executeInWorkspaceBtn: string;
  scenariosTitle: string;
  caseLabel: string;
  expectedLabel: string;
  runBtn: string;
  runningBtn: string;
  sc1Title: string;
  sc1Badge: string;
  sc1Desc: string;
  sc2Title: string;
  sc2Badge: string;
  sc2Desc: string;
  sc3Title: string;
  sc3Badge: string;
  sc3Desc: string;
  sc4Title: string;
  sc4Badge: string;
  sc4Desc: string;
  investigationConsoleTitle: string;
  sovereignReasoningBadge: string;
  activeContextLabel: string;
  imageContextLabel: string;
  uploadImageBtn: string;
  analyzeImageOnlyBtn: string;
  executeInvestigation: string;
  executingInvestigation: string;
  customQueryPlaceholder: string;
  downloadApprovalNote: string;
  generatingDocument: string;
  equipmentTag: string;
  operationalStatus: string;
  verificationVerdict: string;
  questionR204Review: string;
  findingPressureHigh: string;
  recommendationReview: string;
  offlineResolvedTitle: string;
  offlineResolvedDesc: string;
  metricCurrentCondition: string;
  metricNormalBaseline: string;
  metricDeviation: string;
  metricHighAlarm: string;
  metricAboveNormal: string;
  metricMarginLeft: string;
  pressureInstrumentLabel: string;
  observedSuffix: string;
  normalSuffix: string;
  alarmSuffix: string;
  tripSuffix: string;
  whatSupportsTitle: string;
  verifiedSourcesCount: string;
  sourceSopLabel: string;
  sourceSopVal: string;
  sourceGaugeLabel: string;
  sourceGaugeVal: string;
  sourceCalcLabel: string;
  sourceCalcVal: string;
  whyTrustTitle: string;
  checksPassedCount: string;
  checkTraceable: string;
  checkEvidenceComplete: string;
  checkWithinPolicy: string;
  checkWithinAccess: string;
  checkValuesAgree: string;
  checkMath: string;
  passBadge: string;
  checkedByPythonNotice: string;
  deepInspectionLabel: string;
  tabDeepSummary: string;
  tabDeepTimeline: string;
  tabDeepEvidence: string;
  tabDeepChecks: string;
  tabDeepVision: string;
  case03BannerTitle: string;
  case03BannerDesc: string;
  case03Step1: string;
  case03Step2: string;
  case03Step3: string;
  case03WhyBlocked: string;
  case03ToolExecution: string;
  case03ZeroHardware: string;
  case03GatewayVerdict: string;
  case03AuditRecord: string;
  case04BannerTitle: string;
  case04BannerDesc: string;
  case04SubDesc: string;
  case04Step1: string;
  case04Step2: string;
  case04Step3: string;
  case04PrivilegesGranted: string;
  case04ZeroTools: string;
  case04BoundaryResult: string;
  case04SafetyProof: string;
  sovHeroBadge: string;
  sovHeroTitle: string;
  sovHeroDesc: string;
  sovVerifyBtn: string;
  sovVerifyingBtn: string;
  sovPillarsTitle: string;
  sovPillarsSubtitle: string;
  sovViewDetailsBtn: string;
  sovHideDetailsBtn: string;
  sovExtAiTitle: string;
  sovExtAiVal: string;
  sovExtAiSub: string;
  sovCloudFallbackTitle: string;
  sovCloudFallbackVal: string;
  sovCloudFallbackSub: string;
  sovAdversarialTitle: string;
  sovAdversarialSub: string;
  sovPillarAiTitle: string;
  sovPillarAiBadge: string;
  sovPillarAiDesc: string;
  sovPillarKnowledgeTitle: string;
  sovPillarKnowledgeBadge: string;
  sovPillarKnowledgeDesc: string;
  sovPillarToolsTitle: string;
  sovPillarToolsBadge: string;
  sovPillarToolsDesc: string;
  sovPillarVerifTitle: string;
  sovPillarVerifBadge: string;
  sovPillarVerifDesc: string;
  sovPillarAuditTitle: string;
  sovPillarAuditBadge: string;
  sovPillarAuditDesc: string;
  sovPillarEgressTitle: string;
  sovPillarEgressBadge: string;
  sovPillarEgressDesc: string;
  networkIsolationTitle: string;
  networkIsolationDesc: string;
  zeroEgressBadge: string;
  knowledgeTitle: string;
  knowledgeSubtitle: string;
  knowledgeSearchPlaceholder: string;
  searchKnowledgeBtn: string;
  searchingKnowledgeBtn: string;
  refreshRecordsBtn: string;
  refreshingRecordsBtn: string;
  askRecordsLabel: string;
  clearanceEnforcedLabel: string;
  suggestedQueriesLabel: string;
  plantDocumentsHeader: string;
  assetLabel: string;
  sizeLabel: string;
  refLabel: string;
  reIndexBtn: string;
  indexingBtn: string;
  accessibleBadge: string;
  restrictedBadge: string;
  humanAnswerTitle: string;
  humanAnswerSubtitle: string;
  primarySourceLabel: string;
  onPremiseLocalDataProof: string;
  sourcePassagesHeader: string;
  matchScoreSuffix: string;
  documentLabel: string;
  chunkIdLabel: string;
  readyToSearchTitle: string;
  readyToSearchDesc: string;
  docSopTitle: string;
  docSopDesc: string;
  docSopCat: string;
  docInspectionTitle: string;
  docInspectionDesc: string;
  docInspectionCat: string;
  docEquipTitle: string;
  docEquipDesc: string;
  docEquipCat: string;
  docMaintenanceTitle: string;
  docMaintenanceDesc: string;
  docMaintenanceCat: string;
  docAdvisoryTitle: string;
  docAdvisoryDesc: string;
  docAdvisoryCat: string;
  governanceTitle: string;
  governanceSubtitle: string;
  permissionMatrixTitle: string;
  authorityLedgerBadge: string;
  defaultDenyBadge: string;
  securityPassBadge: string;
  activePersonaLabel: string;
  policyGatewayActive: string;
  colRole: string;
  colRead: string;
  colInvestigate: string;
  colActuate: string;
  colAdmin: string;
  colSummary: string;
  badgeAllowed: string;
  badgeApprovalRequired: string;
  badgeBlocked: string;
  youBadge: string;
  securityTestsBannerTitle: string;
  securityTestsBannerDesc: string;
  viewPolicyDetailsBtn: string;
  hidePolicyDetailsBtn: string;
  auditTitle: string;
  auditSubtitle: string;
  auditTotalEvents: string;
  auditBadgeActivity: string;
  auditBadgeAppendOnly: string;
  refreshActivityBtn: string;
  refreshingActivityBtn: string;
  normalFlowTitle: string;
  blockedFlowTitle: string;
  kpiTotalEvents: string;
  kpiToolPolicy: string;
  kpiStorageMode: string;
  kpiOutsideAi: string;
  kpiSinkModeVal: string;
  kpiSinkModeSub: string;
  kpiNoneConfiguredVal: string;
  kpiNoneConfiguredSub: string;
  forensicSpineTitle: string;
  filterAll: string;
  filterAgent: string;
  filterKnowledge: string;
  filterPolicy: string;
  filterTool: string;
  filterVerification: string;
  inspectJsonBtn: string;
  closeJsonBtn: string;
  actorLabel: string;
  eventIdLabel: string;
  evtQuestionReceivedTitle: string;
  evtQuestionReceivedDesc: string;
  evtKnowledgeConsultedTitle: string;
  evtKnowledgeConsultedDesc: string;
  evtPolicyBlockedTitle: string;
  evtPolicyBlockedDesc: string;
  evtPolicyAllowedTitle: string;
  evtPolicyAllowedDesc: string;
  evtToolBlockedTitle: string;
  evtToolBlockedDesc: string;
  evtToolExecutedTitle: string;
  evtToolExecutedDesc: string;
  evtVerifiedTitle: string;
  evtVerifiedDesc: string;
  evidenceDossierTitle: string;
  evidenceDossierSubtitle: string;
  filterAllEvidence: string;
  filterProcedures: string;
  filterSensors: string;
  filterGauges: string;
  filterMath: string;
  modelDoesNotVerifyTitle: string;
  independentCodeChecksBadge: string;
  deterministicVerdictLabel: string;
  assessmentSummaryLabel: string;
  footerReasoning: string;
  footerVision: string;
  footerPolicy: string;
  footerOutsideAi: string;
  footerNoneConfigured: string;
  footerDefaultDeny: string;
  footerRuntimeDetails: string;
  footerLive: string;
  footerDemoHarness: string;
  footerFixture: string;
  traceTitle: string;
  traceLifecycle: string;
  traceEventId: string;
  tracePhase1Title: string;
  tracePhase1Badge: string;
  tracePhase2Title: string;
  traceActionLabel: string;
  traceKnowledgeQueries: string;
  traceToolCalls: string;
  traceCalculations: string;
  tracePhase3Title: string;
  traceChunksRetrieved: string;
  traceMatch: string;
  tracePhase4Title: string;
  traceEvaluations: string;
  traceRule: string;
  traceExecutedTools: string;
  tracePhase5Title: string;
  traceVisualRecords: string;
  tracePhase6Title: string;
  tracePhase7Title: string;
  traceOperatorPresentation: string;
  healthTitle: string;
  healthSubtitle: string;
  healthLastSampled: string;
  healthInitializing: string;
  healthProbing: string;
  healthRunCheck: string;
  healthBackendEngine: string;
  healthSovereigntyEnforcement: string;
  healthSovereignRuntime: string;
  healthZeroCloudAllowed: string;
  healthLocalInferenceBackend: string;
  healthStatusOnline: string;
  healthStatusOffline: string;
  healthReasoningModel: string;
  healthVerifiedLocalGpu: string;
  healthConfiguredDefault: string;
  navSovereignLocalRuntime: string;
  navBackendOffline: string;
  navLiveLocalInference: string;
  navDeterministicDemoMode: string;
  caseAssetLabel: string;
  casePersonaLabel: string;
  caseClearanceLabel: string;
  caseLoggedLabel: string;
  subsystemActive: string;
  subsystemReady: string;
  subsystemStaged: string;
  runtimeDetailsTitle: string;
  runtimeDetailsSubtitle: string;
  runtimeCloseBtn: string;
  runtimeEndpointTitle: string;
  runtimeLoopbackVerified: string;
  runtimeReasoningSubsystem: string;
  runtimeLiveResponding: string;
  runtimeDemoHarnessDesc: string;
  runtimeVisionSubsystem: string;
  runtimeVisionLive: string;
  runtimeVisionFixture: string;
  runtimeEmbeddingsTitle: string;
  runtimeOnPremiseOnly: string;
  runtimeDependencyAudit: string;
  runtimeZeroCloudSdk: string;
  runtimeSdkForbidden: string;
  runtimeAuditIntegrity: string;
  runtimeHashChained: string;
  runtimeAppendOnly: string;
  runtimeTotalEvents: string;
  runtimeRefreshBtn: string;
  visionFilename: string;
  visionMime: string;
  visionSize: string;
  visionConfidence: string;
  visionObserved: string;
  visionSeverity: string;
}

export const TRANSLATIONS: Record<Locale, I18nTranslations> = {
  en: {
    navMissions: "Missions",
    navKnowledge: "Plant Knowledge",
    navGovernance: "Who Can Do What",
    navAudit: "Audit",
    navBoundary: "Boundary",
    brandTitle: "Industrial AI Control Plane",
    localOnly: "Local only",
    offline: "Offline",
    airGappedBadge: "0 B Egressed · Air-Gapped",
    personaLabel: "Persona:",
    clearanceOverride: "Clearance Override:",
    clearanceLabel: "Clearance:",
    roleLabel: "Role:",
    selectPersonaTitle: "Select User Persona",
    rbacEnforcedBadge: "RBAC ENFORCED",
    selectPersonaDesc: "Switching personas dynamically updates your plant permissions, tool boundaries, and investigation authority.",
    roleEngineer: "ENGINEER",
    roleInspector: "INSPECTOR",
    roleAiOperator: "AI OPERATOR",
    roleAdmin: "ADMIN",
    roleSecurityOfficer: "SECURITY OFFICER",
    roleSummaryEngineer: "Read plant data & SOPs, run investigations, read-only tools. Critical actuation requires approval. Admin actions blocked.",
    roleSummaryInspector: "Read inspection & telemetry data, run investigations. Actuation blocked. Admin actions blocked.",
    roleSummaryAiOperator: "Approved read & investigation access. Zero write authority. Actuation blocked. Admin actions blocked.",
    roleSummaryAdmin: "Broadest access. Critical actions require appropriate approval. Administrative controls available.",
    roleSummarySecurityOfficer: "Audit & security visibility. Plant actuation blocked. Administrative override blocked.",
    verified: "VERIFIED",
    needsReview: "REVIEW REQUIRED",
    deniedByPolicy: "DENIED BY POLICY",
    quarantined: "QUARANTINED",
    offlineFallbackBadge: "OFFLINE ROUTER",
    insufficientEvidence: "INSUFFICIENT EVIDENCE",
    actionBlocked: "ACTION BLOCKED",
    failed: "FAILED",
    heroTitle: "Industrial AI that proposes. You decide.",
    heroSubtitle: "FORGE executes sovereign, local reasoning over private plant documentation. Policy determines authority, multi-source evidence supports every proposal, and deterministic code verifies the math before action is taken.",
    startMissionBtn: "Start a mission",
    inspectTelemetryBtn: "Inspect telemetry",
    baselineMetric: "Normal baseline",
    deviationMetric: "Observed deviation",
    distanceToAlarmMetric: "Distance to alarm",
    baselineSubtext: "SOP §3.2",
    deviationSubtext: "PI-204 reading",
    alarmSubtext: "Alarm at 33.5",
    dialLabel: "Reactor R-204 · Synthetic telemetry reading",
    missionViewsLabel: "Mission Views:",
    tabOverview: "Mission Overview",
    tabWorkspace: "AI Proposal & Actions",
    tabEvidence: "Supporting Evidence",
    tabVerification: "Why Trust This? (7 Checks)",
    caseBadge: "MISSION CASE · R-204-REV4",
    facilityUnit: "HYDROCRACKER LOOP · FACILITY UNIT 4",
    caseTitle: "Reactor R-204 Pressure Variance Investigation",
    caseDescription: "Autonomous industrial investigation synthesizing operating pressure telemetry, ultrasonic shell wall inspection, and plant operating procedures. All reasoning is sovereign, tool actuation is policy-gated, and conclusions are mathematically verified.",
    openWorkspaceBtn: "Open AI Workspace →",
    primaryParamsHeader: "Primary Operational Parameters · Reactor R-204",
    telemetryPoint: "Telemetry Point: PI-204",
    currentCondition: "Current Condition",
    currentConditionSubtext: "Analog indicator PI-204",
    observedDeviation: "Observed Deviation",
    aboveNominalLimit: "Above nominal limit",
    highAlarmLimit: "High Alarm Limit",
    marginRemaining: "Margin: 0.5 bar remaining",
    tripThreshold: "Trip Threshold",
    safetyInterlockShutdown: "Safety interlock shutdown",
    multiSourceDossierTitle: "01 · EVIDENCE DOSSIER",
    multiSourceCorroboration: "Multi-Source Corroboration",
    multiSourceDesc: "Autonomous agent combines private plant documents, historical inspection reports, real-time sensor readings, and visual gauge inspection into a tamper-evident dossier.",
    verificationSpineTitle: "02 · VERIFICATION SPINE",
    nonLlmVerificationSpine: "Non-LLM Verification Spine",
    verificationSpineDesc: "The model never grades its own work. Deterministic Python engines verify mathematical calculations, cross-source consistency, and boundary constraints.",
    controlsBoundariesTitle: "03 · CONTROLS & BOUNDARIES",
    defaultDenyPolicyGateway: "Default-Deny Policy Gateway",
    controlsBoundariesDesc: "Execution sandboxes intercept actuation requests against RBAC rules and cryptographic policy trees. Prohibited operations are halted with immutable audit events.",
    evidenceHeaderTitle: "Supporting Evidence Dossier",
    evidenceHeaderDesc: "Every claim in an AI proposal is backed by auditable plant records, sensor readings, and deterministic formulas.",
    runWorkspaceQueryBtn: "Run Investigation in Workspace →",
    verificationHeaderTitle: "Deterministic Verification Proofs",
    verificationHeaderDesc: "Seven independent Python verification checks evaluated after model synthesis to prevent hallucinations.",
    executeInWorkspaceBtn: "Execute Proposal in Workspace →",
    scenariosTitle: "Four Repeatable Industrial Missions",
    caseLabel: "Case",
    expectedLabel: "Expected Verdict",
    runBtn: "Run Mission",
    runningBtn: "Executing Mission...",
    sc1Title: "Case 01 · Standard R-204 Investigation",
    sc1Badge: "AUTONOMOUS REASONING",
    sc1Desc: "Full investigation synthesizing SOP operating limits, ultrasonic inspection reports, and live telemetry under nominal conditions.",
    sc2Title: "Case 02 · Pressure Gauge Variance",
    sc2Badge: "VISION + VERIFICATION",
    sc2Desc: "Multimodal inspection of analog gauge PI-204 dial image. Detects +1.8 bar delta above baseline, triggers REVIEW_REQUIRED.",
    sc3Title: "Case 03 · Unauthorized Actuation Attempt",
    sc3Badge: "POLICY INTERCEPTION",
    sc3Desc: "Operator requests physical calibration of relief valve PSV-204. Intercepted by policy gateway and halted (ACTION_BLOCKED).",
    sc4Title: "Case 04 · Adversarial Injection Bulletin",
    sc4Badge: "ADVERSARIAL QUARANTINE",
    sc4Desc: "Untrusted maintenance advisory containing system override prompt injection. Quarantined with zero tool actuation.",
    investigationConsoleTitle: "Autonomous Industrial Investigation Console",
    sovereignReasoningBadge: "SOVEREIGN LOCAL REASONING",
    activeContextLabel: "Active Plant Asset:",
    imageContextLabel: "Visual Telemetry Context:",
    uploadImageBtn: "Upload Plant Gauge / Inspection Photo",
    analyzeImageOnlyBtn: "Analyze Image Only (VLM)",
    executeInvestigation: "Execute Sovereign Investigation",
    executingInvestigation: "Executing Sovereign Reasoning Engine...",
    customQueryPlaceholder: "Enter industrial inquiry or telemetry analysis request...",
    downloadApprovalNote: "Download Formal MRPL Approval Note (.docx)",
    generatingDocument: "Generating Document...",
    equipmentTag: "Equipment Tag: R-204",
    operationalStatus: "Operational Status: High Pressure Advisory",
    verificationVerdict: "Deterministic Verdict:",
    questionR204Review: "Does Reactor R-204 require engineering review?",
    findingPressureHigh: "Finding: Pressure is elevated (+1.8 bar above normal). It has not tripped, but it is 0.5 bar from alarm.",
    recommendationReview: "Recommendation: Engineering review required before next shift.",
    offlineResolvedTitle: "Autonomous Sovereign Resolution (Offline Mode)",
    offlineResolvedDesc: "Resolved through local deterministic rules engine. Zero external cloud connectivity required.",
    metricCurrentCondition: "CURRENT CONDITION",
    metricNormalBaseline: "NORMAL BASELINE",
    metricDeviation: "DEVIATION",
    metricHighAlarm: "HIGH ALARM",
    metricAboveNormal: "above normal",
    metricMarginLeft: "margin left",
    pressureInstrumentLabel: "Pressure Instrument PI-204 · Scale & Trip Limits",
    observedSuffix: "Observed",
    normalSuffix: "Normal",
    alarmSuffix: "Alarm",
    tripSuffix: "Trip",
    whatSupportsTitle: "What supports this answer?",
    verifiedSourcesCount: "4 VERIFIED SOURCES",
    sourceSopLabel: "Operating SOP §3.2",
    sourceSopVal: "Specifies 31.2 bar nominal baseline and 33.5 bar alarm threshold.",
    sourceGaugeLabel: "Analog Gauge PI-204",
    sourceGaugeVal: "Visual inspection of gauge needle indicates 33.0 bar steady state.",
    sourceCalcLabel: "Deterministic Math",
    sourceCalcVal: "Python calculation verifies: 33.0 - 31.2 = +1.8 bar variance.",
    whyTrustTitle: "Why should you trust this answer?",
    checksPassedCount: "7 OF 7 CHECKS PASSED",
    checkTraceable: "Sources traceable",
    checkEvidenceComplete: "Evidence complete",
    checkWithinPolicy: "Within policy rules",
    checkWithinAccess: "Within your access",
    checkValuesAgree: "Values agree",
    checkMath: "Math independently checked",
    passBadge: "PASS",
    checkedByPythonNotice: "Checked by Python code, not the AI model.",
    deepInspectionLabel: "DEEP INSPECTION DOSSIER",
    tabDeepSummary: "Summary",
    tabDeepTimeline: "Timeline",
    tabDeepEvidence: "Evidence (4)",
    tabDeepChecks: "Checks (7)",
    tabDeepVision: "Vision",
    case03BannerTitle: "ACTION BLOCKED · Policy Gateway Intercepted Actuation",
    case03BannerDesc: "The agent attempted to invoke a physical calibration tool, but FORGE intercepted and blocked the action before execution.",
    case03Step1: "1. Request Received",
    case03Step2: "2. Policy Check",
    case03Step3: "3. Gateway Interception",
    case03WhyBlocked: "Why it was blocked: Calibrating relief valves requires Admin role and supervisor approval. Current persona (ENGINEER) lacks actuation authority.",
    case03ToolExecution: "Tool Execution: Blocked (0 times executed)",
    case03ZeroHardware: "Physical Safety: Zero actuation sent to plant hardware.",
    case03GatewayVerdict: "Gateway Verdict: DENY (Policy ID: POL-004-SAFETY)",
    case03AuditRecord: "Audit Record: Logged to immutable forensic timeline.",
    case04BannerTitle: "UNTRUSTED INPUT QUARANTINED · Adversarial Boundary Enforced",
    case04BannerDesc: "The input document contained prompt injection attempting to override system instructions and execute unauthorized tools.",
    case04SubDesc: "FORGE detected the adversarial pattern, isolated the untrusted content, and prevented all tool execution.",
    case04Step1: "1. Untrusted Input",
    case04Step2: "2. Boundary Filter",
    case04Step3: "3. Quarantined",
    case04PrivilegesGranted: "Privileges Granted: NONE",
    case04ZeroTools: "Tool Execution: 0 tools dispatched",
    case04BoundaryResult: "Boundary Result: Quarantined to sandbox",
    case04SafetyProof: "Safety Proof: Model instructions were not overridden.",
    sovHeroBadge: "ON-PREMISE SOVEREIGN RUNTIME",
    sovHeroTitle: "Your data stays inside FORGE",
    sovHeroDesc: "All reasoning, plant knowledge, industrial tools, and verification execute strictly on local sovereign hardware. Outside AI cloud services are strictly unconfigured and inaccessible.",
    sovVerifyBtn: "Verify Runtime State ↻",
    sovVerifyingBtn: "Verifying...",
    sovPillarsTitle: "FIVE SOVEREIGN PILLARS",
    sovPillarsSubtitle: "How FORGE Guarantees Complete Isolation",
    sovViewDetailsBtn: "View Technical Runtime Details ▼",
    sovHideDetailsBtn: "Hide Technical Details ▲",
    sovExtAiTitle: "EXTERNAL AI PROVIDERS",
    sovExtAiVal: "None configured",
    sovExtAiSub: "Zero cloud LLM API calls or SDKs",
    sovCloudFallbackTitle: "CLOUD FALLBACK",
    sovCloudFallbackVal: "Disabled (Fail-Closed)",
    sovCloudFallbackSub: "Never fails over to public services",
    sovAdversarialTitle: "ADVERSARIAL BOUNDARY PROOFS",
    sovAdversarialSub: "Security tests verified",
    sovPillarAiTitle: "Local AI",
    sovPillarAiBadge: "On-Premise Ready",
    sovPillarAiDesc: "Runs on-premise (qwen3:8b via OLLAMA). No cloud AI, zero external API calls, zero cloud SDK dependencies.",
    sovPillarKnowledgeTitle: "Local Knowledge",
    sovPillarKnowledgeBadge: "On-Premise Vector Enclave",
    sovPillarKnowledgeDesc: "Private plant documents indexed locally (Local Embeddings). Zero cloud vector databases. Access strictly bounded by role clearance.",
    sovPillarToolsTitle: "Local Tools",
    sovPillarToolsBadge: "Bounded Execution",
    sovPillarToolsDesc: "Industrial actuation, SCADA telemetry queries, and file operations execute inside local sandboxes. Policy gateway intercepts every call before execution.",
    sovPillarVerifTitle: "Independent Verification",
    sovPillarVerifBadge: "Deterministic Code Checks",
    sovPillarVerifDesc: "7 discrete verification checks evaluate facts, unit bounds, and calculations using pure Python code. The AI model is never allowed to grade its own work.",
    sovPillarAuditTitle: "Local Audit",
    sovPillarAuditBadge: "Append-Only Local Sink",
    sovPillarAuditDesc: "Every question, reasoning trace, tool execution, and verification check is logged to an immutable local file sink. Data never leaves your facility.",
    sovPillarEgressTitle: "Network Isolation",
    sovPillarEgressBadge: "0 B External · 100% Isolated",
    sovPillarEgressDesc: "Host loopback interface enforcement. Socket audit proves zero external bytes or packets leave the local facility. Zero cloud AI SDK dependencies.",
    networkIsolationTitle: "Host Network Egress Control",
    networkIsolationDesc: "System egress socket audit confirms zero outbound network packets.",
    zeroEgressBadge: "0 B EGRESSED · AIR-GAPPED",
    knowledgeTitle: "Plant Knowledge Fabric",
    knowledgeSubtitle: "Search private plant documentation, operating procedures, and inspection records with deterministic role clearance boundaries.",
    knowledgeSearchPlaceholder: "Ask a question, e.g. 'What is the trip limit for Reactor R-204?'...",
    searchKnowledgeBtn: "Search Knowledge",
    searchingKnowledgeBtn: "Searching...",
    refreshRecordsBtn: "↻ Refresh Records",
    refreshingRecordsBtn: "Refreshing...",
    askRecordsLabel: "ASK A QUESTION ABOUT PLANT RECORDS",
    clearanceEnforcedLabel: "Clearance Enforced:",
    suggestedQueriesLabel: "Suggested Queries:",
    plantDocumentsHeader: "PLANT DOCUMENTS",
    assetLabel: "ASSET: REACTOR R-204",
    sizeLabel: "Size:",
    refLabel: "Ref:",
    reIndexBtn: "Re-Index ↺",
    indexingBtn: "Indexing...",
    accessibleBadge: "✓ Accessible",
    restrictedBadge: "🔒 Restricted",
    humanAnswerTitle: "HUMAN-READABLE ANSWER",
    humanAnswerSubtitle: "Synthesized from private plant records",
    primarySourceLabel: "Primary Source:",
    onPremiseLocalDataProof: "✓ 100% on-premise local data",
    sourcePassagesHeader: "ANSWER & SUPPORTING PASSAGES",
    matchScoreSuffix: "% MATCH",
    documentLabel: "Document:",
    chunkIdLabel: "Chunk ID:",
    readyToSearchTitle: "Ready to search plant records",
    readyToSearchDesc: "Ask any operational question or select a suggestion above to inspect sovereign vector retrievals.",
    docSopTitle: "Operating SOP",
    docSopDesc: "Operating limits, normal baselines, and safety thresholds.",
    docSopCat: "STANDARD PROCEDURE",
    docInspectionTitle: "Inspection Report",
    docInspectionDesc: "Ultrasonic shell thickness survey and weld joint data.",
    docInspectionCat: "NDT SURVEY",
    docEquipTitle: "Equipment Specification",
    docEquipDesc: "Pressure vessel R-204 design envelope and metallurgy.",
    docEquipCat: "VESSEL SPEC",
    docMaintenanceTitle: "Maintenance History",
    docMaintenanceDesc: "Overhaul logs and relief valve calibration records.",
    docMaintenanceCat: "PLANT HISTORY",
    docAdvisoryTitle: "Restricted Advisory Bulletin",
    docAdvisoryDesc: "Quarantine sample containing untrusted prompt injection.",
    docAdvisoryCat: "SECURITY TEST FIXTURE",
    governanceTitle: "Role-Based Authority & Policy Gateways",
    governanceSubtitle: "Who can do what in FORGE. Every tool call and investigation is strictly governed by cryptographic policy gateways with default-deny enforcement.",
    permissionMatrixTitle: "Permissions by Role",
    authorityLedgerBadge: "AUTHORITY LEDGER",
    defaultDenyBadge: "DEFAULT-DENY ENFORCED",
    securityPassBadge: "SECURITY TESTS: 10 / 10 PASSED",
    activePersonaLabel: "Current active persona:",
    policyGatewayActive: "Policy Gateway: ACTIVE & ENFORCING",
    colRole: "Role",
    colRead: "Read",
    colInvestigate: "Investigate",
    colActuate: "Actuate",
    colAdmin: "Admin",
    colSummary: "Permissions Summary",
    badgeAllowed: "✓ Allowed",
    badgeApprovalRequired: "⚠ Approval required",
    badgeBlocked: "✕ Blocked",
    youBadge: "YOU",
    securityTestsBannerTitle: "Security tests: 10 / 10 passed",
    securityTestsBannerDesc: "Deterministic boundary tests verify untrusted inputs are quarantined and unauthorized actions are blocked.",
    viewPolicyDetailsBtn: "View Technical Policy Details ▼",
    hidePolicyDetailsBtn: "Hide Technical Details ▲",
    auditTitle: "Activity Timeline & Forensic Spine",
    auditSubtitle: "Every operator query, agent reasoning step, policy decision, tool execution, and verification check is recorded in an immutable local audit log.",
    auditTotalEvents: "TOTAL RECORDED EVENTS",
    auditBadgeActivity: "ACTIVITY TIMELINE",
    auditBadgeAppendOnly: "LOCAL APPEND-ONLY AUDIT",
    refreshActivityBtn: "↻ Refresh Activity",
    refreshingActivityBtn: "Refreshing...",
    normalFlowTitle: "NORMAL INVESTIGATION (ALLOWED)",
    blockedFlowTitle: "UNAUTHORIZED ACTUATION (BLOCKED)",
    kpiTotalEvents: "TOTAL RECORDED EVENTS",
    kpiToolPolicy: "TOOL & POLICY EXECUTIONS",
    kpiStorageMode: "AUDIT STORAGE MODE",
    kpiOutsideAi: "OUTSIDE AI SERVICES",
    kpiSinkModeVal: "LOCAL APPEND-ONLY SINK",
    kpiSinkModeSub: "Local memory & file store",
    kpiNoneConfiguredVal: "NONE CONFIGURED",
    kpiNoneConfiguredSub: "Loopback inference only",
    forensicSpineTitle: "FORENSIC SPINE",
    filterAll: "ALL",
    filterAgent: "AGENT",
    filterKnowledge: "KNOWLEDGE",
    filterPolicy: "POLICY",
    filterTool: "TOOL",
    filterVerification: "VERIFICATION",
    inspectJsonBtn: "Inspect JSON ▼",
    closeJsonBtn: "Close JSON ▲",
    actorLabel: "Actor:",
    eventIdLabel: "Event ID:",
    evtQuestionReceivedTitle: "Question received from operator",
    evtQuestionReceivedDesc: "Operator submitted an industrial telemetry or procedure inquiry to the sovereign control plane.",
    evtKnowledgeConsultedTitle: "Plant records consulted",
    evtKnowledgeConsultedDesc: "Sovereign local vector search retrieved private operating procedures within clearance bounds.",
    evtPolicyBlockedTitle: "Permission checked → BLOCKED",
    evtPolicyBlockedDesc: "FORGE verified permissions and blocked the requested action before execution.",
    evtPolicyAllowedTitle: "Permission checked → Allowed",
    evtPolicyAllowedDesc: "Action validated against policy rules for assigned role clearance.",
    evtToolBlockedTitle: "Tool execution blocked",
    evtToolBlockedDesc: "Policy gateway prevented tool dispatch. Sandboxed code executed: 0 times.",
    evtToolExecutedTitle: "Tool allowed & executed",
    evtToolExecutedDesc: "Industrial tool executed inside local sandboxed environment with verified arguments.",
    evtVerifiedTitle: "Answer verified independently",
    evtVerifiedDesc: "Deterministic Python checks evaluated calculations, consistency, and grounding.",
    evidenceDossierTitle: "Evidence Dossier",
    evidenceDossierSubtitle: "Every claim is tied to verifiable evidence: documented plant procedures, sandboxed tools, analog gauges, or deterministic math.",
    filterAllEvidence: "All Evidence",
    filterProcedures: "Plant Procedures",
    filterSensors: "Sensor Readings",
    filterGauges: "Gauges & Vision",
    filterMath: "Independent Math",
    modelDoesNotVerifyTitle: "THE MODEL DOES NOT VERIFY ITSELF",
    independentCodeChecksBadge: "7 INDEPENDENT CODE CHECKS",
    deterministicVerdictLabel: "DETERMINISTIC VERDICT",
    assessmentSummaryLabel: "VERIFICATION ASSESSMENT SUMMARY",
    footerReasoning: "Reasoning Model:",
    footerVision: "Vision Ingestion:",
    footerPolicy: "Security Policy:",
    footerOutsideAi: "External AI Services:",
    footerNoneConfigured: "None configured (air-gapped)",
    footerDefaultDeny: "Default-deny enforced",
    footerRuntimeDetails: "Runtime Details →",
    footerLive: "live on-premise",
    footerDemoHarness: "demo harness",
    footerFixture: "demo fixture (advisory)",
    traceTitle: "Forensic Execution Trace",
    traceLifecycle: "Deterministic Lifecycle",
    traceEventId: "Event ID",
    tracePhase1Title: "Operational Query Ingestion",
    tracePhase1Badge: "INGESTED",
    tracePhase2Title: "Reasoning Plan Formulation",
    traceActionLabel: "ACTION",
    traceKnowledgeQueries: "Knowledge Queries",
    traceToolCalls: "Tool Calls",
    traceCalculations: "Calculations",
    tracePhase3Title: "Sovereign Knowledge Retrieval",
    traceChunksRetrieved: "chunks retrieved",
    traceMatch: "match",
    tracePhase4Title: "Policy Gateway Mediation & Sandbox",
    traceEvaluations: "evaluations",
    traceRule: "RULE",
    traceExecutedTools: "Executed Sandbox Tools",
    tracePhase5Title: "Engineering Vision Observation",
    traceVisualRecords: "visual records",
    tracePhase6Title: "Independent Deterministic Verification",
    tracePhase7Title: "Verified Case Briefing Delivered",
    traceOperatorPresentation: "OPERATOR PRESENTATION",
    healthTitle: "Sovereign Control Plane Runtime Telemetry",
    healthSubtitle: "SOVEREIGN SYSTEM HEALTH",
    healthLastSampled: "LAST SAMPLED",
    healthInitializing: "INITIALIZING...",
    healthProbing: "PROBING RUNTIME...",
    healthRunCheck: "RUN HEALTH CHECK",
    healthBackendEngine: "BACKEND ENGINE",
    healthSovereigntyEnforcement: "SOVEREIGNTY ENFORCEMENT",
    healthSovereignRuntime: "SOVEREIGN RUNTIME",
    healthZeroCloudAllowed: "Zero Cloud AI APIs Allowed",
    healthLocalInferenceBackend: "LOCAL INFERENCE BACKEND",
    healthStatusOnline: "Online (Port 11434)",
    healthStatusOffline: "Offline / Standby",
    healthReasoningModel: "REASONING MODEL",
    healthVerifiedLocalGpu: "Verified Local (RTX 4060 GPU)",
    healthConfiguredDefault: "Configured Default",
    navSovereignLocalRuntime: "SOVEREIGN LOCAL RUNTIME",
    navBackendOffline: "BACKEND OFFLINE",
    navLiveLocalInference: "LIVE LOCAL INFERENCE",
    navDeterministicDemoMode: "DETERMINISTIC DEMO MODE",
    caseAssetLabel: "Asset",
    casePersonaLabel: "Persona",
    caseClearanceLabel: "Clearance",
    caseLoggedLabel: "Logged",
    subsystemActive: "Active",
    subsystemReady: "Ready",
    subsystemStaged: "Staged",
    runtimeDetailsTitle: "Sovereign Runtime Details",
    runtimeDetailsSubtitle: "Substantiated runtime capabilities & preflight telemetry",
    runtimeCloseBtn: "Close",
    runtimeEndpointTitle: "INFERENCE ENDPOINT",
    runtimeLoopbackVerified: "✓ Loopback verified — Zero external egress routes",
    runtimeReasoningSubsystem: "REASONING SUBSYSTEM",
    runtimeLiveResponding: "✓ Live local model responding",
    runtimeDemoHarnessDesc: "ℹ Deterministic demo harness (Scripted plan)",
    runtimeVisionSubsystem: "VISION SUBSYSTEM",
    runtimeVisionLive: "✓ Multimodal vision live locally",
    runtimeVisionFixture: "Advisory demo fixture (Offline synthetic images)",
    runtimeEmbeddingsTitle: "EMBEDDINGS & VECTOR SEARCH",
    runtimeOnPremiseOnly: "On-premise only",
    runtimeDependencyAudit: "DEPENDENCY AUDIT",
    runtimeZeroCloudSdk: "✓ 0 cloud AI SDKs loaded",
    runtimeSdkForbidden: "Scan verified at startup: OpenAI, Anthropic, Google GenAI strictly forbidden",
    runtimeAuditIntegrity: "AUDIT TRAIL INTEGRITY",
    runtimeHashChained: "Hash-Chained Event Store",
    runtimeAppendOnly: "Local Append-Only Event Bus",
    runtimeTotalEvents: "Total events recorded",
    runtimeRefreshBtn: "Refresh Preflight Telemetry",
    visionFilename: "Filename",
    visionMime: "MIME",
    visionSize: "Size",
    visionConfidence: "Confidence",
    visionObserved: "Observed",
    visionSeverity: "Severity",
  },
  hi: {
    navMissions: "अभियान (Missions)",
    navKnowledge: "संयंत्र ज्ञान (Knowledge)",
    navGovernance: "नीति पालन (Governance)",
    navAudit: "लेखापरीक्षण (Audit)",
    navBoundary: "सुरक्षा सीमा (Boundary)",
    brandTitle: "औद्योगिक एआई नियंत्रण प्रणाली",
    localOnly: "केवल स्थानीय",
    offline: "ऑफ़लाइन",
    airGappedBadge: "0 B बहिर्गमन · एयर-गैप्ड",
    personaLabel: "भूमिका (Persona):",
    clearanceOverride: "सुरक्षा स्तर अधिरोहण:",
    clearanceLabel: "सुरक्षा स्तर:",
    roleLabel: "भूमिका:",
    selectPersonaTitle: "उपयोगकर्ता भूमिका चुनें",
    rbacEnforcedBadge: "आरबीएसी लागू",
    selectPersonaDesc: "भूमिका बदलने से आपकी संयंत्र अनुमतियां, टूल सीमाएं और जांच अधिकार तुरंत अद्यतन होते हैं।",
    roleEngineer: "अभियंता (ENGINEER)",
    roleInspector: "निरीक्षक (INSPECTOR)",
    roleAiOperator: "एआई ऑपरेटर (AI OPERATOR)",
    roleAdmin: "प्रशासक (ADMIN)",
    roleSecurityOfficer: "सुरक्षा अधिकारी (SECURITY OFFICER)",
    roleSummaryEngineer: "संयंत्र डेटा व एसओपी पढ़ें, जांच चलाएं, केवल-पठन उपकरण। महत्वपूर्ण क्रियान्वयन हेतु अनुमोदन अनिवार्य। व्यवस्थापक कार्य अवरुद्ध।",
    roleSummaryInspector: "निरीक्षण व टेलीमेट्री डेटा पढ़ें, जांच चलाएं। भौतिक क्रियान्वयन अवरुद्ध। व्यवस्थापक कार्य अवरुद्ध।",
    roleSummaryAiOperator: "स्वीकृत पठन व जांच पहुंच। शून्य लेखन अधिकार। क्रियान्वयन अवरुद्ध। व्यवस्थापक कार्य अवरुद्ध।",
    roleSummaryAdmin: "व्यापक पहुंच। महत्वपूर्ण कार्यों हेतु अनुमोदन आवश्यक। प्रशासनिक नियंत्रण उपलब्ध।",
    roleSummarySecurityOfficer: "लेखापरीक्षा व सुरक्षा दृश्यता। संयंत्र क्रियान्वयन अवरुद्ध। प्रशासनिक अधिरोहण अवरुद्ध।",
    verified: "सत्यापित (VERIFIED)",
    needsReview: "समीक्षा आवश्यक (REVIEW REQUIRED)",
    deniedByPolicy: "नीति द्वारा अस्वीकृत (DENIED BY POLICY)",
    quarantined: "क्वारंटीन किया गया (QUARANTINED)",
    offlineFallbackBadge: "ऑफ़लाइन समाधान",
    insufficientEvidence: "अपर्याप्त साक्ष्य (INSUFFICIENT EVIDENCE)",
    actionBlocked: "कार्रवाई अवरुद्ध (ACTION BLOCKED)",
    failed: "विफल (FAILED)",
    heroTitle: "औद्योगिक एआई जो प्रस्ताव देता है। निर्णय आप करते हैं।",
    heroSubtitle: "FORGE निजी संयंत्र दस्तावेज़ों पर पूर्णतः स्थानीय, संप्रभु तर्क निष्पादित करता है। नीति अधिकार तय करती है, बहु-स्रोत साक्ष्य प्रत्येक प्रस्ताव का समर्थन करते हैं, और निर्णायक कोड कार्रवाई से पहले गणित का सत्यापन करता है।",
    startMissionBtn: "अभियान शुरू करें",
    inspectTelemetryBtn: "टेलीमेट्री का निरीक्षण करें",
    baselineMetric: "सामान्य आधार रेखा",
    deviationMetric: "देखा गया विचलन",
    distanceToAlarmMetric: "अलार्म तक का अंतर",
    baselineSubtext: "एसओपी §3.2 मानक",
    deviationSubtext: "PI-204 रीडिंग",
    alarmSubtext: "33.5 पर अलार्म",
    dialLabel: "रिएक्टर R-204 · टेलीमेट्री रीडिंग",
    missionViewsLabel: "अभियान दृश्य:",
    tabOverview: "अभियान अवलोकन",
    tabWorkspace: "एआई प्रस्ताव व कार्रवाई",
    tabEvidence: "समर्थक साक्ष्य",
    tabVerification: "यह विश्वसनीय क्यों है? (7 जांचें)",
    caseBadge: "अभियान मामला · R-204-REV4",
    facilityUnit: "हाइड्रोक्रैकर लूप · सुविधा इकाई 4",
    caseTitle: "रिएक्टर R-204 दबाव विचलन जांच",
    caseDescription: "परिचालन दबाव टेलीमेट्री, अल्ट्रासोनिक शेल दीवार निरीक्षण और संयंत्र परिचालन प्रक्रियाओं का स्वायत्त औद्योगिक विश्लेषण। सभी तर्क संप्रभु हैं, टूल क्रियान्वयन नीति द्वारा नियंत्रित है, और परिणाम गणितीय रूप से सत्यापित हैं।",
    openWorkspaceBtn: "एआई कार्यक्षेत्र खोलें →",
    primaryParamsHeader: "प्राथमिक परिचालन पैरामीटर · रिएक्टर R-204",
    telemetryPoint: "टेलीमेट्री बिंदु: PI-204",
    currentCondition: "वर्तमान स्थिति",
    currentConditionSubtext: "एनालॉग गेज PI-204",
    observedDeviation: "देखा गया विचलन",
    aboveNominalLimit: "मानक सीमा से अधिक",
    highAlarmLimit: "उच्च अलार्म सीमा",
    marginRemaining: "मार्जिन: 0.5 bar शेष",
    tripThreshold: "ट्रिप सीमा",
    safetyInterlockShutdown: "सुरक्षा इंटरलॉक शटडाउन",
    multiSourceDossierTitle: "01 · साक्ष्य डोजियर",
    multiSourceCorroboration: "बहु-स्रोत पुष्टि",
    multiSourceDesc: "स्वायत्त एजेंट निजी संयंत्र दस्तावेजों, ऐतिहासिक निरीक्षण रिपोर्टों, वास्तविक समय सेंसर रीडिंग और विजुअल गेज निरीक्षण को एक सत्यापन योग्य डोजियर में जोड़ता है।",
    verificationSpineTitle: "02 · सत्यापन रीढ़",
    nonLlmVerificationSpine: "गैर-एलएलएम सत्यापन रीढ़",
    verificationSpineDesc: "मॉडल कभी भी अपने काम का मूल्यांकन स्वयं नहीं करता है। निर्धारक पायथन इंजन गणितीय गणनाओं, अंतर-स्रोत स्थिरता और सीमा प्रतिबंधों का स्वतंत्र रूप से सत्यापन करते हैं।",
    controlsBoundariesTitle: "03 · नियंत्रण व सीमाएं",
    defaultDenyPolicyGateway: "डिफ़ॉल्ट-अस्वीकार नीति गेटवे",
    controlsBoundariesDesc: "निष्पादन सैंडबॉक्स आरबीएसी नियमों के विरुद्ध प्रत्येक क्रियान्वयन अनुरोध को रोकता है। अनधिकृत संचालन अपरिवर्तनीय ऑडिट इवेंट्स के साथ तुरंत रोक दिए जाते हैं।",
    evidenceHeaderTitle: "समर्थक साक्ष्य डोजियर",
    evidenceHeaderDesc: "एआई प्रस्ताव का प्रत्येक दावा ऑडिट योग्य संयंत्र अभिलेखों, सेंसर रीडिंग और निर्धारक सूत्रों द्वारा समर्थित है।",
    runWorkspaceQueryBtn: "कार्यक्षेत्र में जांच चलाएं →",
    verificationHeaderTitle: "निर्धारक सत्यापन प्रमाण",
    verificationHeaderDesc: "भ्रम और गलतियों को रोकने के लिए मॉडल निर्माण के बाद सात स्वतंत्र पायथन सत्यापन जांचें निष्पादित की जाती हैं।",
    executeInWorkspaceBtn: "कार्यक्षेत्र में प्रस्ताव निष्पादित करें →",
    scenariosTitle: "चार दोहराने योग्य औद्योगिक मिशन",
    caseLabel: "मामला",
    expectedLabel: "अपेक्षित निर्णय",
    runBtn: "मिशन चलाएं",
    runningBtn: "मिशन चल रहा है...",
    sc1Title: "मामला 01 · मानक R-204 जांच",
    sc1Badge: "स्वायत्त विश्लेषण",
    sc1Desc: "सामान्य परिस्थितियों में एसओपी परिचालन सीमाओं, अल्ट्रासोनिक निरीक्षण रिपोर्टों और लाइव टेलीमेट्री का पूर्ण विश्लेषण।",
    sc2Title: "मामला 02 · दबाव गेज विचलन",
    sc2Badge: "दृष्टि + सत्यापन",
    sc2Desc: "एनालॉग गेज PI-204 डायल छवि का बहु-मॉडल निरीक्षण। बेसलाइन से +1.8 bar विचलन का पता लगाता है, समीक्षा आवश्यक करता है।",
    sc3Title: "मामला 03 · अनधिकृत क्रियान्वयन प्रयास",
    sc3Badge: "नीति अवरोधन",
    sc3Desc: "ऑपरेटर रिलीफ वाल्व PSV-204 के भौतिक अंशांकन का अनुरोध करता है। नीति गेटवे द्वारा रोका गया (ACTION_BLOCKED)।",
    sc4Title: "मामला 04 · प्रतिकूल इंजेक्शन बुलेटिन",
    sc4Badge: "सुरक्षा क्वारंटीन",
    sc4Desc: "सिस्टम ओवरराइड इंजेक्शन युक्त अविश्वसनीय रखरखाव बुलेटिन। शून्य टूल निष्पादन के साथ क्वारंटीन किया गया।",
    investigationConsoleTitle: "स्वायत्त औद्योगिक जांच कंसोल",
    sovereignReasoningBadge: "संप्रभु स्थानीय तर्क",
    activeContextLabel: "सक्रिय संयंत्र संपत्ति:",
    imageContextLabel: "दृश्य टेलीमेट्री संदर्भ:",
    uploadImageBtn: "संयंत्र गेज / निरीक्षण फोटो अपलोड करें",
    analyzeImageOnlyBtn: "केवल छवि का विश्लेषण करें (VLM)",
    executeInvestigation: "संप्रभु जांच निष्पादित करें",
    executingInvestigation: "संप्रभु तर्क इंजन निष्पादित हो रहा है...",
    customQueryPlaceholder: "औद्योगिक पूछताछ या टेलीमेट्री विश्लेषण दर्ज करें...",
    downloadApprovalNote: "औपचारिक MRPL अनुमोदन नोट डाउनलोड करें (.docx)",
    generatingDocument: "दस्तावेज़ तैयार किया जा रहा है...",
    equipmentTag: "उपकरण टैग: R-204",
    operationalStatus: "परिचालन स्थिति: उच्च दबाव परामर्श",
    verificationVerdict: "निर्धारक सत्यापन निर्णय:",
    questionR204Review: "क्या रिएक्टर R-204 को इंजीनियरिंग समीक्षा की आवश्यकता है?",
    findingPressureHigh: "निष्कर्ष: दबाव बढ़ा हुआ है (सामान्य से +1.8 bar अधिक)। यह ट्रिप नहीं हुआ है, लेकिन अलार्म से केवल 0.5 bar दूर है।",
    recommendationReview: "सिफारिश: अगली पाली से पहले इंजीनियरिंग समीक्षा आवश्यक है।",
    offlineResolvedTitle: "स्वायत्त संप्रभु समाधान (ऑफ़लाइन मोड)",
    offlineResolvedDesc: "स्थानीय निर्धारक नियम इंजन द्वारा हल किया गया। शून्य बाहरी क्लाउड कनेक्टिविटी की आवश्यकता।",
    metricCurrentCondition: "वर्तमान स्थिति",
    metricNormalBaseline: "सामान्य आधार रेखा",
    metricDeviation: "विचलन",
    metricHighAlarm: "उच्च अलार्म",
    metricAboveNormal: "सामान्य से अधिक",
    metricMarginLeft: "मार्जिन शेष",
    pressureInstrumentLabel: "दबाव उपकरण PI-204 · पैमाना और ट्रिप सीमाएं",
    observedSuffix: "अवलोकित",
    normalSuffix: "सामान्य",
    alarmSuffix: "अलार्म",
    tripSuffix: "ट्रिप",
    whatSupportsTitle: "इस उत्तर का क्या समर्थन करता है?",
    verifiedSourcesCount: "4 सत्यापित स्रोत",
    sourceSopLabel: "परिचालन एसओपी §3.2",
    sourceSopVal: "31.2 bar मानक बेसलाइन और 33.5 bar अलार्म सीमा निर्दिष्ट करता है।",
    sourceGaugeLabel: "एनालॉग गेज PI-204",
    sourceGaugeVal: "गेज सुई का दृश्य निरीक्षण 33.0 bar स्थिर अवस्था का संकेत देता है।",
    sourceCalcLabel: "निर्धारक गणित",
    sourceCalcVal: "पायथन गणना सत्यापन: 33.0 - 31.2 = +1.8 bar विचलन।",
    whyTrustTitle: "आपको इस उत्तर पर भरोसा क्यों करना चाहिए?",
    checksPassedCount: "7 में से 7 जांचें उत्तीर्ण",
    checkTraceable: "स्रोत सत्यापन योग्य",
    checkEvidenceComplete: "साक्ष्य पूर्ण",
    checkWithinPolicy: "नीति नियमों के तहत",
    checkWithinAccess: "आपकी पहुंच के भीतर",
    checkValuesAgree: "मूल्यों में सहमति",
    checkMath: "गणित स्वतंत्र रूप से जांचा गया",
    passBadge: "उत्तीर्ण",
    checkedByPythonNotice: "पायथन कोड द्वारा जांचा गया, एआई मॉडल द्वारा नहीं।",
    deepInspectionLabel: "गहन निरीक्षण डोजियर",
    tabDeepSummary: "सारांश",
    tabDeepTimeline: "समयरेखा",
    tabDeepEvidence: "साक्ष्य (4)",
    tabDeepChecks: "जांचें (7)",
    tabDeepVision: "दृष्टि (Vision)",
    case03BannerTitle: "कार्रवाई अवरुद्ध · नीति गेटवे द्वारा क्रियान्वयन रोका गया",
    case03BannerDesc: "एजेंट ने भौतिक अंशांकन उपकरण को लागू करने का प्रयास किया, लेकिन FORGE ने निष्पादन से पहले कार्रवाई को रोक दिया।",
    case03Step1: "1. अनुरोध प्राप्त",
    case03Step2: "2. नीति सत्यापन",
    case03Step3: "3. गेटवे अवरोधन",
    case03WhyBlocked: "अवरुद्ध करने का कारण: रिलीफ वाल्व अंशांकन हेतु व्यवस्थापक भूमिका और पर्यवेक्षक अनुमोदन अनिवार्य है। वर्तमान भूमिका (ENGINEER) में यह अधिकार नहीं है।",
    case03ToolExecution: "टूल निष्पादन: अवरुद्ध (0 बार निष्पादित)",
    case03ZeroHardware: "भौतिक सुरक्षा: संयंत्र हार्डवेयर को शून्य क्रियान्वयन भेजा गया।",
    case03GatewayVerdict: "गेटवे निर्णय: अस्वीकृत (नीति ID: POL-004-SAFETY)",
    case03AuditRecord: "ऑडिट रिकॉर्ड: अपरिवर्तनीय फोरेंसिक समयरेखा में दर्ज।",
    case04BannerTitle: "अविश्वसनीय इनपुट क्वारंटीन · सुरक्षा सीमा लागू",
    case04BannerDesc: "इनपुट दस्तावेज़ में सिस्टम निर्देशों को ओवरराइड करने और अनधिकृत उपकरण चलाने का प्रयास करने वाला प्रॉम्प्ट इंजेक्शन था।",
    case04SubDesc: "FORGE ने प्रतिकूल पैटर्न का पता लगाया, दुर्भावनापूर्ण सामग्री को अलग किया और सभी टूल निष्पादन को पूरी तरह रोक दिया।",
    case04Step1: "1. अविश्वसनीय इनपुट",
    case04Step2: "2. सीमा फ़िल्टर",
    case04Step3: "3. क्वारंटीन",
    case04PrivilegesGranted: "प्रदान किए गए विशेषाधिकार: शून्य",
    case04ZeroTools: "टूल निष्पादन: 0 उपकरण भेजे गए",
    case04BoundaryResult: "सीमा परिणाम: सैंडबॉक्स में क्वारंटीन",
    case04SafetyProof: "सुरक्षा प्रमाण: मॉडल के निर्देशों को बदला नहीं गया।",
    sovHeroBadge: "स्थानीय संप्रभु रनटाइम",
    sovHeroTitle: "आपका डेटा FORGE के भीतर सुरक्षित रहता है",
    sovHeroDesc: "सभी तर्क, संयंत्र ज्ञान, औद्योगिक उपकरण और सत्यापन केवल स्थानीय संप्रभु हार्डवेयर पर निष्पादित होते हैं। बाहरी एआई क्लाउड सेवाएं पूरी तरह से गैर-कॉन्फ़िगर और अगम्य हैं।",
    sovVerifyBtn: "रनटाइम स्थिति सत्यापित करें ↻",
    sovVerifyingBtn: "सत्यापन हो रहा है...",
    sovPillarsTitle: "पांच संप्रभु स्तंभ",
    sovPillarsSubtitle: "FORGE पूर्ण अलगाव की गारंटी कैसे देता है",
    sovViewDetailsBtn: "तकनीकी रनटाइम विवरण देखें ▼",
    sovHideDetailsBtn: "तकनीकी विवरण छिपाएं ▲",
    sovExtAiTitle: "बाहरी एआई प्रदाता",
    sovExtAiVal: "कोई कॉन्फ़िगर नहीं",
    sovExtAiSub: "शून्य क्लाउड एलएलएम एपीआई कॉल या एसडीके",
    sovCloudFallbackTitle: "क्लाउड फ़ॉलबैक",
    sovCloudFallbackVal: "अक्षम (Fail-Closed)",
    sovCloudFallbackSub: "सार्वजनिक सेवाओं पर कभी निर्भर नहीं करता",
    sovAdversarialTitle: "प्रतिकूल सुरक्षा सीमा प्रमाण",
    sovAdversarialSub: "सुरक्षा परीक्षण सत्यापित",
    sovPillarAiTitle: "स्थानीय एआई (Local AI)",
    sovPillarAiBadge: "स्थानीय स्तर पर तैयार",
    sovPillarAiDesc: "स्थानीय स्तर पर चलता है (qwen3:8b via OLLAMA)। कोई क्लाउड एआई नहीं, शून्य बाहरी एपीआई कॉल, शून्य क्लाउड एसडीके निर्भरता।",
    sovPillarKnowledgeTitle: "स्थानीय संयंत्र ज्ञान (Local Knowledge)",
    sovPillarKnowledgeBadge: "स्थानीय वेक्टर एन्क्लेव",
    sovPillarKnowledgeDesc: "निजी संयंत्र दस्तावेज़ स्थानीय रूप से अनुक्रमित हैं (Local Embeddings)। कोई क्लाउड वेक्टर डेटाबेस नहीं। भूमिका मंजूरी द्वारा कड़ाई से सीमित पहुंच।",
    sovPillarToolsTitle: "स्थानीय उपकरण (Local Tools)",
    sovPillarToolsBadge: "सीमित निष्पादन",
    sovPillarToolsDesc: "औद्योगिक क्रियान्वयन, स्काडा टेलीमेट्री प्रश्न और फ़ाइल संचालन स्थानीय सैंडबॉक्स में निष्पादित होते हैं। नीति गेटवे निष्पादन से पहले प्रत्येक कॉल को रोकता है।",
    sovPillarVerifTitle: "स्वतंत्र सत्यापन (Independent Verification)",
    sovPillarVerifBadge: "निर्धारक कोड जांच",
    sovPillarVerifDesc: "7 अलग-अलग सत्यापन जांचें शुद्ध पायथन कोड का उपयोग करके तथ्यों, इकाई सीमाओं और गणनाओं का मूल्यांकन करती हैं। एआई मॉडल को कभी भी अपने काम का मूल्यांकन करने की अनुमति नहीं दी जाती है।",
    sovPillarAuditTitle: "स्थानीय लेखापरीक्षण (Local Audit)",
    sovPillarAuditBadge: "केवल-जोड़ स्थानीय सिंक",
    sovPillarAuditDesc: "प्रत्येक प्रश्न, तर्क ट्रेस, टूल निष्पादन और सत्यापन जांच एक अपरिवर्तनीय स्थानीय फ़ाइल सिंक में लॉग की जाती है। डेटा कभी भी आपकी सुविधा से बाहर नहीं जाता है।",
    sovPillarEgressTitle: "नेटवर्क अलगाव (Network Isolation)",
    sovPillarEgressBadge: "0 B बाहरी · 100% पृथक",
    sovPillarEgressDesc: "होस्ट लूपबैक इंटरफ़ेस प्रवर्तन। सॉकेट ऑडिट साबित करता है कि कोई भी बाहरी बाइट या पैकेट स्थानीय सुविधा से बाहर नहीं जाता है। शून्य क्लाउड एआई एसडीके निर्भरता।",
    networkIsolationTitle: "होस्ट नेटवर्क बहिर्गमन नियंत्रण",
    networkIsolationDesc: "सिस्टम इग्रेस सॉकेट ऑडिट पुष्टि करता है कि शून्य आउटबाउंड नेटवर्क पैकेट बाहर जाते हैं।",
    zeroEgressBadge: "0 B बहिर्गमन · एयर-गैप्ड",
    knowledgeTitle: "संयंत्र ज्ञान प्रणाली (Knowledge Fabric)",
    knowledgeSubtitle: "भूमिका मंजूरी सीमाओं के साथ निजी संयंत्र प्रलेखन, परिचालन प्रक्रियाओं और निरीक्षण अभिलेखों की खोज करें।",
    knowledgeSearchPlaceholder: "एक प्रश्न पूछें, जैसे 'रिएक्टर R-204 के लिए ट्रिप सीमा क्या है?'...",
    searchKnowledgeBtn: "ज्ञान खोजें",
    searchingKnowledgeBtn: "खोज रहा है...",
    refreshRecordsBtn: "↻ अभिलेख ताज़ा करें",
    refreshingRecordsBtn: "ताज़ा हो रहा है...",
    askRecordsLabel: "संयंत्र अभिलेखों के बारे में प्रश्न पूछें",
    clearanceEnforcedLabel: "सुरक्षा स्तर लागू:",
    suggestedQueriesLabel: "सुझाए गए प्रश्न:",
    plantDocumentsHeader: "संयंत्र दस्तावेज़",
    assetLabel: "संपत्ति: रिएक्टर R-204",
    sizeLabel: "आकार:",
    refLabel: "संदर्भ:",
    reIndexBtn: "पुनः अनुक्रमित करें ↺",
    indexingBtn: "अनुक्रमित हो रहा है...",
    accessibleBadge: "✓ सुलभ (सत्यापित)",
    restrictedBadge: "🔒 प्रतिबंधित",
    humanAnswerTitle: "मानव-पठनीय उत्तर",
    humanAnswerSubtitle: "निजी संयंत्र अभिलेखों से संश्लेषित",
    primarySourceLabel: "प्राथमिक स्रोत:",
    onPremiseLocalDataProof: "✓ 100% स्थानीय डेटा",
    sourcePassagesHeader: "उत्तर और समर्थक अंश",
    matchScoreSuffix: "% मिलान",
    documentLabel: "दस्तावेज़:",
    chunkIdLabel: "हिस्सा (Chunk) ID:",
    readyToSearchTitle: "संयंत्र अभिलेख खोजने के लिए तैयार",
    readyToSearchDesc: "संप्रभु वेक्टर पुनर्प्राप्ति का निरीक्षण करने के लिए कोई परिचालन प्रश्न पूछें या ऊपर दिए गए सुझाव का चयन करें।",
    docSopTitle: "परिचालन एसओपी (Operating SOP)",
    docSopDesc: "परिचालन सीमाएं, सामान्य आधार रेखाएं और सुरक्षा सीमाएं।",
    docSopCat: "मानक प्रक्रिया",
    docInspectionTitle: "निरीक्षण रिपोर्ट (Inspection Report)",
    docInspectionDesc: "अल्ट्रासोनिक शेल मोटाई सर्वेक्षण और वेल्ड जोड़ डेटा।",
    docInspectionCat: "एनडीटी सर्वेक्षण",
    docEquipTitle: "उपकरण विनिर्देश (Equipment Spec)",
    docEquipDesc: "दबाव पोत R-204 डिज़ाइन लिफाफा और धातु विज्ञान।",
    docEquipCat: "पोत विनिर्देश",
    docMaintenanceTitle: "रखरखाव इतिहास (Maintenance History)",
    docMaintenanceDesc: "ओवरहाल लॉग और रिलीफ वाल्व अंशांकन रिकॉर्ड।",
    docMaintenanceCat: "संयंत्र इतिहास",
    docAdvisoryTitle: "प्रतिबंधित परामर्श बुलेटिन",
    docAdvisoryDesc: "अविश्वसनीय प्रॉम्प्ट इंजेक्शन युक्त क्वारंटीन नमूना।",
    docAdvisoryCat: "सुरक्षा परीक्षण नमूना",
    governanceTitle: "भूमिका-आधारित अधिकार और नीति गेटवे",
    governanceSubtitle: "FORGE में कौन क्या कर सकता है। प्रत्येक टूल कॉल और जांच को डिफ़ॉल्ट-अस्वीकार प्रवर्तन के साथ नीति गेटवे द्वारा नियंत्रित किया जाता है।",
    permissionMatrixTitle: "भूमिका अनुसार अनुमतियां",
    authorityLedgerBadge: "प्राधिकरण खाता",
    defaultDenyBadge: "डिफ़ॉल्ट-अस्वीकार लागू",
    securityPassBadge: "सुरक्षा परीक्षण: 10 / 10 उत्तीर्ण",
    activePersonaLabel: "वर्तमान सक्रिय भूमिका:",
    policyGatewayActive: "नीति गेटवे: सक्रिय और लागू",
    colRole: "भूमिका",
    colRead: "पठन (Read)",
    colInvestigate: "जांच (Investigate)",
    colActuate: "क्रियान्वयन (Actuate)",
    colAdmin: "व्यवस्थापक (Admin)",
    colSummary: "अनुमतियां सारांश",
    badgeAllowed: "✓ अनुमत",
    badgeApprovalRequired: "⚠ अनुमोदन आवश्यक",
    badgeBlocked: "✕ अवरुद्ध",
    youBadge: "आप",
    securityTestsBannerTitle: "सुरक्षा परीक्षण: 10 / 10 उत्तीर्ण",
    securityTestsBannerDesc: "निर्धारक सीमा परीक्षण सत्यापित करते हैं कि अविश्वसनीय इनपुट क्वारंटीन किए गए हैं और अनधिकृत क्रियाएं अवरुद्ध हैं।",
    viewPolicyDetailsBtn: "तकनीकी नीति विवरण देखें ▼",
    hidePolicyDetailsBtn: "तकनीकी विवरण छिपाएं ▲",
    auditTitle: "गतिविधि समयरेखा और फोरेंसिक रीढ़",
    auditSubtitle: "प्रत्येक ऑपरेटर क्वेरी, एजेंट तर्क चरण, नीति निर्णय, टूल निष्पादन और सत्यापन जांच एक अपरिवर्तनीय स्थानीय ऑडिट लॉग में दर्ज की जाती है।",
    auditTotalEvents: "कुल दर्ज की गई घटनाएं",
    auditBadgeActivity: "गतिविधि समयरेखा",
    auditBadgeAppendOnly: "स्थानीय केवल-जोड़ ऑडिट",
    refreshActivityBtn: "↻ गतिविधि ताज़ा करें",
    refreshingActivityBtn: "ताज़ा हो रहा है...",
    normalFlowTitle: "सामान्य जांच (अनुमत)",
    blockedFlowTitle: "अनधिकृत क्रियान्वयन (अवरुद्ध)",
    kpiTotalEvents: "कुल दर्ज की गई घटनाएं",
    kpiToolPolicy: "टूल व नीति निष्पादन",
    kpiStorageMode: "ऑडिट संग्रहण मोड",
    kpiOutsideAi: "बाहरी एआई सेवाएं",
    kpiSinkModeVal: "स्थानीय केवल-जोड़ सिंक",
    kpiSinkModeSub: "स्थानीय मेमोरी व फ़ाइल स्टोर",
    kpiNoneConfiguredVal: "कोई कॉन्फ़िगर नहीं",
    kpiNoneConfiguredSub: "केवल लूपबैक अनुमान",
    forensicSpineTitle: "फोरेंसिक रीढ़ (घटनाएं)",
    filterAll: "सभी",
    filterAgent: "एजेंट",
    filterKnowledge: "ज्ञान",
    filterPolicy: "नीति",
    filterTool: "उपकरण",
    filterVerification: "सत्यापन",
    inspectJsonBtn: "JSON निरीक्षण करें ▼",
    closeJsonBtn: "JSON बंद करें ▲",
    actorLabel: "कर्ता:",
    eventIdLabel: "घटना ID:",
    evtQuestionReceivedTitle: "ऑपरेटर से प्रश्न प्राप्त हुआ",
    evtQuestionReceivedDesc: "ऑपरेटर ने संप्रभु नियंत्रण कक्ष में औद्योगिक टेलीमेट्री या प्रक्रिया पूछताछ प्रस्तुत की।",
    evtKnowledgeConsultedTitle: "संयंत्र अभिलेखों से परामर्श लिया गया",
    evtKnowledgeConsultedDesc: "स्थानीय वेक्टर खोज ने सुरक्षा मंजूरी सीमाओं के भीतर निजी परिचालन प्रक्रियाओं को पुनः प्राप्त किया।",
    evtPolicyBlockedTitle: "अनुमति जांची गई → अवरुद्ध",
    evtPolicyBlockedDesc: "FORGE ने भूमिका अनुमतियों का सत्यापन किया और निष्पादन से पहले अनुरोधित कार्रवाई को अवरुद्ध कर दिया।",
    evtPolicyAllowedTitle: "अनुमति जांची गई → अनुमत",
    evtPolicyAllowedDesc: "संबद्ध भूमिका मंजूरी हेतु नीति नियमों के विरुद्ध कार्रवाई को मान्य किया गया।",
    evtToolBlockedTitle: "टूल निष्पादन अवरुद्ध",
    evtToolBlockedDesc: "नीति गेटवे ने टूल भेजने से रोक दिया। सैंडबॉक्स कोड निष्पादित: 0 बार।",
    evtToolExecutedTitle: "टूल अनुमत व निष्पादित",
    evtToolExecutedDesc: "सत्यापित तर्कों के साथ स्थानीय सैंडबॉक्स वातावरण में औद्योगिक उपकरण निष्पादित किया गया।",
    evtVerifiedTitle: "उत्तर स्वतंत्र रूप से सत्यापित",
    evtVerifiedDesc: "निर्धारक पायथन जांचों ने गणनाओं, स्थिरता और आधारभूत तथ्यों का मूल्यांकन किया।",
    evidenceDossierTitle: "साक्ष्य डोजियर",
    evidenceDossierSubtitle: "प्रत्येक दावा सत्यापन योग्य साक्ष्य से जुड़ा है: प्रलेखित संयंत्र प्रक्रियाएं, सैंडबॉक्स उपकरण, एनालॉग गेज, या निर्धारक गणित।",
    filterAllEvidence: "सभी साक्ष्य",
    filterProcedures: "संयंत्र प्रक्रियाएं",
    filterSensors: "सेंसर रीडिंग",
    filterGauges: "गेज व दृष्टि",
    filterMath: "स्वतंत्र गणित",
    modelDoesNotVerifyTitle: "मॉडल स्वयं को सत्यापित नहीं करता",
    independentCodeChecksBadge: "7 स्वतंत्र कोड जांचें",
    deterministicVerdictLabel: "निर्धारक सत्यापन निर्णय",
    assessmentSummaryLabel: "सत्यापन मूल्यांकन सारांश",
    footerReasoning: "तर्क मॉडल:",
    footerVision: "दृष्टि अंतर्ग्रहण:",
    footerPolicy: "सुरक्षा नीति:",
    footerOutsideAi: "बाहरी एआई सेवाएं:",
    footerNoneConfigured: "कोई कॉन्फ़िगर नहीं (एयर-गैप्ड)",
    footerDefaultDeny: "डिफ़ॉल्ट-अस्वीकार लागू",
    footerRuntimeDetails: "रनटाइम विवरण →",
    footerLive: "लाइव स्थानीय",
    footerDemoHarness: "डेमो ढांचा",
    footerFixture: "डेमो नमूना (सलाहकार)",
    traceTitle: "फोरेंसिक निष्पादन ट्रेस",
    traceLifecycle: "नियतात्मक जीवनचक्र",
    traceEventId: "इवेंट आईडी",
    tracePhase1Title: "परिचालन प्रश्न अंतर्ग्रहण",
    tracePhase1Badge: "अंतर्ग्रहीत",
    tracePhase2Title: "तर्क योजना निर्माण",
    traceActionLabel: "कार्रवाई",
    traceKnowledgeQueries: "ज्ञान प्रश्न",
    traceToolCalls: "टूल कॉल",
    traceCalculations: "गणनाएं",
    tracePhase3Title: "संप्रभु ज्ञान पुनर्प्राप्ति",
    traceChunksRetrieved: "खंड पुनर्प्राप्त किए गए",
    traceMatch: "मेल",
    tracePhase4Title: "नीति गेटवे मध्यस्थता एवं सैंडबॉक्स",
    traceEvaluations: "मूल्यांकन",
    traceRule: "नियम",
    traceExecutedTools: "निष्पादित सैंडबॉक्स उपकरण",
    tracePhase5Title: "इंजीनियरिंग विज़न अवलोकन",
    traceVisualRecords: "दृश्य रिकॉर्ड",
    tracePhase6Title: "स्वतंत्र नियतात्मक सत्यापन",
    tracePhase7Title: "सत्यापित केस ब्रीफिंग वितरित",
    traceOperatorPresentation: "ऑपरेटर प्रस्तुति",
    healthTitle: "संप्रभु नियंत्रण तल रनटाइम टेलीमेट्री",
    healthSubtitle: "संप्रभु प्रणाली स्वास्थ्य",
    healthLastSampled: "अंतिम नमूना",
    healthInitializing: "प्रारंभीकरण...",
    healthProbing: "रनटाइम जांच...",
    healthRunCheck: "स्वास्थ्य जांच चलाएं",
    healthBackendEngine: "बैकएंड इंजन",
    healthSovereigntyEnforcement: "संप्रभुता प्रवर्तन",
    healthSovereignRuntime: "संप्रभु रनटाइम",
    healthZeroCloudAllowed: "शून्य क्लाउड एआई एपीआई अनुमत",
    healthLocalInferenceBackend: "स्थानीय अनुमान बैकएंड",
    healthStatusOnline: "ऑनलाइन (पोर्ट 11434)",
    healthStatusOffline: "ऑफ़लाइन / स्टैंडबाय",
    healthReasoningModel: "तर्क मॉडल",
    healthVerifiedLocalGpu: "सत्यापित स्थानीय (RTX 4060 GPU)",
    healthConfiguredDefault: "कॉन्फ़िगर किया गया डिफ़ॉल्ट",
    navSovereignLocalRuntime: "संप्रभु स्थानीय रनटाइम",
    navBackendOffline: "बैकएंड ऑफ़लाइन",
    navLiveLocalInference: "लाइव स्थानीय अनुमान",
    navDeterministicDemoMode: "नियतात्मक डेमो मोड",
    caseAssetLabel: "उपकरण",
    casePersonaLabel: "व्यक्ति",
    caseClearanceLabel: "सुरक्षा मंजूरी",
    caseLoggedLabel: "दर्ज समय",
    subsystemActive: "सक्रिय",
    subsystemReady: "तैयार",
    subsystemStaged: "मंचस्थ",
    runtimeDetailsTitle: "संप्रभु रनटाइम विवरण",
    runtimeDetailsSubtitle: "प्रमाणित रनटाइम क्षमताएं एवं प्रीफ़्लाइट टेलीमेट्री",
    runtimeCloseBtn: "बंद करें",
    runtimeEndpointTitle: "अनुमान एंडपॉइंट",
    runtimeLoopbackVerified: "✓ लूपबैक सत्यापित — शून्य बाहरी निकास मार्ग",
    runtimeReasoningSubsystem: "तर्क उपप्रणाली",
    runtimeLiveResponding: "✓ लाइव स्थानीय मॉडल उत्तर दे रहा है",
    runtimeDemoHarnessDesc: "ℹ नियतात्मक डेमो हार्नेस (स्क्रिप्टेड योजना)",
    runtimeVisionSubsystem: "विज़न उपप्रणाली",
    runtimeVisionLive: "✓ मल्टीमॉडल विज़न स्थानीय रूप से लाइव",
    runtimeVisionFixture: "सलाहकारी डेमो फिक्सचर (ऑफ़लाइन सिंथेटिक चित्र)",
    runtimeEmbeddingsTitle: "एम्बेडिंग एवं वेक्टर खोज",
    runtimeOnPremiseOnly: "केवल ऑन-प्रेमिस",
    runtimeDependencyAudit: "निर्भरता ऑडिट",
    runtimeZeroCloudSdk: "✓ 0 क्लाउड एआई एसडीके लोड हैं",
    runtimeSdkForbidden: "स्टार्टअप पर स्कैन सत्यापित: OpenAI, Anthropic, Google GenAI कड़ाई से निषिद्ध",
    runtimeAuditIntegrity: "ऑडिट ट्रेल अखंडता",
    runtimeHashChained: "हैश-चेन्ड इवेंट स्टोर",
    runtimeAppendOnly: "स्थानीय केवल-जोड़ें इवेंट बस",
    runtimeTotalEvents: "दर्ज कुल घटनाएं",
    runtimeRefreshBtn: "प्रीफ़्लाइट टेलीमेट्री रीफ़्रेश करें",
    visionFilename: "फ़ाइल नाम",
    visionMime: "MIME प्रकार",
    visionSize: "आकार",
    visionConfidence: "विश्वास",
    visionObserved: "प्रेक्षित",
    visionSeverity: "गंभीरता",
  },
  kn: {
    navMissions: "ಕಾರ್ಯಾಚರಣೆಗಳು (Missions)",
    navKnowledge: "ಸ್ಥಾವರ ಜ್ಞಾನ (Knowledge)",
    navGovernance: "ನೀತಿ ಪಾಲನೆ (Governance)",
    navAudit: "ಲೆಕ್ಕಪರಿಶೋಧನೆ (Audit)",
    navBoundary: "ರಕ್ಷಣಾ ಗಡಿ (Boundary)",
    brandTitle: "ಕೈಗಾರಿಕಾ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ನಿಯಂತ್ರಣ ವ್ಯವಸ್ಥೆ",
    localOnly: "ಸ್ಥಳೀಯ ಮಾತ್ರ",
    offline: "ಆಫ್‌ಲೈನ್",
    airGappedBadge: "0 B ನಿರ್ಗಮನ · ಏರ್-ಗ್ಯಾಪ್ಡ್",
    personaLabel: "ಪಾತ್ರ (Persona):",
    clearanceOverride: "ಅನುಮತಿ ಹಂತ ಮೀರುವಿಕೆ:",
    clearanceLabel: "ಅನುಮತಿ ಹಂತ:",
    roleLabel: "ಪಾತ್ರ:",
    selectPersonaTitle: "ಬಳಕೆದಾರ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    rbacEnforcedBadge: "ಆರ್‌ಬಿಎಸಿ ಜಾರಿಯಲ್ಲಿದೆ",
    selectPersonaDesc: "ಪಾತ್ರಗಳನ್ನು ಬದಲಾಯಿಸುವುದರಿಂದ ನಿಮ್ಮ ಸ್ಥಾವರ ಅನುಮತಿಗಳು, ಉಪಕರಣ ಮಿತಿಗಳು ಮತ್ತು ತನಿಖಾ ಅಧಿಕಾರವು ತಕ್ಷಣವೇ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆ.",
    roleEngineer: "ಇಂಜಿನಿಯರ್ (ENGINEER)",
    roleInspector: "ಪರಿವೀಕ್ಷಕ (INSPECTOR)",
    roleAiOperator: "ಎಐ ನಿರ್ವಾಹಕ (AI OPERATOR)",
    roleAdmin: "ವ್ಯವಸ್ಥಾಪಕ (ADMIN)",
    roleSecurityOfficer: "ಭದ್ರತಾ ಅಧಿಕಾರಿ (SECURITY OFFICER)",
    roleSummaryEngineer: "ಸ್ಥಾವರ ಡೇಟಾ ಮತ್ತು ಎಸ್‌ಒಪಿಗಳನ್ನು ಓದಿ, ತನಿಖೆ ನಡೆಸಿ, ಓದಲು-ಮಾತ್ರ ಉಪಕರಣಗಳು. ನಿರ್ಣಾಯಕ ಕಾರ್ಯಾಚರಣೆಗೆ ಅನುಮೋದನೆ ಕಡ್ಡಾಯ. ಆಡಳಿತಾತ್ಮಕ ಕ್ರಿಯೆಗಳು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ.",
    roleSummaryInspector: "ತಪಾಸಣೆ ಮತ್ತು ಟೆಲಿಮೆಟ್ರಿ ಡೇಟಾವನ್ನು ಓದಿ, ತನಿಖೆ ನಡೆಸಿ. ಭೌತಿಕ ಕಾರ್ಯಾಚರಣೆ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಆಡಳಿತಾತ್ಮಕ ಕ್ರಿಯೆಗಳು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ.",
    roleSummaryAiOperator: "ಅನುಮೋದಿತ ಓದುವಿಕೆ ಮತ್ತು ತನಿಖಾ ಪ್ರವೇಶ. ಶೂನ್ಯ ಬರವಣಿಗೆ ಅಧಿಕಾರ. ಭೌತಿಕ ಕಾರ್ಯಾಚರಣೆ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಆಡಳಿತಾತ್ಮಕ ಕ್ರಿಯೆಗಳು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ.",
    roleSummaryAdmin: "ವ್ಯಾಪಕ ಪ್ರವೇಶ. ನಿರ್ಣಾಯಕ ಕ್ರಿಯೆಗಳಿಗೆ ಸೂಕ್ತ ಅನುಮೋದನೆ ಅಗತ್ಯವಿದೆ. ಆಡಳಿತಾತ್ಮಕ ನಿಯಂತ್ರಣಗಳು ಲಭ್ಯವಿವೆ.",
    roleSummarySecurityOfficer: "ಲೆಕ್ಕಪರಿಶೋಧನೆ ಮತ್ತು ಭದ್ರತಾ ಗೋಚರತೆ. ಸ್ಥಾವರ ಕಾರ್ಯಾಚರಣೆ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಆಡಳಿತಾತ್ಮಕ ಅತಿಕ್ರಮಣ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ.",
    verified: "ದೃಢೀಕರಿಸಲಾಗಿದೆ (VERIFIED)",
    needsReview: "ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ (REVIEW REQUIRED)",
    deniedByPolicy: "ನೀತಿಯಿಂದ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ (DENIED BY POLICY)",
    quarantined: "ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ (QUARANTINED)",
    offlineFallbackBadge: "ಆಫ್‌ಲೈನ್ ಪರಿಹಾರ",
    insufficientEvidence: "ಅಪೂರ್ಣ ಪುರಾವೆ (INSUFFICIENT EVIDENCE)",
    actionBlocked: "ಕ್ರಮ ತಡೆಹಿಡಿಯಲಾಗಿದೆ (ACTION BLOCKED)",
    failed: "ವಿಫಲವಾಗಿದೆ (FAILED)",
    heroTitle: "ಪ್ರಸ್ತಾಪಿಸುವ ಕೈಗಾರಿಕಾ ಎಐ. ನಿರ್ಧಾರ ನಿಮ್ಮದೇ.",
    heroSubtitle: "FORGE ಖಾಸಗಿ ಸ್ಥಾವರ ದಾಖಲಾತಿಗಳ ಆಧಾರದ ಮೇಲೆ ಸಂಪೂರ್ಣ ಸ್ಥಳೀಯ, ಸಾರ್ವಭೌಮ ತಾರ್ಕಿಕತೆಯನ್ನು ನಿರ್ವಹಿಸುತ್ತದೆ. ನೀತಿಯು ಅಧಿಕಾರವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ, ಬಹು-ಮೂಲ ಪುರಾವೆಗಳು ಪ್ರತಿಯೊಂದು ಪ್ರಸ್ತಾಪವನ್ನು ಬೆಂಬಲಿಸುತ್ತವೆ ಮತ್ತು ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ಗಣಿತವನ್ನು ನಿಖರವಾದ ಕೋಡ್ ಪರಿಶೀಲಿಸುತ್ತದೆ.",
    startMissionBtn: "ಕಾರ್ಯಾಚರಣೆ ಪ್ರಾರಂಭಿಸಿ",
    inspectTelemetryBtn: "ಟೆಲಿಮೆಟ್ರಿ ಪರಿಶೀಲಿಸಿ",
    baselineMetric: "ಸಾಮಾನ್ಯ ಆಧಾರರೇಖೆ",
    deviationMetric: "ಕಂಡುಬಂದ ವ್ಯತ್ಯಾಸ",
    distanceToAlarmMetric: "ಎಚ್ಚರಿಕೆಯ ಮಿತಿಯ ಅಂತರ",
    baselineSubtext: "ಎಸ್‌ಒಪಿ §3.2 ಮಾನದಂಡ",
    deviationSubtext: "PI-204 ಮಾಪನ",
    alarmSubtext: "33.5 ರಲ್ಲಿ ಎಚ್ಚರಿಕೆ",
    dialLabel: "ರಿಯಾಕ್ಟರ್ R-204 · ಟೆಲಿಮೆಟ್ರಿ ಮಾಪನ",
    missionViewsLabel: "ಕಾರ್ಯಾಚರಣಾ ವೀಕ್ಷಣೆಗಳು:",
    tabOverview: "ಅವಲೋಕನ",
    tabWorkspace: "ಎಐ ಪ್ರಸ್ತಾಪ ಮತ್ತು ಕ್ರಮಗಳು",
    tabEvidence: "ಬೆಂಬಲಿತ ಪುರಾವೆಗಳು",
    tabVerification: "ಇದನ್ನು ಏಕೆ ನಂಬಬೇಕು? (7 ಪರಿಶೀಲನೆಗಳು)",
    caseBadge: "ಕಾರ್ಯಾಚರಣಾ ಪ್ರಕರಣ · R-204-REV4",
    facilityUnit: "ಹೈಡ್ರೋಕ್ರ್ಯಾಕರ್ ಲೂಪ್ · ಘಟಕ 4",
    caseTitle: "ರಿಯಾಕ್ಟರ್ R-204 ಒತ್ತಡ ವ್ಯತ್ಯಾಸ ತನಿಖೆ",
    caseDescription: "ಕಾರ್ಯಾಚರಣಾ ಒತ್ತಡ ಟೆಲಿಮೆಟ್ರಿ, ಅಲ್ಟ್ರಾಸಾನಿಕ್ ಶೆಲ್ ತಪಾಸಣೆ ಮತ್ತು ಸ್ಥಾವರ ಕಾರ್ಯವಿಧಾನಗಳನ್ನು ಸಂಯೋಜಿಸುವ ಸ್ವಾಯತ್ತ ಕೈಗಾರಿಕಾ ತನಿಖೆ. ಎಲ್ಲಾ ತರ್ಕಗಳು ಸಾರ್ವಭೌಮವಾಗಿವೆ, ಉಪಕರಣಗಳ ಬಳಕೆ ನೀತಿ ನಿಯಂತ್ರಿತವಾಗಿದೆ ಮತ್ತು ತೀರ್ಮಾನಗಳು ಗಣಿತೀಯವಾಗಿ ಸಾಬೀತಾಗಿವೆ.",
    openWorkspaceBtn: "ಎಐ ಕಾರ್ಯಕ್ಷೇತ್ರ ತೆರೆಯಿರಿ →",
    primaryParamsHeader: "ಪ್ರಾಥಮಿಕ ಕಾರ್ಯಾಚರಣಾ ನಿಯತಾಂಕಗಳು · ರಿಯಾಕ್ಟರ್ R-204",
    telemetryPoint: "ಟೆಲಿಮೆಟ್ರಿ ಬಿಂದು: PI-204",
    currentCondition: "ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ",
    currentConditionSubtext: "ಅನಲಾಗ್ ಗೇಜ್ PI-204",
    observedDeviation: "ಕಂಡುಬಂದ ವ್ಯತ್ಯಾಸ",
    aboveNominalLimit: "ಸಾಮಾನ್ಯ ಮಿತಿಗಿಂತ ಹೆಚ್ಚು",
    highAlarmLimit: "ಹೆಚ್ಚಿನ ಎಚ್ಚರಿಕೆಯ ಮಿತಿ",
    marginRemaining: "ಉಳಿದ ಅಂತರ: 0.5 bar",
    tripThreshold: "ಸ್ವಯಂ ಸ್ಥಗಿತ ಮಿತಿ (Trip)",
    safetyInterlockShutdown: "ಸುರಕ್ಷತಾ ಇಂಟರ್‌ಲಾಕ್ ಸ್ಥಗಿತ",
    multiSourceDossierTitle: "01 · ಪುರಾವೆಗಳ ಕಡತ",
    multiSourceCorroboration: "ಬಹು-ಮೂಲ ದೃಢೀಕರಣ",
    multiSourceDesc: "ಸ್ವಾಯತ್ತ ಏಜೆಂಟ್ ಖಾಸಗಿ ಸ್ಥಾವರ ದಾಖಲೆಗಳು, ಐತಿಹಾಸಿಕ ತಪಾಸಣಾ ವರದಿಗಳು, ನೈಜ ಸಮಯದ ಸಂವೇದಕ ರೀಡಿಂಗ್‌ಗಳು ಮತ್ತು ಗೇಜ್ ತಪಾಸಣೆಯನ್ನು ಒಟ್ಟುಗೂಡಿಸಿ ಪರಿಶೀಲಿಸಬಹುದಾದ ದಾಖಲೆಯನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತದೆ.",
    verificationSpineTitle: "02 · ಪರಿಶೀಲನಾ ವ್ಯವಸ್ಥೆ",
    nonLlmVerificationSpine: "ಎಲ್ಎಲ್ಎಂ-ಯೇತರ ಪರಿಶೀಲನಾ ಬೆನ್ನೆಲುಬು",
    verificationSpineDesc: "ಮಾದರಿಯು ತನ್ನದೇ ಆದ ಕೆಲಸವನ್ನು ಎಂದಿಗೂ ಸ್ವತಃ ಶ್ರೇಣೀಕರಿಸುವುದಿಲ್ಲ. ನಿರ್ಣಾಯಕ ಪೈಥಾನ್ ಎಂಜಿನ್‌ಗಳು ಗಣಿತದ ಲೆಕ್ಕಾಚಾರಗಳು, ಮೂಲಗಳ ನಡುವಿನ ಸ್ಥಿರತೆ ಮತ್ತು ಗಡಿ ನಿರ್ಬಂಧಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಪರಿಶೀಲಿಸುತ್ತವೆ.",
    controlsBoundariesTitle: "03 · ನಿಯಂತ್ರಣಗಳು ಮತ್ತು ಗಡಿಗಳು",
    defaultDenyPolicyGateway: "ಪೂರ್ವನಿಯೋಜಿತ-ನಿರಾಕರಣೆ ನೀತಿ ಗೇಟ್‌ವೇ",
    controlsBoundariesDesc: "ಆರ್‌ಬಿಎಸಿ ನಿಯಮಗಳ ವಿರುದ್ಧ ಪ್ರತಿಯೊಂದು ಭೌತಿಕ ಕಾರ್ಯಾಚರಣೆಯ ವಿನಂತಿಯನ್ನು ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್ ತಡೆಹಿಡಿಯುತ್ತದೆ. ಅನಧಿಕೃತ ಕಾರ್ಯಾಚರಣೆಗಳನ್ನು ಬದಲಾಯಿಸಲಾಗದ ಆಡಿಟ್ ಲಾಗ್‌ಗಳೊಂದಿಗೆ ತಕ್ಷಣವೇ ನಿಲ್ಲಿಸಲಾಗುತ್ತದೆ.",
    evidenceHeaderTitle: "ಬೆಂಬಲಿತ ಪುರಾವೆಗಳ ಕಡತ",
    evidenceHeaderDesc: "ಎಐ ಪ್ರಸ್ತಾಪದಲ್ಲಿರುವ ಪ್ರತಿಯೊಂದು ಹಕ್ಕನ್ನು ಪರಿಶೀಲಿಸಬಹುದಾದ ಸ್ಥಾವರ ದಾಖಲೆಗಳು, ಸಂವೇದಕ ರೀಡಿಂಗ್‌ಗಳು ಮತ್ತು ಗಣಿತ ಸೂತ್ರಗಳು ಬೆಂಬಲಿಸುತ್ತವೆ.",
    runWorkspaceQueryBtn: "ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ತನಿಖೆ ನಡೆಸಿ →",
    verificationHeaderTitle: "ನಿರ್ಣಾಯಕ ಪರಿಶೀಲನಾ ಪುರಾವೆಗಳು",
    verificationHeaderDesc: "ತಪ್ಪು ಕಲ್ಪನೆಗಳನ್ನು ತಡೆಗಟ್ಟಲು ಭಾಷಾ ಮಾದರಿಯ ನಂತರ ಏಳು ಸ್ವತಂತ್ರ ಪೈಥಾನ್ ಕೋಡ್ ಪರಿಶೀಲನೆಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗುತ್ತದೆ.",
    executeInWorkspaceBtn: "ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಪ್ರಸ್ತಾಪವನ್ನು ಚಲಾಯಿಸಿ →",
    scenariosTitle: "ನಾಲ್ಕು ಪುನರಾವರ್ತನೀಯ ಕೈಗಾರಿಕಾ ಕಾರ್ಯಾಚರಣೆಗಳು",
    caseLabel: "ಪ್ರಕರಣ",
    expectedLabel: "ನಿರೀಕ್ಷಿತ ತೀರ್ಪು",
    runBtn: "ಕಾರ್ಯಾಚರಣೆ ನಡೆಸಿ",
    runningBtn: "ಕಾರ್ಯಾಚರಣೆ ನಡೆಯುತ್ತಿದೆ...",
    sc1Title: "ಪ್ರಕರಣ 01 · ಸಾಮಾನ್ಯ R-204 ತನಿಖೆ",
    sc1Badge: "ಸ್ವಾಯತ್ತ ವಿಶ್ಲೇಷಣೆ",
    sc1Desc: "ಸಾಮಾನ್ಯ ಸ್ಥಿತಿಯಲ್ಲಿ ಎಸ್‌ಒಪಿ ಕಾರ್ಯಾಚರಣಾ ಮಿತಿಗಳು, ಅಲ್ಟ್ರಾಸಾನಿಕ್ ತಪಾಸಣಾ ವರದಿಗಳು ಮತ್ತು ಲೈವ್ ಟೆಲಿಮೆಟ್ರಿಯ ಸಂಪೂರ್ಣ ವಿಶ್ಲೇಷಣೆ.",
    sc2Title: "ಪ್ರಕರಣ 02 · ಒತ್ತಡ ಗೇಜ್ ವ್ಯತ್ಯಾಸ",
    sc2Badge: "ದೃಷ್ಟಿ + ಪರಿಶೀಲನೆ",
    sc2Desc: "ಅನಲಾಗ್ ಗೇಜ್ PI-204 ಡಯಲ್ ಚಿತ್ರದ ಬಹು-ಮಾದರಿ ತಪಾಸಣೆ. ಆಧಾರರೇಖೆಗಿಂತ +1.8 bar ವ್ಯತ್ಯಾಸವನ್ನು ಪತ್ತೆಹಚ್ಚಿ ಪರಿಶೀಲನೆ ಅಗತ್ಯಗೊಳಿಸುತ್ತದೆ.",
    sc3Title: "ಪ್ರಕರಣ 03 · ಅನಧಿಕೃತ ಕಾರ್ಯಾಚರಣಾ ಯತ್ನ",
    sc3Badge: "ನೀತಿ ಪ್ರತಿಬಂಧಕ",
    sc3Desc: "ಆಪರೇಟರ್ ರಿಲೀಫ್ ವಾಲ್ವ್ PSV-204 ನ ಭೌತಿಕ ಮಾಪನಾಂಕ ನಿರ್ಣಯವನ್ನು ಕೋರುತ್ತಾನೆ. ನೀತಿ ಗೇಟ್‌ವೇ ಮೂಲಕ ತಡೆಹಿಡಿಯಲಾಗಿದೆ (ACTION_BLOCKED).",
    sc4Title: "ಪ್ರಕರಣ 04 · ದುರುದ್ದೇಶಪೂರಿತ ಇಂಜೆಕ್ಷನ್ ಬುಲೆಟಿನ್",
    sc4Badge: "ಭದ್ರತಾ ಕ್ವಾರಂಟೈನ್",
    sc4Desc: "ವ್ಯವಸ್ಥೆಯನ್ನು ಅತಿಕ್ರಮಿಸುವ ಪ್ರಾಂಪ್ಟ್ ಇಂಜೆಕ್ಷನ್ ಹೊಂದಿರುವ ಅವಿಶ್ವಾಸಾರ್ಹ ನಿರ್ವಹಣಾ ಬುಲೆಟಿನ್. ಶೂನ್ಯ ಉಪಕರಣ ಬಳಕೆಯೊಂದಿಗೆ ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ.",
    investigationConsoleTitle: "ಸ್ವಾಯತ್ತ ಕೈಗಾರಿಕಾ ತನಿಖಾ ಕನ್ಸೋಲ್",
    sovereignReasoningBadge: "ಸಾರ್ವಭೌಮ ಸ್ಥಳೀಯ ತಾರ್ಕಿಕತೆ",
    activeContextLabel: "ಸಕ್ರಿಯ ಸ್ಥಾವರ ಆಸ್ತಿ:",
    imageContextLabel: "ದೃಶ್ಯ ಟೆಲಿಮೆಟ್ರಿ ಸಂದರ್ಭ:",
    uploadImageBtn: "ಸ್ಥಾವರ ಗೇಜ್ / ತಪಾಸಣಾ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    analyzeImageOnlyBtn: "ಚಿತ್ರವನ್ನು ಮಾತ್ರ ವಿಶ್ಲೇಷಿಸಿ (VLM)",
    executeInvestigation: "ಸಾರ್ವಭೌಮ ತನಿಖೆ ನಡೆಸಿ",
    executingInvestigation: "ಸಾರ್ವಭೌಮ ತಾರ್ಕಿಕ ಎಂಜಿನ್ ಚಾಲನೆಯಲ್ಲಿದೆ...",
    customQueryPlaceholder: "ಕೈಗಾರಿಕಾ ವಿಚಾರಣೆ ಅಥವಾ ಟೆಲಿಮೆಟ್ರಿ ವಿಶ್ಲೇಷಣಾ ವಿನಂತಿಯನ್ನು ನಮೂದಿಸಿ...",
    downloadApprovalNote: "ಅಧಿಕೃತ MRPL ಅನುಮೋದನಾ ಟಿಪ್ಪಣಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (.docx)",
    generatingDocument: "ದಾಖಲೆ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...",
    equipmentTag: "ಉಪಕರಣ ಟ್ಯಾಗ್: R-204",
    operationalStatus: "ಕಾರ್ಯಾಚರಣಾ ಸ್ಥಿತಿ: ಅಧಿಕ ಒತ್ತಡದ ಎಚ್ಚರಿಕೆ",
    verificationVerdict: "ನಿರ್ಣಾಯಕ ಪರಿಶೀಲನಾ ತೀರ್ಪು:",
    questionR204Review: "ರಿಯಾಕ್ಟರ್ R-204 ಗೆ ಇಂಜಿನಿಯರಿಂಗ್ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆಯೇ?",
    findingPressureHigh: "ಶೋಧನೆ: ಒತ್ತಡವು ಹೆಚ್ಚಾಗಿದೆ (ಸಾಮಾನ್ಯಕ್ಕಿಂತ +1.8 bar ಹೆಚ್ಚು). ಇದು ಟ್ರಿಪ್ ಆಗಿಲ್ಲ, ಆದರೆ ಎಚ್ಚರಿಕೆಯಿಂದ ಕೇವಲ 0.5 bar ಅಂತರದಲ್ಲಿದೆ.",
    recommendationReview: "ಶಿಫಾರಸು: ಮುಂದಿನ ಶಿಫ್ಟ್ ಮುನ್ನ ಇಂಜಿನಿಯರಿಂಗ್ ಪರಿಶೀಲನೆ ಕಡ್ಡಾಯವಾಗಿದೆ.",
    offlineResolvedTitle: "ಸ್ವಾಯತ್ತ ಸಾರ್ವಭೌಮ ನಿರ್ಣಯ (ಆಫ್‌ಲೈನ್ ಮೋಡ್)",
    offlineResolvedDesc: "ಸ್ಥಳೀಯ ನಿಯಮಗಳ ಎಂಜಿನ್ ಮೂಲಕ ಪರಿಹರಿಸಲಾಗಿದೆ. ಶೂನ್ಯ ಬಾಹ್ಯ ಕ್ಲೌಡ್ ಸಂಪರ್ಕದ ಅಗತ್ಯವಿಲ್ಲ.",
    metricCurrentCondition: "ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ",
    metricNormalBaseline: "ಸಾಮಾನ್ಯ ಆಧಾರರೇಖೆ",
    metricDeviation: "ವ್ಯತ್ಯಾಸ",
    metricHighAlarm: "ಹೆಚ್ಚಿನ ಎಚ್ಚರಿಕೆ",
    metricAboveNormal: "ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು",
    metricMarginLeft: "ಉಳಿದ ಅಂತರ",
    pressureInstrumentLabel: "ಒತ್ತಡ ಉಪಕರಣ PI-204 · ಮಾಪಕ ಮತ್ತು ಟ್ರಿಪ್ ಮಿತಿಗಳು",
    observedSuffix: "ಗಮನಿಸಿದ",
    normalSuffix: "ಸಾಮಾನ್ಯ",
    alarmSuffix: "ಎಚ್ಚರಿಕೆ",
    tripSuffix: "ಟ್ರಿಪ್",
    whatSupportsTitle: "ಈ ಉತ್ತರವನ್ನು ಏನು ಬೆಂಬಲಿಸುತ್ತದೆ?",
    verifiedSourcesCount: "4 ದೃಢೀಕೃತ ಮೂಲಗಳು",
    sourceSopLabel: "ಕಾರ್ಯಾಚರಣಾ ಎಸ್‌ಒಪಿ §3.2",
    sourceSopVal: "31.2 bar ಸಾಮಾನ್ಯ ಆಧಾರರೇಖೆ ಮತ್ತು 33.5 bar ಎಚ್ಚರಿಕೆಯ ಮಿತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    sourceGaugeLabel: "ಅನಲಾಗ್ ಗೇಜ್ PI-204",
    sourceGaugeVal: "ಗೇಜ್ ಸೂಜಿಯ ದೃಶ್ಯ ತಪಾಸಣೆಯು 33.0 bar ಸ್ಥಿರ ಸ್ಥಿತಿಯನ್ನು ತೋರಿಸುತ್ತದೆ.",
    sourceCalcLabel: "ನಿರ್ಣಾಯಕ ಗಣಿತ",
    sourceCalcVal: "ಪೈಥಾನ್ ಗಣಿತ ದೃಢೀಕರಣ: 33.0 - 31.2 = +1.8 bar ವ್ಯತ್ಯಾಸ.",
    whyTrustTitle: "ಈ ಉತ್ತರವನ್ನು ನೀವು ಏಕೆ ನಂಬಬೇಕು?",
    checksPassedCount: "7 ರಲ್ಲಿ 7 ಪರಿಶೀಲನೆಗಳು ಯಶಸ್ವಿ",
    checkTraceable: "ಮೂಲಗಳು ಪತ್ತೆಹಚ್ಚಬಹುದಾಗಿದೆ",
    checkEvidenceComplete: "ಪುರಾವೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ",
    checkWithinPolicy: "ನೀತಿ ನಿಯಮಗಳ ಒಳಗೆ ಇದೆ",
    checkWithinAccess: "ನಿಮ್ಮ ಅನುಮತಿ ವ್ಯಾಪ್ತಿಯಲ್ಲಿದೆ",
    checkValuesAgree: "ಮೌಲ್ಯಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತವೆ",
    checkMath: "ಗಣಿತವನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    passBadge: "ಉತ್ತೀರ್ಣ",
    checkedByPythonNotice: "ಪೈಥಾನ್ ಕೋಡ್‌ನಿಂದ ಪರೀಕ್ಷಿಸಲ್ಪಟ್ಟಿದೆ, ಎಐ ಮಾದರಿಯಿಂದಲ್ಲ.",
    deepInspectionLabel: "ಆಳವಾದ ಪರಿಶೀಲನಾ ಕಡತ",
    tabDeepSummary: "ಸಾರಾಂಶ",
    tabDeepTimeline: "ಸಮಯರೇಖೆ",
    tabDeepEvidence: "ಪುರಾವೆಗಳು (4)",
    tabDeepChecks: "ಪರಿಶೀಲನೆಗಳು (7)",
    tabDeepVision: "ದೃಷ್ಟಿ (Vision)",
    case03BannerTitle: "ಕ್ರಮ ತಡೆಹಿಡಿಯಲಾಗಿದೆ · ನೀತಿ ಗೇಟ್‌ವೇ ಮೂಲಕ ಕಾರ್ಯಾಚರಣೆ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ",
    case03BannerDesc: "ಏಜೆಂಟ್ ಭೌತಿಕ ಮಾಪನಾಂಕ ನಿರ್ಣಯ ಸಾಧನವನ್ನು ಬಳಸಲು ಪ್ರಯತ್ನಿಸಿತು, ಆದರೆ FORGE ಕಾರ್ಯಾಚರಣೆಗೆ ಮುನ್ನವೇ ಅದನ್ನು ತಡೆಹಿಡಿಯಿತು.",
    case03Step1: "1. ವಿನಂತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    case03Step2: "2. ನೀತಿ ಪರಿಶೀಲನೆ",
    case03Step3: "3. ಗೇಟ್‌ವೇ ಪ್ರತಿಬಂಧ",
    case03WhyBlocked: "ತಡೆಹಿಡಿಯಲು ಕಾರಣ: ರಿಲೀಫ್ ವಾಲ್ವ್ ಮಾಪನಾಂಕ ನಿರ್ಣಯಕ್ಕೆ ಅಡ್ಮಿನ್ ಪಾತ್ರ ಮತ್ತು ಮೇಲ್ವಿಚಾರಕರ ಅನುಮೋದನೆ ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ಪಾತ್ರಕ್ಕೆ (ENGINEER) ಅಧಿಕಾರವಿಲ್ಲ.",
    case03ToolExecution: "ಉಪಕರಣ ಬಳಕೆ: ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ (0 ಬಾರಿ ಬಳಸಲಾಗಿದೆ)",
    case03ZeroHardware: "ಭೌತಿಕ ಸುರಕ್ಷತೆ: ಸ್ಥಾವರ ಹಾರ್ಡ್‌ವೇರ್‌ಗೆ ಶೂನ್ಯ ಆಜ್ಞೆಗಳನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ.",
    case03GatewayVerdict: "ಗೇಟ್‌ವೇ ತೀರ್ಪು: ನಿರಾಕರಿಸಲಾಗಿದೆ (ನೀತಿ ID: POL-004-SAFETY)",
    case03AuditRecord: "ಆಡಿಟ್ ದಾಖಲೆ: ಬದಲಾಯಿಸಲಾಗದ ಫೋರೆನ್ಸಿಕ್ ಲಾಗ್‌ನಲ್ಲಿ ದಾಖಲಿಸಲಾಗಿದೆ.",
    case04BannerTitle: "ಅವಿಶ್ವಾಸಾರ್ಹ ಇನ್‌ಪುಟ್ ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ · ಭದ್ರತಾ ಗಡಿ ಜಾರಿಯಲ್ಲಿದೆ",
    case04BannerDesc: "ಇನ್‌ಪುಟ್ ದಾಖಲೆಯು ಸಿಸ್ಟಮ್ ಸೂಚನೆಗಳನ್ನು ಅತಿಕ್ರಮಿಸಲು ಮತ್ತು ಅನಧಿಕೃತ ಉಪಕರಣಗಳನ್ನು ಚಲಾಯಿಸಲು ಯತ್ನಿಸಿದ ಪ್ರಾಂಪ್ಟ್ ಇಂಜೆಕ್ಷನ್ ಅನ್ನು ಒಳಗೊಂಡಿತ್ತು.",
    case04SubDesc: "FORGE ದುರುದ್ದೇಶಪೂರಿತ ಮಾದರಿಯನ್ನು ಗುರುತಿಸಿ, ಅಸುರಕ್ಷಿತ ವಿಷಯವನ್ನು ಪ್ರತ್ಯೇಕಿಸಿತು ಮತ್ತು ಎಲ್ಲಾ ಉಪಕರಣಗಳ ಬಳಕೆಯನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತಡೆಯಿತು.",
    case04Step1: "1. ಅವಿಶ್ವಾಸಾರ್ಹ ಇನ್‌ಪುಟ್",
    case04Step2: "2. ಗಡಿ ಶೋಧಕ",
    case04Step3: "3. ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ",
    case04PrivilegesGranted: "ನೀಡಲಾದ ಸವಲತ್ತುಗಳು: ಶೂನ್ಯ",
    case04ZeroTools: "ಉಪಕರಣ ಬಳಕೆ: 0 ಉಪಕರಣಗಳನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ",
    case04BoundaryResult: "ಗಡಿ ಫಲಿತಾಂಶ: ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್‌ನಲ್ಲಿ ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ",
    case04SafetyProof: "ಸುರಕ್ಷತಾ ಪುರಾವೆ: ಮಾದರಿ ಸೂಚನೆಗಳನ್ನು ಬದಲಾಯಿಸಲಾಗಿಲ್ಲ.",
    sovHeroBadge: "ಸ್ಥಳೀಯ ಸಾರ್ವಭೌಮ ರನ್‌ಟೈಮ್",
    sovHeroTitle: "ನಿಮ್ಮ ಡೇಟಾ FORGE ಒಳಗೆ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ",
    sovHeroDesc: "ಎಲ್ಲಾ ತರ್ಕಗಳು, ಸ್ಥಾವರ ಜ್ಞಾನ, ಕೈಗಾರಿಕಾ ಉಪಕರಣಗಳು ಮತ್ತು ಪರಿಶೀಲನೆಗಳು ಸ್ಥಳೀಯ ಸಾರ್ವಭೌಮ ಹಾರ್ಡ್‌ವೇರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ. ಹೊರಗಿನ ಕ್ಲೌಡ್ ಎಐ ಸೇವೆಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಕಾನ್ಫಿಗರ್ ಮಾಡಲಾಗಿಲ್ಲ ಮತ್ತು ಪ್ರವೇಶಿಸಲಾಗುವುದಿಲ್ಲ.",
    sovVerifyBtn: "ರನ್‌ಟೈಮ್ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ↻",
    sovVerifyingBtn: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    sovPillarsTitle: "ಐದು ಸಾರ್ವಭೌಮ ಸ್ತಂಭಗಳು",
    sovPillarsSubtitle: "FORGE ಸಂಪೂರ್ಣ ಪ್ರತ್ಯೇಕತೆಯನ್ನು ಹೇಗೆ ಖಾತರಿಪಡಿಸುತ್ತದೆ",
    sovViewDetailsBtn: "ತಾಂತ್ರಿಕ ರನ್‌ಟೈಮ್ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ ▼",
    sovHideDetailsBtn: "ತಾಂತ್ರಿಕ ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ ▲",
    sovExtAiTitle: "ಬಾಹ್ಯ ಎಐ ಪೂರೈಕೆದಾರರು",
    sovExtAiVal: "ಯಾವುದನ್ನೂ ಹೊಂದಿಸಲಾಗಿಲ್ಲ",
    sovExtAiSub: "ಶೂನ್ಯ ಕ್ಲೌಡ್ ಎಲ್ಎಲ್ಎಂ ಎಪಿಐ ಕರೆಗಳು ಅಥವಾ ಎಸ್‌ಡಿಕೆಗಳು",
    sovCloudFallbackTitle: "ಕ್ಲೌಡ್ ಫಾಲ್‌ಬ್ಯಾಕ್",
    sovCloudFallbackVal: "ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ (Fail-Closed)",
    sovCloudFallbackSub: "ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳ ಮೇಲೆ ಎಂದಿಗೂ ಅವಲಂಬಿತವಾಗಿಲ್ಲ",
    sovAdversarialTitle: "ಪ್ರತಿಕೂಲ ಭದ್ರತಾ ಗಡಿ ಪುರಾವೆಗಳು",
    sovAdversarialSub: "ಭದ್ರತಾ ಪರೀಕ್ಷೆಗಳು ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿವೆ",
    sovPillarAiTitle: "ಸ್ಥಳೀಯ ಎಐ (Local AI)",
    sovPillarAiBadge: "ಸ್ಥಳೀಯವಾಗಿ ಸಿದ್ಧವಾಗಿದೆ",
    sovPillarAiDesc: "ಸ್ಥಳೀಯವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ (qwen3:8b via OLLAMA). ಯಾವುದೇ ಕ್ಲೌಡ್ ಎಐ ಇಲ್ಲ, ಶೂನ್ಯ ಬಾಹ್ಯ ಎಪಿಐ ಕರೆಗಳು, ಶೂನ್ಯ ಕ್ಲೌಡ್ ಎಸ್‌ಡಿಕೆ ಅವಲಂಬನೆಗಳು.",
    sovPillarKnowledgeTitle: "ಸ್ಥಳೀಯ ಸ್ಥಾವರ ಜ್ಞಾನ (Local Knowledge)",
    sovPillarKnowledgeBadge: "ಸ್ಥಳೀಯ ವೆಕ್ಟರ್ ಎನ್‌ಕ್ಲೇವ್",
    sovPillarKnowledgeDesc: "ಖಾಸಗಿ ಸ್ಥಾವರ ದಾಖಲೆಗಳನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಸೂಚಿಕೆ ಮಾಡಲಾಗಿದೆ (Local Embeddings). ಶೂನ್ಯ ಕ್ಲೌಡ್ ವೆಕ್ಟರ್ ಡೇಟಾಬೇಸ್‌ಗಳು. ಪಾತ್ರದ ಅನುಮತಿಯಿಂದ ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಸೀಮಿತ ಪ್ರವೇಶ.",
    sovPillarToolsTitle: "ಸ್ಥಳೀಯ ಉಪಕರಣಗಳು (Local Tools)",
    sovPillarToolsBadge: "ಸೀಮಿತ ಕಾರ್ಯಗತಗೊಳಿಸುವಿಕೆ",
    sovPillarToolsDesc: "ಕೈಗಾರಿಕಾ ಕಾರ್ಯಾಚರಣೆ, ಸ್ಕಾಡಾ ಟೆಲಿಮೆಟ್ರಿ ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಫೈಲ್ ಕಾರ್ಯಾಚರಣೆಗಳು ಸ್ಥಳೀಯ ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್‌ಗಳಲ್ಲಿ ನಡೆಯುತ್ತವೆ. ನೀತಿ ಗೇಟ್‌ವೇ ಪ್ರತಿ ಕರೆಯನ್ನು ಕಾರ್ಯಗತಗೊಳಿಸುವ ಮುನ್ನ ತಡೆಯುತ್ತದೆ.",
    sovPillarVerifTitle: "ಸ್ವತಂತ್ರ ಪರಿಶೀಲನೆ (Independent Verification)",
    sovPillarVerifBadge: "ನಿರ್ಣಾಯಕ ಕೋಡ್ ಪರಿಶೀಲನೆಗಳು",
    sovPillarVerifDesc: "7 ಪ್ರತ್ಯೇಕ ಪರಿಶೀಲನೆಗಳು ಶುದ್ಧ ಪೈಥಾನ್ ಕೋಡ್ ಬಳಸಿ ಸತ್ಯಗಳು, ಮಿತಿಗಳು ಮತ್ತು ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತವೆ. ಎಐ ಮಾದರಿಯು ತನ್ನ ಸ್ವಂತ ಕೆಲಸವನ್ನು ಶ್ರೇಣೀಕರಿಸಲು ಎಂದಿಗೂ ಅನುಮತಿಸುವುದಿಲ್ಲ.",
    sovPillarAuditTitle: "ಸ್ಥಳೀಯ ಲೆಕ್ಕಪರಿಶೋಧನೆ (Local Audit)",
    sovPillarAuditBadge: "ಕೇವಲ-ಸೇರ್ಪಡೆ ಸ್ಥಳೀಯ ಸಿಂಕ್",
    sovPillarAuditDesc: "ಪ್ರತಿಯೊಂದು ಪ್ರಶ್ನೆ, ತಾರ್ಕಿಕ ಹಂತ, ಉಪಕರಣದ ಬಳಕೆ ಮತ್ತು ಪರಿಶೀಲನೆಯನ್ನು ಬದಲಾಯಿಸಲಾಗದ ಸ್ಥಳೀಯ ಫೈಲ್ ಸಿಂಕ್‌ನಲ್ಲಿ ದಾಖಲಿಸಲಾಗುತ್ತದೆ. ಡೇಟಾ ನಿಮ್ಮ ಸೌಲಭ್ಯವನ್ನು ಬಿಟ್ಟು ಎಂದಿಗೂ ಹೋಗುವುದಿಲ್ಲ.",
    sovPillarEgressTitle: "ನೆಟ್‌ವರ್ಕ್ ಪ್ರತ್ಯೇಕತೆ (Network Isolation)",
    sovPillarEgressBadge: "0 B ಬಾಹ್ಯ · 100% ಪ್ರತ್ಯೇಕ",
    sovPillarEgressDesc: "ಹೋಸ್ಟ್ ಲೂಪ್‌ಬ್ಯಾಕ್ ಇಂಟರ್‌ಫೇಸ್ ಜಾರಿ. ಸಾಕೆಟ್ ಆಡಿಟ್ ಯಾವುದೇ ಬಾಹ್ಯ ಬೈಟ್‌ಗಳು ಅಥವಾ ಪ್ಯಾಕೆಟ್‌ಗಳು ಸ್ಥಳೀಯ ಸೌಲಭ್ಯದಿಂದ ಹೊರಹೋಗುವುದಿಲ್ಲ ಎಂದು ಸಾಬೀತುಪಡಿಸುತ್ತದೆ. ಶೂನ್ಯ ಕ್ಲೌಡ್ ಎಐ ಎಸ್‌ಡಿಕೆ ಅವಲಂಬನೆಗಳು.",
    networkIsolationTitle: "ಹೋಸ್ಟ್ ನೆಟ್‌ವರ್ಕ್ ನಿರ್ಗಮನ ನಿಯಂತ್ರಣ",
    networkIsolationDesc: "ಸಿಸ್ಟಂ ನಿರ್ಗಮನ ಸಾಕೆಟ್ ಆಡಿಟ್ ಶೂನ್ಯ ಹೊರಹೋಗುವ ನೆಟ್‌ವರ್ಕ್ ಪ್ಯಾಕೆಟ್‌ಗಳನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.",
    zeroEgressBadge: "0 B ನಿರ್ಗಮನ · ಏರ್-ಗ್ಯಾಪ್ಡ್",
    knowledgeTitle: "ಸ್ಥಾವರ ಜ್ಞಾನ ವ್ಯವಸ್ಥೆ (Knowledge Fabric)",
    knowledgeSubtitle: "ಪಾತ್ರದ ಅನುಮತಿ ಗಡಿಗಳೊಂದಿಗೆ ಖಾಸಗಿ ಸ್ಥಾವರ ದಾಖಲಾತಿಗಳು, ಕಾರ್ಯಾಚರಣಾ ಕಾರ್ಯವಿಧಾನಗಳು ಮತ್ತು ತಪಾಸಣಾ ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಿ.",
    knowledgeSearchPlaceholder: "ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ, ಉದಾ. 'ರಿಯಾಕ್ಟರ್ R-204 ನ ಟ್ರಿಪ್ ಮಿತಿ ಏನು?'...",
    searchKnowledgeBtn: "ಜ್ಞಾನ ಹುಡುಕಿ",
    searchingKnowledgeBtn: "ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
    refreshRecordsBtn: "↻ ದಾಖಲೆಗಳನ್ನು ನವೀಕರಿಸಿ",
    refreshingRecordsBtn: "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
    askRecordsLabel: "ಸ್ಥಾವರ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ",
    clearanceEnforcedLabel: "ಅನುಮತಿ ಹಂತ ಜಾರಿಯಲ್ಲಿದೆ:",
    suggestedQueriesLabel: "ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು:",
    plantDocumentsHeader: "ಸ್ಥಾವರ ದಾಖಲೆಗಳು",
    assetLabel: "ಆಸ್ತಿ: ರಿಯಾಕ್ಟರ್ R-204",
    sizeLabel: "ಗಾತ್ರ:",
    refLabel: "ಉಲ್ಲೇಖ:",
    reIndexBtn: "ಪುನಃ ಸೂಚಿಕೆ ಮಾಡಿ ↺",
    indexingBtn: "ಸೂಚಿಕೆ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    accessibleBadge: "✓ ಲಭ್ಯವಿದೆ (ದೃಢೀಕೃತ)",
    restrictedBadge: "🔒 ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ",
    humanAnswerTitle: "ಮಾನವ-ಓದಬಹುದಾದ ಉತ್ತರ",
    humanAnswerSubtitle: "ಖಾಸಗಿ ಸ್ಥಾವರ ದಾಖಲೆಗಳಿಂದ ಸಂಶ್ಲೇಷಿಸಲಾಗಿದೆ",
    primarySourceLabel: "ಪ್ರಾಥಮಿಕ ಮೂಲ:",
    onPremiseLocalDataProof: "✓ 100% ಸ್ಥಳೀಯ ಡೇಟಾ",
    sourcePassagesHeader: "ಉತ್ತರ ಮತ್ತು ಬೆಂಬಲಿತ ಭಾಗಗಳು",
    matchScoreSuffix: "% ಹೊಂದಾಣಿಕೆ",
    documentLabel: "ದಾಖಲೆ:",
    chunkIdLabel: "ಭಾಗದ (Chunk) ID:",
    readyToSearchTitle: "ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಲು ಸಿದ್ಧವಾಗಿದೆ",
    readyToSearchDesc: "ಸಾರ್ವಭೌಮ ವೆಕ್ಟರ್ ಮರುಪಡೆಯುವಿಕೆಗಳನ್ನು ಪರೀಕ್ಷಿಸಲು ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ ಅಥವಾ ಮೇಲಿನ ಸಲಹೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    docSopTitle: "ಕಾರ್ಯಾಚರಣಾ ಎಸ್‌ಒಪಿ (Operating SOP)",
    docSopDesc: "ಕಾರ್ಯಾಚರಣಾ ಮಿತಿಗಳು, ಸಾಮಾನ್ಯ ಆಧಾರರೇಖೆಗಳು ಮತ್ತು ಸುರಕ್ಷತಾ ಮಿತಿಗಳು.",
    docSopCat: "ಪ್ರಮಾಣಿತ ಕಾರ್ಯವಿಧಾನ",
    docInspectionTitle: "ತಪಾಸಣಾ ವರದಿ (Inspection Report)",
    docInspectionDesc: "ಅಲ್ಟ್ರಾಸಾನಿಕ್ ಶೆಲ್ ದಪ್ಪ ಸಮೀಕ್ಷೆ ಮತ್ತು ವೆಲ್ಡ್ ಜಾಯಿಂಟ್ ಡೇಟಾ.",
    docInspectionCat: "ಎನ್‌ಡಿಟಿ ಸಮೀಕ್ಷೆ",
    docEquipTitle: "ಉಪಕರಣ ನಿರ್ದಿಷ್ಟತೆ (Equipment Spec)",
    docEquipDesc: "ಒತ್ತಡದ ಪಾತ್ರೆ R-204 ವಿನ್ಯಾಸ ಲಕೋಟೆ ಮತ್ತು ಲೋಹಶಾಸ್ತ್ರ.",
    docEquipCat: "ಪಾತ್ರೆ ನಿರ್ದಿಷ್ಟತೆ",
    docMaintenanceTitle: "ನಿರ್ವಹಣಾ ಇತಿಹಾಸ (Maintenance History)",
    docMaintenanceDesc: "ಓವರ್‌ಹಾಲ್ ಲಾಗ್‌ಗಳು ಮತ್ತು ರಿಲೀಫ್ ವಾಲ್ವ್ ಮಾಪನಾಂಕ ನಿರ್ಣಯ ದಾಖಲೆಗಳು.",
    docMaintenanceCat: "ಸ್ಥಾವರ ಇತಿಹಾಸ",
    docAdvisoryTitle: "ನಿರ್ಬಂಧಿತ ಸಲಹಾ ಬುಲೆಟಿನ್",
    docAdvisoryDesc: "ಅವಿಶ್ವಾಸಾರ್ಹ ಪ್ರಾಂಪ್ಟ್ ಇಂಜೆಕ್ಷನ್ ಹೊಂದಿರುವ ಪ್ರತ್ಯೇಕ ಮಾದರಿ.",
    docAdvisoryCat: "ಭದ್ರತಾ ಪರೀಕ್ಷಾ ಮಾದರಿ",
    governanceTitle: "ಪಾತ್ರಾಧಾರಿತ ಅಧಿಕಾರ ಮತ್ತು ನೀತಿ ಗೇಟ್‌ವೇಗಳು",
    governanceSubtitle: "FORGE ನಲ್ಲಿ ಯಾರು ಏನು ಮಾಡಬಹುದು. ಪ್ರತಿಯೊಂದು ಉಪಕರಣ ಬಳಕೆ ಮತ್ತು ತನಿಖೆಯನ್ನು ಕಟ್ಟುನಿಟ್ಟಾದ ಪೂರ್ವನಿಯೋಜಿತ-ನಿರಾಕರಣೆ ನೀತಿ ಗೇಟ್‌ವೇಗಳು ನಿರ್ವಹಿಸುತ್ತವೆ.",
    permissionMatrixTitle: "ಪಾತ್ರಗಳ ಅನುಮತಿ ಕೋಷ್ಟಕ",
    authorityLedgerBadge: "ಅಧಿಕಾರ ವಹಿವಾಟು ಪಟ್ಟಿ",
    defaultDenyBadge: "ಪೂರ್ವನಿಯೋಜಿತ-ನಿರಾಕರಣೆ ಜಾರಿಯಲ್ಲಿದೆ",
    securityPassBadge: "ಭದ್ರತಾ ಪರೀಕ್ಷೆಗಳು: 10 / 10 ಉತ್ತೀರ್ಣ",
    activePersonaLabel: "ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಪಾತ್ರ:",
    policyGatewayActive: "ನೀತಿ ಗೇಟ್‌ವೇ: ಸಕ್ರಿಯ ಮತ್ತು ಜಾರಿಯಲ್ಲಿದೆ",
    colRole: "ಪಾತ್ರ",
    colRead: "ಓದುವಿಕೆ (Read)",
    colInvestigate: "ತನಿಖೆ (Investigate)",
    colActuate: "ಕಾರ್ಯಾಚರಣೆ (Actuate)",
    colAdmin: "ಆಡಳಿತ (Admin)",
    colSummary: "ಅನುಮತಿಗಳ ಸಾರಾಂಶ",
    badgeAllowed: "✓ ಅನುಮತಿಸಲಾಗಿದೆ",
    badgeApprovalRequired: "⚠ ಅನುಮೋದನೆ ಅಗತ್ಯವಿದೆ",
    badgeBlocked: "✕ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ",
    youBadge: "ನೀವು",
    securityTestsBannerTitle: "ಭದ್ರತಾ ಪರೀಕ್ಷೆಗಳು: 10 / 10 ಉತ್ತೀರ್ಣ",
    securityTestsBannerDesc: "ಅವಿಶ್ವಾಸಾರ್ಹ ಇನ್‌ಪುಟ್‌ಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ ಮತ್ತು ಅನಧಿಕೃತ ಕ್ರಿಯೆಗಳನ್ನು ತಡೆಹಿಡಿಯಲಾಗಿದೆ ಎಂದು ಗಡಿ ಪರೀಕ್ಷೆಗಳು ಪರಿಶೀಲಿಸುತ್ತವೆ.",
    viewPolicyDetailsBtn: "ತಾಂತ್ರಿಕ ನೀತಿ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ ▼",
    hidePolicyDetailsBtn: "ತಾಂತ್ರಿಕ ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ ▲",
    auditTitle: "ಚಟುವಟಿಕೆ ಸಮಯರೇಖೆ ಮತ್ತು ಫೋರೆನ್ಸಿಕ್ ಬೆನ್ನೆಲುಬು",
    auditSubtitle: "ಪ್ರತಿಯೊಬ್ಬ ಆಪರೇಟರ್ ಪ್ರಶ್ನೆ, ಏಜೆಂಟ್ ತಾರ್ಕಿಕ ಹಂತ, ನೀತಿ ನಿರ್ಧಾರ, ಉಪಕರಣ ಬಳಕೆ ಮತ್ತು ಪರಿಶೀಲನೆಯನ್ನು ಬದಲಾಯಿಸಲಾಗದ ಸ್ಥಳೀಯ ಆಡಿಟ್ ಲಾಗ್‌ನಲ್ಲಿ ದಾಖಲಿಸಲಾಗುತ್ತದೆ.",
    auditTotalEvents: "ಒಟ್ಟು ದಾಖಲಾದ ಘಟನೆಗಳು",
    auditBadgeActivity: "ಚಟುವಟಿಕೆ ಸಮಯರೇಖೆ",
    auditBadgeAppendOnly: "ಸ್ಥಳೀಯ ಕೇವಲ-ಸೇರ್ಪಡೆ ಆಡಿಟ್",
    refreshActivityBtn: "↻ ಚಟುವಟಿಕೆ ನವೀಕರಿಸಿ",
    refreshingActivityBtn: "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
    normalFlowTitle: "ಸಾಮಾನ್ಯ ತನಿಖೆ (ಅನುಮತಿಸಲಾಗಿದೆ)",
    blockedFlowTitle: "ಅನಧಿಕೃತ ಕಾರ್ಯಾಚರಣೆ (ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ)",
    kpiTotalEvents: "ಒಟ್ಟು ದಾಖಲಾದ ಘಟನೆಗಳು",
    kpiToolPolicy: "ಉಪಕರಣ ಮತ್ತು ನೀತಿ ಜಾರಿ",
    kpiStorageMode: "ಆಡಿಟ್ ಸಂಗ್ರಹಣೆ ಮೋಡ್",
    kpiOutsideAi: "ಬಾಹ್ಯ ಎಐ ಸೇವೆಗಳು",
    kpiSinkModeVal: "ಸ್ಥಳೀಯ ಕೇವಲ-ಸೇರ್ಪಡೆ ಸಿಂಕ್",
    kpiSinkModeSub: "ಸ್ಥಳೀಯ ಮೆಮೊರಿ ಮತ್ತು ಫೈಲ್ ಸಂಗ್ರಹ",
    kpiNoneConfiguredVal: "ಯಾವುದನ್ನೂ ಹೊಂದಿಸಲಾಗಿಲ್ಲ",
    kpiNoneConfiguredSub: "ಸ್ಥಳೀಯ ಲೂಪ್‌ಬ್ಯಾಕ್ ಮಾತ್ರ",
    forensicSpineTitle: "ಫೋರೆನ್ಸಿಕ್ ಸ್ಪೈನ್ (ಘಟನೆಗಳು)",
    filterAll: "ಎಲ್ಲವೂ",
    filterAgent: "ಏಜೆಂಟ್",
    filterKnowledge: "ಜ್ಞಾನ",
    filterPolicy: "ನೀತಿ",
    filterTool: "ಉಪಕರಣ",
    filterVerification: "ಪರಿಶೀಲನೆ",
    inspectJsonBtn: "JSON ಪರಿಶೀಲಿಸಿ ▼",
    closeJsonBtn: "JSON ಮುಚ್ಚಿ ▲",
    actorLabel: "ಕರ್ತೃ:",
    eventIdLabel: "ಘಟನಾ ID:",
    evtQuestionReceivedTitle: "ಆಪರೇಟರ್‌ನಿಂದ ಪ್ರಶ್ನೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    evtQuestionReceivedDesc: "ಆಪರೇಟರ್ ಸಾರ್ವಭೌಮ ನಿಯಂತ್ರಣ ವ್ಯವಸ್ಥೆಗೆ ಕೈಗಾರಿಕಾ ಟೆಲಿಮೆಟ್ರಿ ಅಥವಾ ಕಾರ್ಯವಿಧಾನದ ವಿಚಾರಣೆಯನ್ನು ಸಲ್ಲಿಸಿದ್ದಾರೆ.",
    evtKnowledgeConsultedTitle: "ಸ್ಥಾವರ ದಾಖಲೆಗಳನ್ನು ಸಂಪರ್ಕಿಸಲಾಗಿದೆ",
    evtKnowledgeConsultedDesc: "ಸ್ಥಳೀಯ ವೆಕ್ಟರ್ ಹುಡುಕಾಟವು ಅನುಮತಿ ಮಿತಿಗಳ ಒಳಗೆ ಖಾಸಗಿ ಕಾರ್ಯಾಚರಣಾ ಕಾರ್ಯವಿಧಾನಗಳನ್ನು ಹಿಂಪಡೆದಿದೆ.",
    evtPolicyBlockedTitle: "ಅನುಮತಿ ಪರಿಶೀಲನೆ → ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ",
    evtPolicyBlockedDesc: "FORGE ಪಾತ್ರದ ಅನುಮತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ವಿನಂತಿಸಿದ ಕ್ರಮವನ್ನು ಕಾರ್ಯಾಚರಣೆಗೆ ಮುನ್ನ ತಡೆಹಿಡಿಯಿತು.",
    evtPolicyAllowedTitle: "ಅನುಮತಿ ಪರಿಶೀಲನೆ → ಅನುಮತಿಸಲಾಗಿದೆ",
    evtPolicyAllowedDesc: "ನಿಯೋಜಿತ ಪಾತ್ರದ ಅನುಮತಿಗಾಗಿ ನೀತಿ ನಿಯಮಗಳ ವಿರುದ್ಧ ಕ್ರಿಯೆಯನ್ನು ಮೌಲ್ಯೀಕರಿಸಲಾಗಿದೆ.",
    evtToolBlockedTitle: "ಉಪಕರಣ ಬಳಕೆ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ",
    evtToolBlockedDesc: "ನೀತಿ ಗೇಟ್‌ವೇ ಉಪಕರಣ ರವಾನೆಯನ್ನು ತಡೆಯಿತು. ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್ ಕೋಡ್ ಚಾಲನೆ: 0 ಬಾರಿ.",
    evtToolExecutedTitle: "ಉಪಕರಣ ಅನುಮತಿಸಲಾಗಿದೆ ಮತ್ತು ಚಲಾಯಿಸಲಾಗಿದೆ",
    evtToolExecutedDesc: "ದೃಢೀಕರಿಸಿದ ವಾದಗಳೊಂದಿಗೆ ಸ್ಥಳೀಯ ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್‌ನಲ್ಲಿ ಕೈಗಾರಿಕಾ ಉಪಕರಣವನ್ನು ಚಲಾಯಿಸಲಾಗಿದೆ.",
    evtVerifiedTitle: "ಉತ್ತರವನ್ನು ಸ್ವತಂತ್ರವಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ",
    evtVerifiedDesc: "ನಿರ್ಣಾಯಕ ಪೈಥಾನ್ ಪರಿಶೀಲನೆಗಳು ಲೆಕ್ಕಾಚಾರಗಳು, ಸ್ಥಿರತೆ ಮತ್ತು ಆಧಾರಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿದವು.",
    evidenceDossierTitle: "ಪುರಾವೆಗಳ ಕಡತ",
    evidenceDossierSubtitle: "ಪ್ರತಿಯೊಂದು ಹಕ್ಕು ಪರಿಶೀಲಿಸಬಹುದಾದ ಪುರಾವೆಗಳಿಗೆ ಬದ್ಧವಾಗಿದೆ: ದಾಖಲಿತ ಸ್ಥಾವರ ಕಾರ್ಯವಿಧಾನಗಳು, ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್ ಉಪಕರಣಗಳು, ಅನಲಾಗ್ ಗೇಜ್‌ಗಳು ಅಥವಾ ನಿರ್ಣಾಯಕ ಗಣಿತ.",
    filterAllEvidence: "ಎಲ್ಲಾ ಪುರಾವೆಗಳು",
    filterProcedures: "ಸ್ಥಾವರ ಕಾರ್ಯವಿಧಾನಗಳು",
    filterSensors: "ಸಂವೇದಕ ರೀಡಿಂಗ್‌ಗಳು",
    filterGauges: "ಗೇಜ್‌ಗಳು ಮತ್ತು ದೃಷ್ಟಿ",
    filterMath: "ಸ್ವತಂತ್ರ ಗಣಿತ",
    modelDoesNotVerifyTitle: "ಮಾದರಿಯು ತನ್ನನ್ನು ತಾನೇ ಪರಿಶೀಲಿಸುವುದಿಲ್ಲ",
    independentCodeChecksBadge: "7 ಸ್ವತಂತ್ರ ಕೋಡ್ ಪರಿಶೀಲನೆಗಳು",
    deterministicVerdictLabel: "ನಿರ್ಣಾಯಕ ಪರಿಶೀಲನಾ ತೀರ್ಪು",
    assessmentSummaryLabel: "ಪರಿಶೀಲನಾ ಮೌಲ್ಯಮಾಪನ ಸಾರಾಂಶ",
    footerReasoning: "ತಾರ್ಕಿಕ ಮಾದರಿ:",
    footerVision: "ದೃಶ್ಯ ಗ್ರಹಿಕೆ:",
    footerPolicy: "ಭದ್ರತಾ ನೀತಿ:",
    footerOutsideAi: "ಬಾಹ್ಯ ಎಐ ಸೇವೆಗಳು:",
    footerNoneConfigured: "ಯಾವುದನ್ನೂ ಹೊಂದಿಸಲಾಗಿಲ್ಲ (ಏರ್-ಗ್ಯಾಪ್ಡ್)",
    footerDefaultDeny: "ಪೂರ್ವನಿಯೋಜಿತ-ನಿರಾಕರಣೆ ಜಾರಿಯಲ್ಲಿದೆ",
    footerRuntimeDetails: "ರನ್‌ಟೈಮ್ ವಿವರಗಳು →",
    footerLive: "ಲೈವ್ ಸ್ಥಳೀಯ",
    footerDemoHarness: "ಡೆಮೊ ವ್ಯವಸ್ಥೆ",
    footerFixture: "ಡೆಮೊ ಮಾದರಿ (ಸಲಹಾತ್ಮಕ)",
    traceTitle: "ಫೋರೆನ್ಸಿಕ್ ಎಕ್ಸಿಕ್ಯೂಶನ್ ಟ್ರೇಸ್",
    traceLifecycle: "ಡಿಟರ್ಮಿನಿಸ್ಟಿಕ್ ಲೈಫ್‌ಸೈಕಲ್",
    traceEventId: "ಈವೆಂಟ್ ಐಡಿ",
    tracePhase1Title: "ಕಾರ್ಯಾಚರಣೆಯ ಪ್ರಶ್ನೆ ಸ್ವೀಕಾರ",
    tracePhase1Badge: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    tracePhase2Title: "ತಾರ್ಕಿಕ ಯೋಜನೆಯ ಸೂತ್ರೀಕರಣ",
    traceActionLabel: "ಕ್ರಮ",
    traceKnowledgeQueries: "ಜ್ಞಾನ ಪ್ರಶ್ನೆಗಳು",
    traceToolCalls: "ಟೂಲ್ ಕರೆಗಳು",
    traceCalculations: "ಲೆಕ್ಕಾಚಾರಗಳು",
    tracePhase3Title: "ಸಾರ್ವಭೌಮ ಜ್ಞಾನ ಮರುಪಡೆಯುವಿಕೆ",
    traceChunksRetrieved: "ದಾಖಲೆ ತುಣುಕುಗಳನ್ನು ಪಡೆಯಲಾಗಿದೆ",
    traceMatch: "ಹೊಂದಾಣಿಕೆ",
    tracePhase4Title: "ನೀತಿ ಗೇಟ್‌ವೇ ಮಧ್ಯಸ್ಥಿಕೆ ಮತ್ತು ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್",
    traceEvaluations: "ಮೌಲ್ಯಮಾಪನಗಳು",
    traceRule: "ನಿಯಮ",
    traceExecutedTools: "ಕಾರ್ಯಗತಗೊಳಿಸಿದ ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್ ಪರಿಕರಗಳು",
    tracePhase5Title: "ಎಂಜಿನಿಯರಿಂಗ್ ದೃಷ್ಟಿ ವೀಕ್ಷಣೆ",
    traceVisualRecords: "ದೃಶ್ಯ ದಾಖಲೆಗಳು",
    tracePhase6Title: "ಸ್ವತಂತ್ರ ಡಿಟರ್ಮಿನಿಸ್ಟಿಕ್ ಪರಿಶೀಲನೆ",
    tracePhase7Title: "ಪರಿಶೀಲಿಸಿದ ಪ್ರಕರಣ ಬ್ರೀಫಿಂಗ್ ವಿತರಿಸಲಾಗಿದೆ",
    traceOperatorPresentation: "ಆಪರೇಟರ್ ಪ್ರಸ್ತುತಿ",
    healthTitle: "ಸಾರ್ವಭೌಮ ಕಂಟ್ರೋಲ್ ಪ್ಲೇನ್ ರನ್‌ಟೈಮ್ ಟೆಲಿಮೆಟ್ರಿ",
    healthSubtitle: "ಸಾರ್ವಭೌಮ ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ",
    healthLastSampled: "ಕೊನೆಯ ಮಾದರಿ",
    healthInitializing: "ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...",
    healthProbing: "ರನ್‌ಟೈಮ್ ತಪಾಸಣೆ...",
    healthRunCheck: "ಆರೋಗ್ಯ ತಪಾಸಣೆ ನಡೆಸಿ",
    healthBackendEngine: "ಬ್ಯಾಕೆಂಡ್ ಎಂಜಿನ್",
    healthSovereigntyEnforcement: "ಸಾರ್ವಭೌಮತ್ವ ಜಾರಿ",
    healthSovereignRuntime: "ಸಾರ್ವಭೌಮ ರನ್‌ಟೈಮ್",
    healthZeroCloudAllowed: "ಶೂನ್ಯ ಕ್ಲೌಡ್ ಎಐ ಎಪಿಐ ಅನುಮತಿ",
    healthLocalInferenceBackend: "ಸ್ಥಳೀಯ ಇನ್‌ಫರೆನ್ಸ್ ಬ್ಯಾಕೆಂಡ್",
    healthStatusOnline: "ಆನ್‌ಲೈನ್ (ಪೋರ್ಟ್ 11434)",
    healthStatusOffline: "ಆಫ್‌ಲೈನ್ / ಸ್ಟ್ಯಾಂಡ್‌ಬೈ",
    healthReasoningModel: "ತಾರ್ಕಿಕ ಮಾದರಿ",
    healthVerifiedLocalGpu: "ದೃಢೀಕರಿಸಿದ ಸ್ಥಳೀಯ (RTX 4060 GPU)",
    healthConfiguredDefault: "ಕಾನ್ಫಿಗರ್ ಮಾಡಲಾದ ಡೀಫಾಲ್ಟ್",
    navSovereignLocalRuntime: "ಸಾರ್ವಭೌಮ ಸ್ಥಳೀಯ ರನ್‌ಟೈಮ್",
    navBackendOffline: "ಬ್ಯಾಕೆಂಡ್ ಆಫ್‌ಲೈನ್",
    navLiveLocalInference: "ಲೈವ್ ಸ್ಥಳೀಯ ಇನ್‌ಫರೆನ್ಸ್",
    navDeterministicDemoMode: "ಡಿಟರ್ಮಿನಿಸ್ಟಿಕ್ ಡೆಮೊ ಮೋಡ್",
    caseAssetLabel: "ಉಪಕರಣ",
    casePersonaLabel: "ಪಾತ್ರ",
    caseClearanceLabel: "ಭದ್ರತಾ ಅನುಮತಿ",
    caseLoggedLabel: "ದಾಖಲಾದ ಸಮಯ",
    subsystemActive: "ಸಕ್ರಿಯ",
    subsystemReady: "ಸಿದ್ಧ",
    subsystemStaged: "ಹಂತದಲ್ಲಿದೆ",
    runtimeDetailsTitle: "ಸಾರ್ವಭೌಮ ರನ್‌ಟೈಮ್ ವಿವರಗಳು",
    runtimeDetailsSubtitle: "ಸಾಬೀತಾದ ರನ್‌ಟೈಮ್ ಸಾಮರ್ಥ್ಯಗಳು ಮತ್ತು ಪ್ರೀಫ್ಲೈಟ್ ಟೆಲಿಮೆಟ್ರಿ",
    runtimeCloseBtn: "ಮುಚ್ಚಿ",
    runtimeEndpointTitle: "ಇನ್‌ಫರೆನ್ಸ್ ಎಂಡ್‌ಪಾಯಿಂಟ್",
    runtimeLoopbackVerified: "✓ ಲೂಪ್‌ಬ್ಯಾಕ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ — ಶೂನ್ಯ ಬಾಹ್ಯ ನಿರ್ಗಮನ ಮಾರ್ಗಗಳು",
    runtimeReasoningSubsystem: "ತಾರ್ಕಿಕ ಉಪವ್ಯವಸ್ಥೆ",
    runtimeLiveResponding: "✓ ಲೈವ್ ಸ್ಥಳೀಯ ಮಾದರಿ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತಿದೆ",
    runtimeDemoHarnessDesc: "ℹ ಡಿಟರ್ಮಿನಿಸ್ಟಿಕ್ ಡೆಮೊ ಹಾರ್ನೆಸ್ (ಸ್ಕ್ರಿಪ್ಟೆಡ್ ಯೋಜನೆ)",
    runtimeVisionSubsystem: "ದೃಷ್ಟಿ ಉಪವ್ಯವಸ್ಥೆ",
    runtimeVisionLive: "✓ ಮಲ್ಟಿಮೋಡಲ್ ದೃಷ್ಟಿ ಸ್ಥಳೀಯವಾಗಿ ಸಕ್ರಿಯವಾಗಿದೆ",
    runtimeVisionFixture: "ಸಲಹಾ ಡೆಮೊ ಫಿಕ್ಚರ್ (ಆಫ್‌ಲೈನ್ ಕೃತಕ ಚಿತ್ರಗಳು)",
    runtimeEmbeddingsTitle: "ಎಂಬೆಡ್ಡಿಂಗ್ಸ್ ಮತ್ತು ವೆಕ್ಟರ್ ಹುಡುಕಾಟ",
    runtimeOnPremiseOnly: "ಆನ್-ಪ್ರಿಮೈಸ್ ಮಾತ್ರ",
    runtimeDependencyAudit: "ಅವಲಂಬನೆ ಆಡಿಟ್",
    runtimeZeroCloudSdk: "✓ 0 ಕ್ಲೌಡ್ ಎಐ ಎಸ್‌ಡಿಕೆಗಳು ಲೋಡ್ ಆಗಿವೆ",
    runtimeSdkForbidden: "ಪ್ರಾರಂಭದಲ್ಲಿ ಸ್ಕ್ಯಾನ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ: OpenAI, Anthropic, Google GenAI ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ",
    runtimeAuditIntegrity: "ಆಡಿಟ್ ಟ್ರಯಲ್ ಸಮಗ್ರತೆ",
    runtimeHashChained: "ಹ್ಯಾಶ್-ಚೈನ್ಡ್ ಈವೆಂಟ್ ಸ್ಟೋರ್",
    runtimeAppendOnly: "ಸ್ಥಳೀಯ ಅಪೆಂಡ್-ಓನ್ಲಿ ಈವೆಂಟ್ ಬಸ್",
    runtimeTotalEvents: "ದಾಖಲಾದ ಒಟ್ಟು ಘಟನೆಗಳು",
    runtimeRefreshBtn: "ಪ್ರೀಫ್ಲೈಟ್ ಟೆಲಿಮೆಟ್ರಿ ರಿಫ್ರೆಶ್ ಮಾಡಿ",
    visionFilename: "ಕಡತದ ಹೆಸರು",
    visionMime: "MIME ಪ್ರಕಾರ",
    visionSize: "ಗಾತ್ರ",
    visionConfidence: "ವಿಶ್ವಾಸಾರ್ಹತೆ",
    visionObserved: "ವೀಕ್ಷಿಸಲಾಗಿದೆ",
    visionSeverity: "ತೀವ್ರತೆ",
  },
};
