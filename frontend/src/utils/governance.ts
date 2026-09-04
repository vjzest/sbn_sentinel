import { fetchWithAuth } from './fetchWithAuth';

export interface GovernanceExecutionResult {
  status: 'approved' | 'blocked' | 'error';
  decisionId?: string;
  actionId?: string;
  attemptId?: string;
  message?: string;
}

export const executeGovernedRecommendation = async (
  recommendationId: string,
  actionType: string = "UPDATE_OPERATIONAL_STATUS", // Supported action
  targetReference: string
): Promise<GovernanceExecutionResult> => {
  try {
    // Step 1: Record Human Decision
    const decisionRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recommendation_id: recommendationId,
        decision_type: "APPROVED"
      })
    });
    
    if (!decisionRes.ok) {
       return { status: 'error', message: 'Failed to record decision.' };
    }
    
    const decisionData = await decisionRes.json();
    const decisionId = decisionData.decision_id;

    // Step 2: Create Action
    const actionRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision_id: decisionId,
        action_type: actionType,
        target_reference: targetReference,
        parameters: {}
      })
    });

    if (!actionRes.ok) {
       return { status: 'error', message: 'Failed to create action.', decisionId };
    }

    const actionData = await actionRes.json();
    const actionId = actionData.action_id;

    // Step 3: Execute Action
    const execRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/actions/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_id: actionId
      })
    });
    
    const execData = await execRes.json();
    
    if (!execRes.ok) {
      if (execRes.status === 409 || execData.detail?.includes('blocked') || execData.detail?.includes('BLOCKED')) {
        return { status: 'blocked', message: 'Action execution blocked.', decisionId, actionId };
      }
      return { status: 'error', message: 'Action execution failed.', decisionId, actionId };
    }
    
    return { 
      status: 'approved', 
      decisionId, 
      actionId, 
      attemptId: execData.attempt_id,
      message: execData.message
    };
    
  } catch (e) {
    console.error("Failed to execute action sequence:", e);
    return { status: 'error', message: 'Network or unexpected error.' };
  }
};
