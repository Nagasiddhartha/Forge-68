import { Role, DataClassification } from "./api";

export interface RolePermissionConfig {
  role: Role;
  label: string;
  defaultClearance: DataClassification;
  summary: string;
  read: "ALLOWED" | "NEEDS_APPROVAL" | "BLOCKED";
  investigate: "ALLOWED" | "NEEDS_APPROVAL" | "BLOCKED";
  actuate: "ALLOWED" | "NEEDS_APPROVAL" | "BLOCKED";
  admin: "ALLOWED" | "NEEDS_APPROVAL" | "BLOCKED";
  bulletPoints: string[];
  actuationExplanation: string;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissionConfig> = {
  ENGINEER: {
    role: "ENGINEER",
    label: "Engineer",
    defaultClearance: "CONFIDENTIAL",
    summary: "Standard operational role. Runs investigations and read-only tools. Critical valve actuation requires approval.",
    read: "ALLOWED",
    investigate: "ALLOWED",
    actuate: "NEEDS_APPROVAL",
    admin: "BLOCKED",
    bulletPoints: [
      "Read plant telemetry & equipment data",
      "Read operating procedures (SOPs)",
      "Run operational investigations",
      "Read-only diagnostics & calculation tools",
      "Critical valve actuation requires supervisor approval",
      "Administrative system overrides blocked",
    ],
    actuationExplanation: "Engineers can investigate and read sensors, but cannot calibrate critical valves without secondary approval.",
  },
  VIEWER: {
    role: "VIEWER",
    label: "Viewer",
    defaultClearance: "PUBLIC",
    summary: "Read-only operational viewer. Knowledge plant search permitted; all tooling, actuation, and admin actions are strictly blocked.",
    read: "ALLOWED",
    investigate: "BLOCKED",
    actuate: "BLOCKED",
    admin: "BLOCKED",
    bulletPoints: [
      "Read plant documentation, operating manuals, and SOPs",
      "Inspect public plant records and equipment specifications",
      "Operational tool investigation strictly blocked",
      "Physical machinery actuation strictly blocked",
      "Administrative system overrides strictly blocked",
    ],
    actuationExplanation: "Viewers maintain read-only observation clearance. All tool invocations and physical actuations are blocked.",
  },
  INTERN: {
    role: "INTERN",
    label: "Intern",
    defaultClearance: "INTERNAL",
    summary: "Junior operational role. Knowledge search permitted; all investigative queries, tool executions, and actuations require supervisor approval.",
    read: "ALLOWED",
    investigate: "NEEDS_APPROVAL",
    actuate: "NEEDS_APPROVAL",
    admin: "BLOCKED",
    bulletPoints: [
      "Read plant documentation, drawings, and knowledge guides",
      "Investigative tool queries require supervisor approval",
      "Equipment telemetry inspections require supervisor approval",
      "Physical valve calibration and actuation require co-signature",
      "Administrative system overrides strictly blocked",
    ],
    actuationExplanation: "Interns require supervisor cryptographic approval for all operational investigation and plant actuation workflows.",
  },
  INSPECTOR: {
    role: "INSPECTOR",
    label: "Inspector",
    defaultClearance: "INTERNAL",
    summary: "Auditing & inspection role. Reviews ultrasonic surveys, inspection logs, and gauge readings. Actuation blocked.",
    read: "ALLOWED",
    investigate: "ALLOWED",
    actuate: "BLOCKED",
    admin: "BLOCKED",
    bulletPoints: [
      "Read ultrasonic inspection reports (PAUT)",
      "Read historical inspection & telemetry logs",
      "Run non-destructive evaluation workflows",
      "Physical tool actuation strictly blocked",
      "Administrative overrides blocked",
    ],
    actuationExplanation: "Inspectors have read-only diagnostic clearance. Physical machinery actuation is strictly blocked.",
  },
  AI_OPERATOR: {
    role: "AI_OPERATOR",
    label: "AI Operator",
    defaultClearance: "RESTRICTED",
    summary: "Autonomous workflow operator. Approved investigation access with zero write or physical actuation authority.",
    read: "ALLOWED",
    investigate: "ALLOWED",
    actuate: "BLOCKED",
    admin: "BLOCKED",
    bulletPoints: [
      "Approved investigation and query access",
      "Zero write authority to control systems",
      "Physical tool actuation strictly blocked",
      "Adversarial or untrusted inputs quarantined",
      "Administrative overrides blocked",
    ],
    actuationExplanation: "AI Operators operate within a zero-write sandbox. Actuation commands are intercepted and blocked.",
  },
  ADMIN: {
    role: "ADMIN",
    label: "Administrator",
    defaultClearance: "CRITICAL",
    summary: "Broad operational authority. Administrative controls available; critical machine actuation mandates supervisor approval.",
    read: "ALLOWED",
    investigate: "ALLOWED",
    actuate: "NEEDS_APPROVAL",
    admin: "ALLOWED",
    bulletPoints: [
      "Broadest read access across all plant data",
      "Administrative system configuration controls",
      "Critical actuation strictly requires supervisor approval (no bypass)",
      "All actions subject to immutable local audit logging",
    ],
    actuationExplanation: "Administrators cannot unilaterally bypass critical actuation safety gates. Approval is strictly required.",
  },
  SECURITY_OFFICER: {
    role: "SECURITY_OFFICER",
    label: "Security Officer",
    defaultClearance: "CRITICAL",
    summary: "Security oversight role. Full audit visibility, boundary verification, and attack testing. Actuation blocked.",
    read: "ALLOWED",
    investigate: "ALLOWED",
    actuate: "BLOCKED",
    admin: "BLOCKED",
    bulletPoints: [
      "Inspect tamper-evident audit logs & trace events",
      "Run adversarial security boundary tests",
      "Plant machinery actuation strictly blocked",
      "Direct administrative override blocked",
    ],
    actuationExplanation: "Security Officers maintain security oversight and cannot actuate physical industrial equipment.",
  },
  MANAGER: {
    role: "MANAGER",
    label: "Plant Manager",
    defaultClearance: "CONFIDENTIAL",
    summary: "Plant management role. Broad operational oversight with supervisory approval authority.",
    read: "ALLOWED",
    investigate: "ALLOWED",
    actuate: "NEEDS_APPROVAL",
    admin: "NEEDS_APPROVAL",
    bulletPoints: [
      "Broad oversight across plant units",
      "Approval authority for critical operational actuation",
      "Read plant records and inspection reports",
      "Administrative changes require verification",
    ],
    actuationExplanation: "Managers can authorize actuation workflows under logged policy checks.",
  },
  AUDITOR: {
    role: "AUDITOR",
    label: "Auditor",
    defaultClearance: "INTERNAL",
    summary: "Compliance & compliance audit role. Read-only access to audit logs and plant runbooks.",
    read: "ALLOWED",
    investigate: "ALLOWED",
    actuate: "BLOCKED",
    admin: "BLOCKED",
    bulletPoints: [
      "Read-only access to compliance & audit logs",
      "Read operating standards and procedures",
      "Zero physical tool actuation authority",
      "Administrative overrides strictly blocked",
    ],
    actuationExplanation: "Auditors possess read-only inspection clearance without execution authority.",
  },
};

export function getLocalizedRolePermission(role: Role, t: (k: any) => string): RolePermissionConfig {
  const base = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.ENGINEER;

  switch (role) {
    case "ENGINEER":
      return {
        ...base,
        label: t("roleEngineerName") || base.label,
        summary: t("roleEngineerSummary") || base.summary,
        actuationExplanation: t("roleEngineerActuation") || base.actuationExplanation,
      };
    case "VIEWER":
      return {
        ...base,
        label: t("roleViewerName") || base.label,
        summary: t("roleViewerSummary") || base.summary,
        actuationExplanation: t("roleViewerActuation") || base.actuationExplanation,
      };
    case "INTERN":
      return {
        ...base,
        label: t("roleInternName") || base.label,
        summary: t("roleInternSummary") || base.summary,
        actuationExplanation: t("roleInternActuation") || base.actuationExplanation,
      };
    case "INSPECTOR":
      return {
        ...base,
        label: t("roleInspectorName") || base.label,
        summary: t("roleInspectorSummary") || base.summary,
        actuationExplanation: t("roleInspectorActuation") || base.actuationExplanation,
      };
    case "AI_OPERATOR":
      return {
        ...base,
        label: t("roleAiOperatorName") || base.label,
        summary: t("roleAiOperatorSummary") || base.summary,
        actuationExplanation: t("roleAiOperatorActuation") || base.actuationExplanation,
      };
    case "ADMIN":
      return {
        ...base,
        label: t("roleAdminName") || base.label,
        summary: t("roleAdminSummary") || base.summary,
        actuationExplanation: t("roleAdminActuation") || base.actuationExplanation,
      };
    case "SECURITY_OFFICER":
      return {
        ...base,
        label: t("roleSecurityOfficerName") || base.label,
        summary: t("roleSecurityOfficerSummary") || base.summary,
        actuationExplanation: t("roleSecurityOfficerActuation") || base.actuationExplanation,
      };
    default:
      return base;
  }
}
