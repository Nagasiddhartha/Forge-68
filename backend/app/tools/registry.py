"""Sovereign Tool Registry for FORGE Industrial AI Control Plane.

Enforces:
- Explicit typed registration
- Strict schema validation
- Rejection of unknown tools
- Zero execution of arbitrary code or shell commands
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import ValidationError

from app.tools.base import BaseTool, ToolDefinition, ToolMetadata
from app.tools.industrial.equipment import (
    EmergencyShutdownTool,
    EquipmentHistoryTool,
    PressureReliefCalibrationTool,
)


class ToolRegistry:
    """Registry maintaining authorized sovereign industrial tools."""

    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}

    def register(self, tool: Union[BaseTool, ToolDefinition]) -> None:
        """Register an industrial tool definition with typed input/output models."""
        definition = tool.definition if isinstance(tool, BaseTool) else tool
        if not definition.name:
            raise ValueError("Tool definition must have a valid non-empty name.")
        self._tools[definition.name] = definition

    def get(self, name: str) -> Optional[ToolDefinition]:
        """Look up tool by name. Returns None for unregistered tools."""
        return self._tools.get(name)

    def is_registered(self, name: str) -> bool:
        """Check if tool name is known in registry."""
        return name in self._tools

    def list_tools(self) -> List[ToolMetadata]:
        """List metadata schemas of all registered tools."""
        return [tool.to_metadata() for tool in self._tools.values()]

    def execute_tool(self, name: str, parameters: Dict[str, Any]) -> Any:
        """Validate input parameters against typed schema and execute the registered tool handler."""
        tool = self.get(name)
        if not tool:
            raise KeyError(f"Tool '{name}' is not registered in the sovereign tool registry.")

        # Strict Pydantic schema validation
        try:
            validated_input = tool.input_model(**parameters)
        except ValidationError as e:
            raise ValueError(f"Invalid parameters for tool '{name}': {str(e)}") from e

        # Execute isolated typed handler
        result = tool.handler(validated_input)

        # Validate output schema
        if isinstance(result, tool.output_model):
            return result
        return tool.output_model(**result)


# Global default registry initialized with safe demonstration tool and critical-risk tool
tool_registry = ToolRegistry()
tool_registry.register(EquipmentHistoryTool())
tool_registry.register(PressureReliefCalibrationTool())
tool_registry.register(EmergencyShutdownTool())

