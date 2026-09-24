# D9 Conformance Inventory

## Governed-state inventory
- **Positive:** `color-semantic-positive` (e.g. COMPLETED, RESOLVED, MATCH, READY)
- **Attention:** `color-semantic-attention` (e.g. QUEUED, PROCESSING)
- **Critical:** `color-semantic-critical` (e.g. FAILED, REJECTED, MISMATCH, UNAVAILABLE)
- **Information:** `color-semantic-information` (e.g. NOT_REPRODUCIBLE, DIAGNOSTIC)
- **Neutral:** `color-semantic-neutral` (e.g. UNASSIGNED)
- **Unknown:** `color-semantic-unknown` (e.g. UNKNOWN)

## Shared-component inventory
- `GovernedStatus`: Maps state to semantic color/icon.
- `DataState`: Handles loading/error/empty states.
- `CriticalStateBanner`: High-priority workspace alerts.
- `HistoricalStateMarker`: D8 read-only indicator.
- `ActionControls` / `ActionSummary`: D6 action execution primitives.

## Token inventory
- **Canvas:** `--color-canvas`
- **Surface:** `--color-surface`, `--color-surface-raised`, `--color-overlay`
- **Text:** `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- **Semantic:** `--color-semantic-positive`, `--color-semantic-attention`, `--color-semantic-critical`, `--color-semantic-information`, `--color-semantic-neutral`, `--color-semantic-unknown`
- **Exceptions:** No screen-level hard-coded colors allowed.

## Critical workflow inventory
- **Boot/Shell:** `CommandCenter/BootScreen.tsx`
- **Workspace:** `GovernedUI/GovernedWorkspace.tsx`
- **Decision Basis:** `DecisionBasis/DecisionContextSummary.tsx`
- **Recommendation/Review:** `GovernedUI/RecommendationReview.tsx`
- **Action Lifecycle:** `Action/ActionLifecycleSection.tsx`
- **Runtime/Degraded:** `CommandCenter/ErrorScreen.tsx`, `GovernedUI/FailureNotice.tsx`
- **History/Reproduction:** `History/HistoricalTraceSection.tsx`

## Known-limitations register
- **Localization:** Arabic UI (RTL + Strings) is NOT IMPLEMENTED. Only layout readiness pseudo-RTL is supported in V1.
- **Light Mode:** Light mode is currently UNSUPPORTED. The legacy global CSS filter inversion has been removed due to accessibility and contrast violations. V1 is Dark Mode only.
