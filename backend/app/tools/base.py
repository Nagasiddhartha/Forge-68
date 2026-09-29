"""Base interfaces and metadata definitions for FORGE Industrial Tools."""

from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional, Type
from pydantic import BaseModel, Field

from app.security.models import DataClassification, RiskLevel, Role


class ToolMetadata(BaseModel):
    """Declarative specification for a registered industrial tool."""
    name: str
    version: str
    description: str
    risk_level: RiskLevel
    allowed_roles: List[Role]
    allowed_classifications: List[DataClassification]
    approval_required: bool
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]


class ToolDefinition:
    """Wrapper holding tool specification and execution handler."""

    def __init__(
        self,
        name: str,
        version: str,
        description: str,
        risk_level: RiskLevel,
        allowed_roles: List[Role],
        allowed_classifications: List[DataClassification],
        approval_required: bool,
        input_model: Type[BaseModel],
        output_model: Type[BaseModel],
        handler: Callable[[Any], Any],
    ):
        self.name = name
        self.version = version
        self.description = description
        self.risk_level = risk_level
        self.allowed_roles = allowed_roles
        self.allowed_classifications = allowed_classifications
        self.approval_required = approval_required
        self.input_model = input_model
        self.output_model = output_model
        self.handler = handler

    def to_metadata(self) -> ToolMetadata:
        return ToolMetadata(
            name=self.name,
            version=self.version,
            description=self.description,
            risk_level=self.risk_level,
            allowed_roles=self.allowed_roles,
            allowed_classifications=self.allowed_classifications,
            approval_required=self.approval_required,
            input_schema=self.input_model.model_json_schema(),
            output_schema=self.output_model.model_json_schema(),
        )


class BaseTool(ABC):
    """Abstract Base Class for modular industrial tools."""

    @property
    @abstractmethod
    def definition(self) -> ToolDefinition:
        """Return the tool definition including metadata and handler."""
        pass
