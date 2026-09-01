import logging

logger = logging.getLogger(__name__)


class ContextValidator:
    """
    AIS-002: Context Validator
    Evaluates evidence completeness, freshness, and conflicts.
    Incomplete contexts are generated but clearly marked.
    """

    def __init__(self, db_session):
        self.db = db_session

    async def validate(self, context_package: dict) -> dict:
        """
        Takes an assembled Decision Context Package and validates its quality.
        Modifies the package in-place and returns it.
        """
        logger.info(
            f"[{context_package['identity']['context_id']}] ContextValidator: Validating package")

        # 1. Missing Evidence Detection
        missing = self._detect_missing(context_package["evidence"]["used"])
        context_package["evidence"]["missing"] = missing

        # 2. Conflict Detection
        conflicts = self._detect_conflicts(context_package["evidence"]["used"])
        context_package["evidence"]["conflicts"] = conflicts

        # 3. Freshness Evaluation
        freshness = self._evaluate_freshness(context_package["evidence"]["used"])
        context_package["evidence"]["freshness"] = freshness

        # 4. Context Quality Evaluation
        if len(missing) > 0 or len(conflicts) > 0:
            context_package["governance"]["sufficiency_status"] = "Incomplete/Conflicting"
            # AIS-002: "Incomplete contexts should still be generated but clearly marked."
        else:
            context_package["governance"]["sufficiency_status"] = "Sufficient"

        return context_package

    def _detect_missing(self, evidence: list) -> list:
        # P0-01: Actually detect missing core entities based on available facts.
        found_entities = {
            ev["canonical_entity"] if isinstance(
                ev,
                dict) else getattr(
                ev,
                "canonical_entity",
                None) for ev in evidence}
        missing = []
        if "Appointment" not in found_entities and "OperationalEvent" not in found_entities:
            missing.append("No primary contextual entity (Appointment/Event) found in evidence.")
        return missing

    def _detect_conflicts(self, evidence: list) -> list:
        # P0-01: Detect if two evidence records assert conflicting facts for the same key.
        facts = {}
        conflicts = []
        for ev in evidence:
            key = ev["fact_key"] if isinstance(ev, dict) else getattr(ev, "fact_key", None)
            val = ev["fact_value"] if isinstance(ev, dict) else getattr(ev, "fact_value", None)
            if key and val:
                if key in facts and facts[key] != val:
                    conflicts.append(f"Conflict on {key}: {facts[key]} vs {val}")
                facts[key] = val
        return conflicts

    def _evaluate_freshness(self, evidence: list) -> dict:
        from datetime import datetime, timedelta
        # P0-01: Detect stale evidence (older than 24 hours).
        is_stale = False
        stale_records = []
        now = datetime.utcnow()
        for ev in evidence:
            ts = ev.get("retrieval_timestamp") if isinstance(
                ev, dict) else getattr(
                ev, "retrieval_timestamp", None)
            if ts and isinstance(ts, datetime):
                if (now - ts) > timedelta(hours=24):
                    is_stale = True
                    stale_records.append(str(ev.get("evidence_id") if isinstance(
                        ev, dict) else getattr(ev, "evidence_id", "Unknown")))
        return {"is_stale": is_stale, "stale_records": stale_records}
