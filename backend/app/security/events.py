"""Auditable Execution Event schemas and event sink for FORGE."""

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.security.models import DataClassification, PolicyDecisionType, RiskLevel, Role


class ExecutionStatus(str, Enum):
    """Execution status for auditable events."""
    EXECUTED = "EXECUTED"
    BLOCKED_BY_POLICY = "BLOCKED_BY_POLICY"
    FAILED = "FAILED"


class ExecutionEvent(BaseModel):
    """Structured, auditable event produced for every tool request and policy evaluation."""
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    requester: str
    role: Role
    tool: str
    tool_version: str = "unknown"
    classification: DataClassification
    risk: RiskLevel
    decision: PolicyDecisionType
    reason: str
    approval_required: bool
    approved: bool = False
    execution_status: ExecutionStatus
    parameters: Optional[Dict[str, Any]] = None
    output_summary: Optional[str] = None


class ExecutionEventSink:
    """In-memory event buffer providing a typed interface for future audit subsystem ingestion."""

    def __init__(self, max_events: int = 1000):
        self._events: List[ExecutionEvent] = []
        self._max_events = max_events

    def record_event(self, event: ExecutionEvent) -> ExecutionEvent:
        if len(self._events) >= self._max_events:
            self._events.pop(0)
        self._events.append(event)
        return event

    def get_events(self, limit: int = 100) -> List[ExecutionEvent]:
        return list(reversed(self._events[-limit:]))

    def clear(self) -> None:
        self._events.clear()


# Global default sink
audit_event_sink = ExecutionEventSink()
