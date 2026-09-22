import { fetchWithAuth } from './fetchWithAuth';
import { RuntimeStatusDTO } from '../types/runtimeStatus';

export async function fetchRuntimeStatus(): Promise<RuntimeStatusDTO> {
  const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/health/runtime`);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    // D7 requires us not to invent failure states, but if the API itself fails to return,
    // we must reflect an UNAVAILABLE technical state.
    throw new Error("Failed to fetch authoritative runtime status");
  }

  const data = await response.json();
  return data as RuntimeStatusDTO;
}
