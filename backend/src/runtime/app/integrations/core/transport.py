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
        Enforces shared timeout, jitter, and retry behavior.
        """
        max_attempts = 3
        attempt = 0
        backoff = 1.0
        import random

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            while attempt < max_attempts:
                attempt += 1
                try:
                    async with client.stream("GET", url, headers=headers or {}) as response:
                        if response.status_code == 429:
                            retry_after = int(response.headers.get("Retry-After", backoff))
                            delay = retry_after + random.uniform(0, retry_after * 0.2)
                            logger.warning(f"Rate limited. Waiting {delay:.2f}s.")
                            await asyncio.sleep(delay)
                            backoff *= 2
                            continue

                        if response.status_code >= 500:
                            delay = backoff + random.uniform(0, backoff * 0.2)
                            logger.warning(
                                f"Server error {response.status_code}. Retrying in {delay:.2f}s..."
                            )
                            await asyncio.sleep(delay)
                            backoff *= 2
                            continue

                        response.raise_for_status()
                        async for line in response.aiter_lines():
                            if line.strip():
                                yield line
                        return

                except httpx.RequestError as e:
                    if attempt >= max_attempts:
                        raise e
                    delay = backoff + random.uniform(0, backoff * 0.2)
                    await asyncio.sleep(delay)
                    backoff *= 2

            raise Exception("Max retries exceeded for stream")

    async def _request(self, method: str, url: str, **kwargs) -> httpx.Response:
        max_attempts = 3
        attempt = 0
        backoff = 1.0
        import random

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            while attempt < max_attempts:
                attempt += 1
                try:
                    response = await client.request(method, url, **kwargs)

                    if response.status_code == 429:
                        retry_after = int(response.headers.get("Retry-After", backoff))
                        delay = retry_after + random.uniform(0, retry_after * 0.2)
                        logger.warning(f"Rate limited. Waiting {delay:.2f}s.")
                        await asyncio.sleep(delay)
                        backoff *= 2
                        continue

                    if response.status_code >= 500:
                        delay = backoff + random.uniform(0, backoff * 0.2)
                        logger.warning(
                            f"Server error {response.status_code}. Retrying in {delay:.2f}s..."
                        )
                        await asyncio.sleep(delay)
                        backoff *= 2
                        continue

                    response.raise_for_status()
                    return response

                except httpx.RequestError as e:
                    if attempt >= max_attempts:
                        raise e
                    delay = backoff + random.uniform(0, backoff * 0.2)
                    await asyncio.sleep(delay)
                    backoff *= 2

            raise Exception("Max retries exceeded")
