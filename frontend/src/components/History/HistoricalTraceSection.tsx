import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { ProgressiveSection } from '../GovernedUI/ProgressiveSection';
import { getHistoricalJourney, reproduceDecision } from '../../utils/history';
import { HistoricalContextResponse, ReproductionResult } from '../../types/history';
import { HistorySummary } from './HistorySummary';
import { HistoricalBindings } from './HistoricalBindings';
import { AuditTimeline } from './AuditTimeline';
import { ReproductionStatus } from './ReproductionStatus';
import { ReproductionDifference } from './ReproductionDifference';
import { DiagnosticDetail } from './DiagnosticDetail';
import { MissingDependencyNotice } from './MissingDependencyNotice';

interface HistoricalTraceSectionProps {
    journeyId: string;
}

export const HistoricalTraceSection: React.FC<HistoricalTraceSectionProps> = ({ journeyId }) => {
    const [context, setContext] = useState<HistoricalContextResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reproductionResult, setReproductionResult] = useState<ReproductionResult | null>(null);
    const [reproducing, setReproducing] = useState(false);

    useEffect(() => {
        const loadHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getHistoricalJourney(journeyId);
                setContext(data);
                
                // If it's not ambiguous, we can auto-trigger reproduction on the first recommendation
                if (data.technical_state === 'valid' && data.bindings.recommendations.length > 0) {
                    setReproducing(true);
                    try {
                        const repro = await reproduceDecision(data.bindings.recommendations[0].recommendation_id);
                        setReproductionResult(repro);
                    } catch (e) {
                        console.error("Reproduction failed", e);
                    } finally {
                        setReproducing(false);
                    }
                }
            } catch (err: any) {
                console.error("History fetch error:", err);
                setError(err.message || "Failed to load historical trace");
            } finally {
                setLoading(false);
            }
        };

        if (journeyId) {
            loadHistory();
        }
    }, [journeyId]);

    const dataState = loading ? 'loading' : error ? 'unavailable' : context ? 'ready' : 'unavailable';

    return (
        <ProgressiveSection
            id="historical-trace"
            title="D8 Historical Trace & Reproducibility"
            icon={<History className="w-4 h-4 text-pink-400" />}
            defaultExpanded={false}
            dataState={dataState}
            dataStateMessage={error || 'No historical trace available'}
        >
            {context && (
                <div className="space-y-4 pt-2">
                    <HistorySummary context={context} />
                    
                    {context.technical_state !== 'ambiguous' && (
                        <>
                            <HistoricalBindings bindings={context.bindings} />
                            <AuditTimeline bindings={context.bindings} />
                        </>
                    )}

                    {reproducing && (
                        <div className="text-xs text-white/50 animate-pulse mt-4">Running deterministic reproduction...</div>
                    )}

                    {reproductionResult && (
                        <>
                            <ReproductionStatus result={reproductionResult} />
                            
                            {reproductionResult.status === 'DIVERGENT' && reproductionResult.differences && (
                                <ReproductionDifference differences={reproductionResult.differences} />
                            )}

                            {reproductionResult.status === 'NOT_REPRODUCIBLE' && reproductionResult.diagnostic && (
                                <>
                                    <DiagnosticDetail diagnostic={reproductionResult.diagnostic} />
                                    <MissingDependencyNotice diagnostic={reproductionResult.diagnostic} />
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </ProgressiveSection>
    );
};
