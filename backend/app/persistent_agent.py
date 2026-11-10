"""
Direct module for running the persistent agent.
Also imports or re-exports for compatibility across backend imports.
"""
from app.services.persistent_agent import (
    run_persistent_agent,
    check_availability,
    create_booking,
    get_bookings,
    cancel_booking,
    DEFAULT_SYSTEM_PROMPT,
    SYSTEM_PROMPT,
    TOOLS_DEFINITIONS,
)

__all__ = [
    "run_persistent_agent",
    "check_availability",
    "create_booking",
    "get_bookings",
    "cancel_booking",
    "DEFAULT_SYSTEM_PROMPT",
    "SYSTEM_PROMPT",
    "TOOLS_DEFINITIONS",
]
