import { TechnicalState, ReproductionResult } from '../types/history';

export function technicalStateLabel(state: TechnicalState): string {
    const MAP: Record<TechnicalState, string> = {
        valid: 'Valid',
        ambiguous: 'Ambiguous Chain',
        orphaned: 'Orphaned Record',
        tampered: 'Integrity Failure',
    };
    return MAP[state] ?? 'Unknown State';
}

export function technicalStateBadge(state: TechnicalState): string {
    switch (state) {
        case 'valid': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'ambiguous': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'orphaned': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'tampered': return 'bg-red-500/20 text-red-400 border-red-500/30';
        default: return 'bg-white/5 text-white/40 border-white/10';
    }
}

export function reproductionStatusLabel(status: ReproductionResult['status']): string {
    const MAP: Record<string, string> = {
        EXACT_MATCH: 'Exact Match',
        DIVERGENT: 'Divergent Result',
        NOT_REPRODUCIBLE: 'Not Reproducible',
    };
    return MAP[status] ?? 'Unknown Status';
}

export function reproductionStatusBadge(status: ReproductionResult['status']): string {
    switch (status) {
        case 'EXACT_MATCH': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'DIVERGENT': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'NOT_REPRODUCIBLE': return 'bg-red-500/20 text-red-400 border-red-500/30';
        default: return 'bg-white/5 text-white/40 border-white/10';
    }
}

export function formatDateTime(isoString: string | null): string {
    if (!isoString) return 'Unknown Date';
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'medium',
        }).format(d);
    } catch {
        return isoString;
    }
}
