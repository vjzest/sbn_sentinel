import httpx
import asyncio
import logging
from typing import Dict, Any, AsyncGenerator

logger = logging.getLogger(__name__)


class RateLimitedException(Exception):
    def __init__(self, retry_after: int):
        self.retry_after = retry_after
        super().__init__(f"Rate limited. Retry after {retry_after}s")


class HttpTransport:
    """
    Shared transport layer with exponential backoff, jitter, and rate-limit handling.
    All outbound HTTP (including bulk streaming) must pass through this layer
    to ensure unified timeout, observability, and error classification.
    """

    def __init__(self, timeout: int = 30):
        self.timeout = timeout

    async def get(
        self,
        url: str,
        headers: Dict[str, str] = None,
        params: Dict[str, Any] = None,
    ) -> httpx.Response:
        return await self._request("GET", url, headers=headers, params=params)

    async def post(
        self,
        url: str,
        data: Dict[str, Any] = None,
        headers: Dict[str, str] = None,
    ) -> httpx.Response:
        return await self._request("POST", url, data=data, headers=headers)

    async def stream_lines(
        self,
        url: str,
        headers: Dict[str, str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Streams a remote resource line-by-line through the shared transport.
        Used for NDJSON Bulk Data output files.
        Enforces shared timeout and authentication headers.
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream("GET", url, headers=headers or {}) as response:
                if response.status_code >= 400:
                    raise Exception(
                        f"Bulk stream HTTP error {response.status_code} for {url}"
                    )
                async for line in response.aiter_lines():
                    if line.strip():
                        yield line

    async def _request(self, method: str, url: str, **kwargs) -> httpx.Response:
        max_attempts = 3
        attempt = 0
        backoff = 1.0

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            while attempt < max_attempts:
                attempt += 1
                try:
                    response = await client.request(method, url, **kwargs)

                    if response.status_code == 429:
                        retry_after = int(response.headers.get("Retry-After", backoff))
                        logger.warning(f"Rate limited. Waiting {retry_after}s.")
                        await asyncio.sleep(retry_after)
                        backoff *= 2
                        continue

                    if response.status_code >= 500:
                        logger.warning(
                            f"Server error {response.status_code}. Retrying..."
                        )
                        await asyncio.sleep(backoff)
                        backoff *= 2
                        continue

                    response.raise_for_status()
                    return response

                except httpx.RequestError as e:
                    if attempt >= max_attempts:
                        raise e
                    await asyncio.sleep(backoff)
                    backoff *= 2

            raise Exception("Max retries exceeded")
