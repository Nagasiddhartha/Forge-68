"""Deterministic Industrial Calculation Engine for FORGE Control Plane.

All arithmetic is executed deterministically in native Python.
Arbitrary code execution, shell injection, and unregistered calculations are strictly rejected.
"""

from datetime import datetime, timezone
from enum import Enum
import re
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, Field, model_validator


class CalculationType(str, Enum):
    """Registered industrial calculation types."""
    PRESSURE_VARIANCE = "pressure_variance"
    PRESSURE_MARGIN = "pressure_margin"
    CORROSION_PROJECTION = "corrosion_projection"
    THICKNESS_LOSS = "thickness_loss"


# Input models enforcing strictly numeric parameters and rejecting code/scripts

def _check_no_code_injection(val: Any) -> None:
    forbidden_patterns = [
        r"__import__",
        r"\bimport\s+os\b",
        r"\bimport\b",
        r"\beval\b",
        r"\bexec\b",
        r"\bos\.system\b",
        r"\bos\.",
        r"\bsubprocess\b",
        r"\bsh\s+-c\b",
        r"\bbash\s+-c\b",
        r"\bcmd(?:\.exe)?\b",
        r"\bpowershell\b",
        r"\bbash\b",
        r"\bsh\b",
        r"<script\b",
    ]
    text_repr = str(val)
    for pattern in forbidden_patterns:
        if re.search(pattern, text_repr, re.IGNORECASE):
            raise ValueError(f"Security Exception: Suspicious expression detected in calculation payload: '{pattern}'")


class PressureVarianceInputs(BaseModel):
    """Inputs for pressure variance calculation."""
    observed_pressure_bar: float = Field(..., description="Observed operating pressure in bar")
    normal_operating_pressure_bar: float = Field(..., description="Baseline normal operating pressure in bar")

    @model_validator(mode="before")
    @classmethod
    def sanitize(cls, data: Any) -> Any:
        _check_no_code_injection(data)
        return data


class PressureMarginInputs(BaseModel):
    """Inputs for pressure margin to trip limit."""
    trip_pressure_bar: float = Field(..., description="Emergency or trip pressure threshold in bar")
    observed_pressure_bar: float = Field(..., description="Observed operating pressure in bar")

    @model_validator(mode="before")
    @classmethod
    def sanitize(cls, data: Any) -> Any:
        _check_no_code_injection(data)
        return data


class CorrosionProjectionInputs(BaseModel):
    """Inputs for corrosion wall thickness projection."""
    current_thickness_mm: float = Field(..., description="Current measured wall thickness in mm")
    corrosion_rate_mm_year: float = Field(..., description="Corrosion rate in mm per year")
    projection_years: float = Field(..., description="Projection period in years")

    @model_validator(mode="before")
    @classmethod
    def sanitize(cls, data: Any) -> Any:
        _check_no_code_injection(data)
        return data


class ThicknessLossInputs(BaseModel):
    """Inputs for total thickness loss calculation."""
    initial_thickness_mm: float = Field(..., description="Nominal/initial design thickness in mm")
    current_thickness_mm: float = Field(..., description="Current measured thickness in mm")

    @model_validator(mode="before")
    @classmethod
    def sanitize(cls, data: Any) -> Any:
        _check_no_code_injection(data)
        return data


class CalculationRequest(BaseModel):
    """Structured request for deterministic calculation."""
    calculation: str = Field(..., description="Registered calculation type")
    inputs: Dict[str, Any] = Field(default_factory=dict, description="Typed calculation parameters")
    evidence_ids: List[str] = Field(default_factory=list, description="Evidence records grounding the inputs")


class CalculationResult(BaseModel):
    """Deterministic, auditable outcome of an industrial calculation."""
    calculation_id: str = Field(default_factory=lambda: f"calc-{uuid.uuid4().hex[:10]}")
    calculation_type: str = Field(..., description="Type of calculation performed")
    inputs: Dict[str, Any] = Field(..., description="Input parameters used")
    result: float = Field(..., description="Computed numerical result")
    units: str = Field(..., description="Engineering units of the computed result")
    evidence_ids: List[str] = Field(default_factory=list, description="Supporting evidence IDs")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    description: Optional[str] = Field(default=None, description="Technical explanation of the calculation")


class CalculationEngine:
    """Sovereign deterministic calculation engine.

    Executes registered industrial arithmetic directly in Python without model hallucination
    or external API/cloud dependencies.
    """

    @classmethod
    def execute(
        cls,
        calculation: str,
        inputs: Dict[str, Any],
        evidence_ids: Optional[List[str]] = None,
        locale: str = "en",
    ) -> CalculationResult:
        """Validate inputs and compute deterministic engineering result."""
        evidence_ids = evidence_ids or []
        _check_no_code_injection(calculation)
        _check_no_code_injection(inputs)

        # Normalize calculation name
        calc_name = calculation.strip().lower()
        valid_types = {t.value: t for t in CalculationType}

        if calc_name not in valid_types:
            raise ValueError(
                f"Unknown or unregistered calculation: '{calculation}'. "
                f"Registered calculations: {list(valid_types.keys())}"
            )

        calc_type = valid_types[calc_name]

        res: CalculationResult
        if calc_type == CalculationType.PRESSURE_VARIANCE:
            typed_inputs = PressureVarianceInputs(**inputs)
            # observed_pressure - normal_operating_pressure
            val = round(typed_inputs.observed_pressure_bar - typed_inputs.normal_operating_pressure_bar, 4)
            res = CalculationResult(
                calculation_type=calc_type.value,
                inputs=typed_inputs.model_dump(),
                result=val,
                units="bar",
                evidence_ids=evidence_ids,
                description=(
                    f"Pressure variance: observed ({typed_inputs.observed_pressure_bar} bar) - "
                    f"normal ({typed_inputs.normal_operating_pressure_bar} bar) = {val} bar"
                ),
            )

        elif calc_type == CalculationType.PRESSURE_MARGIN:
            typed_margin_inputs = PressureMarginInputs(**inputs)
            # trip_pressure - observed_pressure
            val = round(typed_margin_inputs.trip_pressure_bar - typed_margin_inputs.observed_pressure_bar, 4)
            res = CalculationResult(
                calculation_type=calc_type.value,
                inputs=typed_margin_inputs.model_dump(),
                result=val,
                units="bar",
                evidence_ids=evidence_ids,
                description=(
                    f"Pressure margin to trip: trip threshold ({typed_margin_inputs.trip_pressure_bar} bar) - "
                    f"observed ({typed_margin_inputs.observed_pressure_bar} bar) = {val} bar"
                ),
            )

        elif calc_type == CalculationType.CORROSION_PROJECTION:
            typed_corrosion_inputs = CorrosionProjectionInputs(**inputs)
            # current_thickness - (corrosion_rate * years)
            loss = typed_corrosion_inputs.corrosion_rate_mm_year * typed_corrosion_inputs.projection_years
            val = round(typed_corrosion_inputs.current_thickness_mm - loss, 4)
            res = CalculationResult(
                calculation_type=calc_type.value,
                inputs=typed_corrosion_inputs.model_dump(),
                result=val,
                units="mm",
                evidence_ids=evidence_ids,
                description=(
                    f"Projected wall thickness over {typed_corrosion_inputs.projection_years} years: "
                    f"{typed_corrosion_inputs.current_thickness_mm} mm - ({typed_corrosion_inputs.corrosion_rate_mm_year} mm/yr * "
                    f"{typed_corrosion_inputs.projection_years} yr) = {val} mm"
                ),
            )

        elif calc_type == CalculationType.THICKNESS_LOSS:
            typed_loss_inputs = ThicknessLossInputs(**inputs)
            # initial_thickness - current_thickness
            val = round(typed_loss_inputs.initial_thickness_mm - typed_loss_inputs.current_thickness_mm, 4)
            res = CalculationResult(
                calculation_type=calc_type.value,
                inputs=typed_loss_inputs.model_dump(),
                result=val,
                units="mm",
                evidence_ids=evidence_ids,
                description=(
                    f"Total thickness loss: initial ({typed_loss_inputs.initial_thickness_mm} mm) - "
                    f"current ({typed_loss_inputs.current_thickness_mm} mm) = {val} mm"
                ),
            )
        else:
            raise ValueError(f"Unhandled calculation type: '{calc_type}'")

        if locale and locale.lower() in ("kn", "hi"):
            from app.core.localization import localize_calculation_description
            res.description = localize_calculation_description(
                calc_type=res.calculation_type,
                inputs=res.inputs,
                result=res.result,
                units=res.units,
                locale=locale,
            )

        return res
