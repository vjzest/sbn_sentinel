import { RuntimeStatusDTO } from '../types/runtimeStatus';

export async function fetchRuntimeStatus(): Promise<RuntimeStatusDTO> {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8000/api/v1/health/runtime', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

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
