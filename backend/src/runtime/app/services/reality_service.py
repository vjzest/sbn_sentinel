import asyncio
from typing import List
from datetime import datetime, timezone
from app.schemas.reality import ConnectorHealthResponse


class RealityService:
    """
    Subsystem 000: Reality Connectors Service.
    V1 Scope: Practice Fusion EHR is the ONLY ACTIVE production connector.
    Other EHR connectors (Epic, Cerner, Athena) remain in registry as FUTURE (Disabled).
    """

    @staticmethod
    async def get_all_connectors_health() -> List[ConnectorHealthResponse]:
        now_str = datetime.now(timezone.utc).isoformat()
        return [
            ConnectorHealthResponse(
                id="conn_ehr_pf",
                name="Practice Fusion EHR",
                status="Connected",  # ACTIVE V1 PRODUCTION CONNECTOR
                latency_ms=38,
                last_sync=now_str
            ),
            ConnectorHealthResponse(
                id="conn_tel_twilio",
                name="Twilio Voice & SMS Gateway",
                status="Connected",  # ACTIVE V1 COMMUNICATIONS GATEWAY
                latency_ms=18,
                last_sync=now_str
            ),
            ConnectorHealthResponse(
                id="conn_ehr_epic",
                name="Epic Systems EHR",
                status="FUTURE (Disabled)",  # FUTURE ROADMAP - INACTIVE IN V1
                latency_ms=0,
                last_sync="Roadmap V2"
            ),
            ConnectorHealthResponse(
                id="conn_ehr_cerner",
                name="Cerner Millennium",
                status="FUTURE (Disabled)",  # FUTURE ROADMAP - INACTIVE IN V1
                latency_ms=0,
                last_sync="Roadmap V2"
            ),
            ConnectorHealthResponse(
                id="conn_ehr_athena",
                name="AthenaHealth API",
                status="FUTURE (Disabled)",  # FUTURE ROADMAP - INACTIVE IN V1
                latency_ms=0,
                last_sync="Roadmap V2"
            )
        ]

    @staticmethod
    async def trigger_sync(connector_id: str) -> bool:
        if connector_id in ["conn_ehr_epic", "conn_ehr_cerner", "conn_ehr_athena"]:
            return False  # Future connectors disabled at runtime
        await asyncio.sleep(1)
        return True


reality_service = RealityService()
