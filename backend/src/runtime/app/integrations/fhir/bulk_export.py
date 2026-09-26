import asyncio
import json
import logging
from enum import Enum
from typing import Dict, Any, AsyncGenerator

logger = logging.getLogger(__name__)


class BulkExportMode(str, Enum):
    """Supported FHIR Bulk Data export modes."""
    PATIENT = "Patient"
    GROUP = "Group"


class BulkExportManager:
    """
    Handles FHIR Bulk Data ($export) operations (SMART Backend Services spec).
    Supports Patient/$export and Group/{id}/$export modes.
    All streaming routes through the shared HttpTransport (stream_lines).
    kickoff → async polling → output manifest → NDJSON stream
    """

    def __init__(self, transport, headers: Dict[str, str]):
        self.transport = transport
        self.headers = {**headers}
        self.headers["Accept"] = "application/fhir+json"
        self.headers["Prefer"] = "respond-async"

    def _build_export_url(
        self,
        base_url: str,
        mode: BulkExportMode,
        group_id: str = None,
    ) -> str:
        """
        Build the correct $export URL based on mode.
        Patient/$export — export all patients the system app can access.
        Group/{group_id}/$export — export a specific group's data.
        Does NOT use the generic Group/all assumption.
        """
        base = base_url.rstrip("/")
        if mode == BulkExportMode.PATIENT:
            return f"{base}/Patient/$export"
        elif mode == BulkExportMode.GROUP:
            if not group_id:
                raise ValueError(
                    "group_id is required for Group/$export mode"
                )
            return f"{base}/Group/{group_id}/$export"
        else:
            raise ValueError(f"Unsupported BulkExportMode: {mode}")

    async def kickoff(
        self,
        base_url: str,
        mode: BulkExportMode = BulkExportMode.PATIENT,
        group_id: str = None,
    ) -> str:
        """Starts the bulk export and returns the polling status endpoint."""
        url = self._build_export_url(base_url, mode, group_id)



        response = await self.transport.get(url, headers=self.headers)

        if response.status_code == 202:
            location = response.headers.get("Content-Location")
            if not location:
                raise ValueError("Bulk export kickoff returned 202 but no Content-Location")
            return location

        raise ValueError(f"Failed to kickoff bulk export. Status: {response.status_code}")

    async def poll_until_complete(
        self, status_url: str, max_attempts: int = 20
    ) -> Dict[str, Any]:
        """Polls the status endpoint until the manifest is ready."""


        attempt = 0
        while attempt < max_attempts:
            attempt += 1
            response = await self.transport.get(status_url, headers=self.headers)

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 202:
                retry_after = int(response.headers.get("Retry-After", 5))
                logger.info(f"Bulk export in progress. Waiting {retry_after}s.")
                await asyncio.sleep(retry_after)
            else:
                raise ValueError(
                    f"Unexpected bulk export status: {response.status_code}"
                )

        raise TimeoutError("Bulk export timed out after max polling attempts")

    async def stream_ndjson(
        self, file_url: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Streams NDJSON output file line-by-line through the shared transport.
        The transport layer enforces timeout, headers, and error classification.
        """


        # Stream via shared transport.stream_lines — no raw httpx client here
        async for line in self.transport.stream_lines(file_url, headers=self.headers):
            yield json.loads(line)
