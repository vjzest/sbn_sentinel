import logging
from typing import Any

logger = logging.getLogger(__name__)


class SentinelStateTransitionEngine:
    """
    SESR-012C Compliance: Sentinel State Transition Engine (SSTE)
    Authoritative owner of permitted governed state transitions.
    """

    # Define valid states and their allowed next states for basic entities
    # This represents the minimum missing transition-authority contract.
    VALID_TRANSITIONS = {
        "OperationalEvent": {
            "Queued": ["Processing", "Failed", "DeadLetter"],
            "Processing": ["Completed", "Failed", "Retry"],
            "Retry": ["Processing", "Failed", "DeadLetter"],
            "Completed": [],
            "Failed": ["DeadLetter"],
            "DeadLetter": []
        },
        "Connector": {
            "Healthy": ["Synchronizing", "Warning", "Error"],
            "Warning": ["Synchronizing", "Healthy", "Error"],
            "Error": ["Synchronizing", "Healthy"],
            "Synchronizing": ["Healthy", "Warning", "Error"]
        }
    }

    @classmethod
    def permit_transition(cls, entity_type: str, current_state: str, requested_state: str) -> bool:
        """
        Validates if a state transition is governed and permitted.
        """
        # If entity type is unmapped in this minimal contract, permit it with a warning
        if entity_type not in cls.VALID_TRANSITIONS:
            logger.warning(
                f"[SSTE] Unmapped entity type '{entity_type}'. Permitting transition to '{requested_state}'.")
            return True

        allowed_states = cls.VALID_TRANSITIONS[entity_type].get(current_state, [])
        if requested_state in allowed_states:
            logger.info(
                f"[SSTE] Permitted {entity_type} transition: {current_state} -> {requested_state}")
            return True

        # Optional: For initial V1 flexibility, if a state isn't explicitly defined
        # in the source state but requested state exists, we log a violation but might
        # allow it in a soft-enforce mode. Strict enforce rejects it.
        logger.error(
            f"[SSTE] REJECTED {entity_type} transition: {current_state} -> {requested_state} is not permitted.")
        return False

    @classmethod
    def execute_transition(cls, entity: Any, entity_type: str, requested_state: str) -> bool:
        """
        Convenience method to request a transition on an object holding a 'state' or 'status' attribute.
        """
        # Check attribute name (often 'state' or 'status')
        current_state = None
        state_attr = None
        if hasattr(entity, 'state'):
            current_state = getattr(entity, 'state')
            state_attr = 'state'
        elif hasattr(entity, 'status'):
            current_state = getattr(entity, 'status')
            state_attr = 'status'
        else:
            logger.warning(f"[SSTE] Entity {entity_type} lacks state/status attribute.")
            return False

        if not current_state:
            # If no current state, assume it's initialization and allow
            setattr(entity, state_attr, requested_state)
            return True

        if cls.permit_transition(entity_type, current_state, requested_state):
            setattr(entity, state_attr, requested_state)
            return True

        return False


sste = SentinelStateTransitionEngine()
