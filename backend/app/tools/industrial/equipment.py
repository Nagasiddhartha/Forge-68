"""Deterministic local demonstration tool: equipment_history.

Operates purely against offline synthetic equipment records (R-204, P-201, E-301).
Zero external connections (no Modbus, no OPC-UA, no external DBs/APIs).
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.security.models import DataClassification, RiskLevel, Role
from app.tools.base import BaseTool, ToolDefinition


# Default in-memory synthetic fixture for air-gapped resilience
SYNTHETIC_EQUIPMENT_DATA: Dict[str, Dict[str, Any]] = {
    "R-204": {
        "equipment_id": "R-204",
        "equipment_type": "Continuous Stirred-Tank Reactor (CSTR)",
        "operating_status": "OPERATIONAL",
        "last_inspection_date": "2026-08-14",
        "inspection_dates": ["2025-02-10", "2025-08-19", "2026-02-22", "2026-08-14"],
        "maintenance_events": [
            {
                "event_id": "MNT-2025-091",
                "date": "2025-08-20",
                "type": "PREVENTIVE",
                "description": "Replaced agitator mechanical shaft seal and pressure relief calibration.",
                "technician": "TECH-44 (Senior Mechanical Specialist)",
            },
            {
                "event_id": "MNT-2026-014",
                "date": "2026-02-25",
                "type": "INSPECTION",
                "description": "Ultrasonic thickness measurement of reactor vessel walls; corrosion rate nominal.",
                "technician": "INSP-12 (NDT Level III)",
            },
        ],
        "previous_findings": [
            "Agitator seal micro-weep observed during Q3-2025 (rectified)",
            "Minor jacket scale accumulation detected; chemical flushes scheduled",
        ],
        "notes": "Primary polymerization vessel. Rated design pressure 16.5 bar at 220°C.",
    },
    "P-201": {
        "equipment_id": "P-201",
        "equipment_type": "Centrifugal Slurry Feed Pump",
        "operating_status": "MAINTENANCE_REQUIRED",
        "last_inspection_date": "2026-09-02",
        "inspection_dates": ["2025-05-11", "2025-11-04", "2026-05-15", "2026-09-02"],
        "maintenance_events": [
            {
                "event_id": "MNT-2025-112",
                "date": "2025-11-05",
                "type": "CORRECTIVE",
                "description": "Impeller replacement due to abrasive catalyst slurry cavitation.",
                "technician": "TECH-09 (Rotating Equipment Lead)",
            },
            {
                "event_id": "MNT-2026-088",
                "date": "2026-09-03",
                "type": "DIAGNOSTIC",
                "description": "High vibration spectrum on drive-end bearing (7.2 mm/s RMS). Bearing grease replenishment performed.",
                "technician": "TECH-31 (Vibration Analyst)",
            },
        ],
        "previous_findings": [
            "Drive-end bearing temperature elevated during high-throughput runs",
            "Cavitation wear on suction flange",
        ],
        "notes": "Suction flow from storage vessel T-102. Critical path pump with cold standby P-202 available.",
    },
    "E-301": {
        "equipment_id": "E-301",
        "equipment_type": "Shell & Tube Exchanger (Effluent Cooler)",
        "operating_status": "OPERATIONAL",
        "last_inspection_date": "2026-07-28",
        "inspection_dates": ["2024-12-01", "2025-06-18", "2025-12-10", "2026-07-28"],
        "maintenance_events": [
            {
                "event_id": "MNT-2025-066",
                "date": "2025-06-20",
                "type": "CLEANING",
                "description": "High-pressure hydroblasting of tube bundle to clear organic fouling.",
                "technician": "TECH-18 (Thermal Maintenance)",
            },
            {
                "event_id": "MNT-2026-071",
                "date": "2026-07-30",
                "type": "TESTING",
                "description": "Helium leak detection performed on tube sheet joints; zero leakage verified.",
                "technician": "INSP-04 (Quality Assurance Lead)",
            },
        ],
        "previous_findings": [
            "Tube sheet joint weeping detected during 2025 turnaround (retorqued to 350 Nm)",
            "Thermal duty efficiency maintained at 94.2% of design baseline",
        ],
        "notes": "Cools reactor effluent stream before separation column C-401.",
    },
    "V-102": {
        "equipment_id": "V-102",
        "equipment_type": "High-Pressure Gas/Liquid Flash Separator Drum",
        "operating_status": "OPERATIONAL",
        "last_inspection_date": "2026-08-10",
        "inspection_dates": ["2025-01-14", "2025-07-20", "2026-01-18", "2026-08-10"],
        "maintenance_events": [
            {
                "event_id": "MNT-2025-042",
                "date": "2025-07-22",
                "type": "INSPECTION",
                "description": "Demister pad internal inspection and ultrasonic thickness survey of vessel head.",
                "technician": "INSP-08 (Vessel Inspector)",
            },
            {
                "event_id": "MNT-2026-055",
                "date": "2026-08-11",
                "type": "CALIBRATION",
                "description": "Level transmitter LT-102 multi-point wet calibration verified against sight glass.",
                "technician": "TECH-14 (Instrumentation Specialist)",
            },
        ],
        "previous_findings": [
            "Demister pad clean with zero hydrocarbon wax foulant",
            "Vessel shell wall thickness 48.2 mm (>44.0 mm retirement minimum)",
        ],
        "notes": "Separates unreacted hydrogen gas recycle stream from liquid cracked hydrocarbon bottoms.",
    },
    "PRV-204": {
        "equipment_id": "PRV-204",
        "equipment_type": "Pilot-Operated Safety Relief Valve",
        "operating_status": "OPERATIONAL",
        "last_inspection_date": "2026-06-15",
        "inspection_dates": ["2024-06-12", "2025-06-14", "2026-06-15"],
        "maintenance_events": [
            {
                "event_id": "MNT-2025-078",
                "date": "2025-06-14",
                "type": "BENCH_TEST",
                "description": "Off-line deadweight pop test verification; pop pressure 42.5 bar certified.",
                "technician": "TECH-03 (Valve Shop Lead)",
            },
            {
                "event_id": "MNT-2026-061",
                "date": "2026-06-15",
                "type": "SEAL_VERIFICATION",
                "description": "Car-seal replacement and physical tamper-lock verified. Dual rupture disc PSE-204 intact.",
                "technician": "INSP-01 (Chief Safety Inspector)",
            },
        ],
        "previous_findings": [
            "Zero seat leakage detected at 38.0 bar hold pressure",
            "ASME Section VIII UV Stamp certification current through 2027",
        ],
        "notes": "Critical overpressure protection for R-204. Setpoint 42.5 bar gauge. Software actuation strictly blocked.",
    },
}


class MaintenanceEvent(BaseModel):
    event_id: str
    date: str
    type: str
    description: str
    technician: str


class EquipmentHistoryInput(BaseModel):
    """Input payload to query equipment history."""
    equipment_id: str = Field(
        ...,
        description="Target industrial equipment tag (e.g. R-204, P-201, E-301, V-102, PRV-204)",
        pattern=r"^[A-Z]{1,3}-[0-9]{3}$"
    )


class EquipmentHistoryOutput(BaseModel):
    """Structured inspection, maintenance, and operating telemetry history."""
    equipment_id: str
    equipment_type: str
    operating_status: str
    last_inspection_date: str
    inspection_dates: List[str]
    maintenance_events: List[MaintenanceEvent]
    previous_findings: List[str]
    notes: str


def _get_equipment_dataset() -> Dict[str, Dict[str, Any]]:
    """Load equipment records from demo fixtures or fallback to memory."""
    fixture_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "demo" / "equipment_records.json"
    if fixture_path.exists():
        try:
            with open(fixture_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return SYNTHETIC_EQUIPMENT_DATA
    return SYNTHETIC_EQUIPMENT_DATA


def execute_equipment_history(input_data: EquipmentHistoryInput) -> EquipmentHistoryOutput:
    """Execute deterministic equipment history lookup."""
    dataset = _get_equipment_dataset()
    normalized_id = input_data.equipment_id.strip().upper()

    if normalized_id not in dataset:
        raise ValueError(
            f"Equipment ID '{normalized_id}' not found in local registry. "
            f"Available equipment tags: {list(dataset.keys())}"
        )

    record = dataset[normalized_id]
    return EquipmentHistoryOutput(**record)


class EquipmentHistoryTool(BaseTool):
    """Sovereign Equipment History Demonstration Tool."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="equipment_history",
            version="1.0.0",
            description="Retrieve verified maintenance, inspection, and operating telemetry history for plant equipment.",
            risk_level=RiskLevel.LOW,
            allowed_roles=[Role.ENGINEER, Role.INSPECTOR, Role.ADMIN],
            allowed_classifications=[DataClassification.INTERNAL, DataClassification.CONFIDENTIAL],
            approval_required=False,
            input_model=EquipmentHistoryInput,
            output_model=EquipmentHistoryOutput,
            handler=execute_equipment_history,
        )


class PressureReliefCalibrationInput(BaseModel):
    """Input payload for emergency pressure relief valve calibration."""
    equipment_id: str = Field(
        ...,
        description="Target industrial equipment tag (e.g. R-204)",
        pattern=r"^[A-Z]-[0-9]{3}$"
    )
    target_setpoint_bar: float = Field(
        ...,
        description="Calibrated relief valve opening pressure setpoint in bar gauge"
    )
    technician_id: Optional[str] = Field(
        default="TECH-UNAUTHORIZED",
        description="Technician ID requesting calibration"
    )


class PressureReliefCalibrationOutput(BaseModel):
    """Output confirmation of relief valve calibration."""
    equipment_id: str
    status: str
    calibrated_setpoint_bar: float
    message: str


# Deterministic execution tracker to mathematically prove denied actions NEVER run
CALIBRATION_EXECUTION_COUNTER = {"count": 0}


def execute_pressure_relief_calibration(input_data: PressureReliefCalibrationInput) -> PressureReliefCalibrationOutput:
    """Execute pressure relief valve calibration (Critical risk)."""
    CALIBRATION_EXECUTION_COUNTER["count"] += 1
    return PressureReliefCalibrationOutput(
        equipment_id=input_data.equipment_id,
        status="CALIBRATED",
        calibrated_setpoint_bar=input_data.target_setpoint_bar,
        message=f"Pressure relief valve PRV-204 calibrated to setpoint {input_data.target_setpoint_bar} bar gauge.",
    )


class PressureReliefCalibrationTool(BaseTool):
    """Critical-risk industrial tool requiring supervisor approval and restricted roles."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="calibrate_pressure_relief_valve",
            version="1.0.0",
            description="Calibrate the emergency pressure relief valve (PRV-204) on Reactor R-204. High-risk actuation requiring explicit supervisor approval.",
            risk_level=RiskLevel.CRITICAL,
            allowed_roles=[Role.SECURITY_OFFICER, Role.ADMIN],
            allowed_classifications=[DataClassification.RESTRICTED, DataClassification.CRITICAL],
            approval_required=True,
            input_model=PressureReliefCalibrationInput,
            output_model=PressureReliefCalibrationOutput,
            handler=execute_pressure_relief_calibration,
        )


class EmergencyShutdownInput(BaseModel):
    """Input payload for emergency plant loop trip."""
    equipment_id: str = Field(..., description="Target industrial loop or reactor tag (e.g. R-204)")
    initiator_id: Optional[str] = Field(default="OPERATOR-EMERGENCY", description="Initiating operator badge ID")
    reason: Optional[str] = Field(default="Critical parameter excursion", description="Operational trip justification")


class EmergencyShutdownOutput(BaseModel):
    """Output confirmation of emergency trip actuation."""
    equipment_id: str
    status: str
    trip_timestamp: str
    isolated_valves: List[str]
    message: str


def execute_emergency_shutdown(input_data: EmergencyShutdownInput) -> EmergencyShutdownOutput:
    """Execute emergency reaction loop trip (Critical risk)."""
    from datetime import datetime, timezone
    return EmergencyShutdownOutput(
        equipment_id=input_data.equipment_id,
        status="EMERGENCY_SHUTDOWN_EXECUTED",
        trip_timestamp=datetime.now(timezone.utc).isoformat(),
        isolated_valves=["QCV-204A", "XV-204A", "XV-204B", "BDV-204"],
        message=f"Emergency trip initiated for {input_data.equipment_id}. Monomer feed isolated, reaction quench activated, blowdown valve BDV-204 opened.",
    )


class EmergencyShutdownTool(BaseTool):
    """Critical-risk industrial actuation tool requiring supervisor approval and restricted roles."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="emergency_shutdown",
            version="1.0.0",
            description="Initiate emergency plant loop trip for Reactor R-204. Isolate monomer feed and trip reaction loop. Requires ADMIN or SECURITY_OFFICER with supervisor approval.",
            risk_level=RiskLevel.CRITICAL,
            allowed_roles=[Role.SECURITY_OFFICER, Role.ADMIN],
            allowed_classifications=[DataClassification.CRITICAL],
            approval_required=True,
            input_model=EmergencyShutdownInput,
            output_model=EmergencyShutdownOutput,
            handler=execute_emergency_shutdown,
        )


