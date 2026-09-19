import React, { useEffect, useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2,
  FileText
} from 'lucide-react';
import { 
  RecommendationReviewDTO, 
  fetchRecommendationReview, 
  submitHumanDecision 
} from '@/utils/decisionApi';

interface RecommendationReviewProps {
  signalId: string;
  onViewBasis?: (evaluationId: string) => void;
}

export const RecommendationReview: React.FC<RecommendationReviewProps> = ({ 
  signalId, 
  onViewBasis 
}) => {
  const [data, setData] = useState<RecommendationReviewDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<string>('');
  const [reason, setReason] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchRecommendationReview(signalId);
        if (mounted) {
          setData(result);
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load recommendation');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [signalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.recommendation || !selectedDecision) return;
    
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitHumanDecision({
        recommendationId: data.recommendation.recommendation_id,
        decisionType: selectedDecision,
        reason: reason
      });
      // Re-fetch to get authoritative receipt
      const refreshed = await fetchRecommendationReview(signalId);
      setData(refreshed);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-[20px] border border-white/5">
        <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin mb-4" />
        <span className="text-white/60 text-sm">Retrieving Governed Recommendation...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[20px] flex gap-4">
        <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
        <div>
          <h3 className="text-white font-medium mb-1">Recommendation Unavailable</h3>
          <p className="text-red-200/70 text-sm">{error || 'Could not resolve authoritative recommendation.'}</p>
        </div>
      </div>
    );
  }

  const { recommendation, authority, current_decision, technical_state } = data;

  if (technical_state !== 'ready' || !recommendation) {
    return (
      <div className="p-6 bg-[#1a1525] border border-white/10 rounded-[20px] flex gap-4">
        <AlertCircle className="w-6 h-6 text-yellow-400 shrink-0" />
        <div>
          <h3 className="text-white font-medium mb-1">Recommendation {technical_state}</h3>
          <p className="text-white/60 text-sm">
            {technical_state === 'unauthorized' 
              ? 'You do not have the required authority to view this recommendation.'
              : 'The authoritative recommendation cannot be definitively resolved.'}
          </p>
        </div>
      </div>
    );
  }

  const requiresReason = Boolean(selectedDecision && authority.reason_required_for?.includes(selectedDecision));

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Recommendation Presentation */}
      <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-[20px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <ShieldCheck className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider ${
                recommendation.status === 'ACTIVE' 
                  ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30'
                  : 'bg-white/10 text-white/60'
              }`}>
                {recommendation.status}
              </div>
              <div className="px-2.5 py-1 bg-white/5 rounded-full text-xs text-white/70 border border-white/10">
                Priority: {recommendation.priority}
              </div>
            </div>
            
            {onViewBasis && (
              <button 
                onClick={() => onViewBasis(recommendation.rule_evaluation_id)}
                className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:text-white transition-colors"
                type="button"
              >
                <FileText className="w-4 h-4" />
                <span>Why / Basis</span>
              </button>
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2 leading-tight">
            Authoritative Recommendation
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-6 font-light">
            {recommendation.content}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Clock className="w-3.5 h-3.5" />
            <span>Generated: {new Date(recommendation.generated_at).toLocaleString()}</span>
            <span className="mx-2">•</span>
            <span className="font-mono text-[10px]">ID: {recommendation.recommendation_id.substring(0,8)}...</span>
          </div>
        </div>
      </div>

      {/* 2. Human Decision Block */}
      {current_decision ? (
        // Render Persisted Decision Receipt
        <div className="p-6 bg-black/30 border border-green-500/20 rounded-[20px]">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-medium text-white">Decision Recorded</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">Decision Type</span>
              <span className="text-white font-medium">{current_decision.decision_type}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">Status</span>
              <span className="text-white font-medium">{current_decision.status}</span>
            </div>
            {current_decision.decision_timestamp && (
              <div className="flex justify-between items-center py-2">
                <span className="text-white/50 text-sm">Recorded At</span>
                <span className="text-white text-sm">{new Date(current_decision.decision_timestamp).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Render Decision Controls
        <div className="p-6 bg-black/20 border border-white/10 rounded-[20px]">
          <h3 className="text-lg font-medium text-white mb-4">Human Decision</h3>
          
          {authority.state !== 'AUTHORIZED' ? (
            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-[12px]">
              <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Not Authorized</p>
                <p className="text-yellow-200/70 text-sm mt-1">
                  You do not have the required authority to record a decision for this recommendation.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/80">Select Decision</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {authority.allowed_decisions.map(type => (
                    <label 
                      key={type}
                      className={`flex items-center p-4 border rounded-[12px] cursor-pointer transition-all ${
                        selectedDecision === type 
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' 
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      } ${submitting ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <input 
                        type="radio" 
                        name="decisionType" 
                        value={type} 
                        checked={selectedDecision === type}
                        onChange={(e) => setSelectedDecision(e.target.value)}
                        className="sr-only"
                        disabled={submitting}
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${
                        selectedDecision === type ? 'border-[var(--color-accent)]' : 'border-white/40'
                      }`}>
                        {selectedDecision === type && <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />}
                      </div>
                      <span className="text-white font-medium text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {requiresReason && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  <label className="block text-sm font-medium text-white/80">
                    Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    disabled={submitting}
                    className="w-full bg-black/40 border border-white/10 rounded-[12px] p-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all min-h-[100px] resize-y custom-scrollbar"
                    placeholder={`Please provide justification for ${selectedDecision}...`}
                  />
                </div>
              )}

              {submitError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[8px] text-red-200 text-sm">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedDecision || (requiresReason && !reason.trim()) || submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-[12px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#120524] focus:ring-[var(--color-accent)]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>SUBMITTING...</span>
                  </>
                ) : (
                  <span>RECORD DECISION</span>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
