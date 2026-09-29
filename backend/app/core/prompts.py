"""Prompt templates and defensive JSON parser for sovereign model-to-tool reasoning."""

import json
import re
from typing import Any, Dict, List
from app.core.schemas import ModelToolDecision
from app.tools.base import ToolMetadata


TOOL_DECISION_SYSTEM_PROMPT = """You are the reasoning engine of FORGE, a Sovereign Industrial AI Control Plane.
Your task is to determine whether an authorized industrial tool is required to satisfy the user's inquiry.

AVAILABLE TOOLS IN THE SOVEREIGN REGISTRY:
{tools_catalog}

RULES:
1. You MUST respond with ONLY a valid, parseable JSON object matching one of the two formats below.
2. If an authorized tool is needed to retrieve facts, history, or telemetry:
{{
  "action": "tool_call",
  "tool_name": "<exact_tool_name>",
  "arguments": {{
    "<parameter_name>": "<parameter_value>"
  }},
  "reason": "<technical explanation of why this tool is required>"
}}
3. If no tool is required:
{{
  "action": "final",
  "answer": "<direct response>"
}}
4. NEVER output executable code, shell commands, or markdown explanations outside the JSON object.
5. Only select tools from the AVAILABLE TOOLS list. Never fabricate tool names or arbitrary shell commands.
"""

GROUNDED_RESPONSE_SYSTEM_PROMPT = """You are the technical response synthesizer for FORGE Sovereign Industrial AI Control Plane.
Synthesize a clear, professional engineering response to the user's inquiry based STRICTLY on the verified evidence retrieved by the authorized tool.

VERIFIED TOOL EVIDENCE:
- Evidence ID: {evidence_id}
- Source: {source_reference}
- Data Classification: {classification}
- Tool Name: {tool_name}
- Retrieved Data:
{retrieved_data}

GOVERNANCE GUIDELINES:
1. Your response MUST be strictly evidence-grounded in the verified data above.
2. Explicitly distinguish:
   - What the verified evidence confirms.
   - What is not recorded or unverified in the records.
3. NEVER assume, extrapolate, or invent missing equipment history, dates, or inspection findings.
4. Maintain an objective, high-assurance industrial engineering tone.
"""


def build_tools_catalog_description(tools: List[ToolMetadata]) -> str:
    """Format registered tool metadata into a clean machine-readable prompt block."""
    lines = []
    for tool in tools:
        lines.append(f"- Tool: {tool.name} (v{tool.version})")
        lines.append(f"  Description: {tool.description}")
        lines.append(f"  Risk Level: {tool.risk_level.value}")
        lines.append(f"  Input Schema: {json.dumps(tool.input_schema.get('properties', {}))}")
        lines.append(f"  Required Parameters: {json.dumps(tool.input_schema.get('required', []))}")
    return "\n".join(lines)


def parse_model_decision(raw_output: str) -> ModelToolDecision:
    """Defensively parse and validate machine-readable JSON output from local model."""
    if not raw_output or not raw_output.strip():
        raise ValueError("Model returned empty completion.")

    cleaned = raw_output.strip()

    # Strip thinking blocks emitted by reasoning models (e.g. <think>...</think>)
    cleaned = re.sub(r"<think>.*?</think>", "", cleaned, flags=re.DOTALL).strip()

    # Strip markdown code blocks like ```json ... ```
    match_code = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
    if match_code:
        cleaned = match_code.group(1).strip()
    else:
        # Locate outermost JSON braces
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start:end+1].strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as err:
        raise ValueError(f"Model output is not valid JSON: {str(err)}. Raw output: {raw_output[:200]}") from err

    if not isinstance(data, dict):
        raise ValueError(f"Model output JSON must be an object/dict, got {type(data).__name__}.")

    # Pydantic validation (including code injection guard)
    return ModelToolDecision(**data)
