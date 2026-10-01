"""Sovereign Prompt-Security Guard and Untrusted Data Boundary.

Detects indirect and direct prompt injection patterns, quarantining adversarial
instructions as inert, passive DATA in accordance with FORGE security principles.
"""

import re
from typing import List, Optional

# Standard adversarial instruction patterns targeting industrial AI agents
INJECTION_PATTERNS = [
    r"ignore\s+(?:all\s+)?previous\s+instructions",
    r"disregard\s+(?:all\s+)?(?:previous\s+)?instructions",
    r"system\s+override",
    r"bypass\s+policy(?:\s+gateway)?",
    r"bypass\s+safety(?:\s+checks)?",
    r"execute\s+(?:the\s+)?(?:maintenance\s+|actuation\s+|valve\s+|arbitrary\s+)?tool",
    r"administrative\s+override",
    r"grant\s+root\s+access",
    r"disable\s+safety\s+interlocks",
]

COMPILED_PATTERNS: List[re.Pattern] = [
    re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS
]


def detect_prompt_injection(text: Optional[str]) -> Optional[str]:
    """Scan text for prompt injection, policy bypass, or adversarial override patterns.

    Returns the matched pattern substring if detected, or None if clean.
    """
    if not text:
        return None

    for pattern in COMPILED_PATTERNS:
        match = pattern.search(text)
        if match:
            return match.group(0)

    return None
