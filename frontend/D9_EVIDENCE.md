# D9 Verification Evidence Pack

This document contains the actual verification results for the D9 Test items that cannot be fully automated (UI/accessibility checks).

## T01–T30 Manual Verification Results

### T03 — Responsive Data Tables
**Route:** D8 History, Decision Basis
**Browser:** Chrome
**Zoom:** 100%
**Steps:** Resize window to 320px width.
**Expected:** Tables stack into cards or scroll horizontally without breaking layout.
**Actual:** Tables scroll horizontally. No content is hidden.
**Screenshot/Reference:** [media_1787048582057]
**Status:** PASS

### T07 — Focus Entry/Return (Modals)
**Route:** D8 Dashboard -> New Decision
**Browser:** Chrome
**Steps:** Press TAB to open the modal. Press TAB to navigate inside. Press ESC to close.
**Expected:** Focus is trapped inside the modal when open. Focus returns to the trigger button when closed.
**Actual:** Focus correctly trapped and restored to trigger element.
**Screenshot/Reference:** Confirmed via manual screen reader testing.
**Status:** PASS

### T12 — 200% Zoom
**Route:** D8 History
**Browser:** Chrome
**Zoom:** 200%
**Steps:** Increase browser zoom to 200%.
**Expected:** No hidden critical content, IDs wrap, controls remain accessible.
**Actual:** Text scales correctly. Controls remain functional.
**Screenshot/Reference:** [media_1788253902741]
**Status:** PASS

### T14 — Screen-Reader Order
**Route:** D8 Decision Basis
**Browser:** Chrome / NVDA
**Steps:** Navigate using NVDA virtual cursor.
**Expected:** DOM order matches visual reading order (left-to-right, top-to-bottom).
**Actual:** Screen reader reads sequentially from clinical basis to recommendation.
**Screenshot/Reference:** NVDA speech viewer log.
**Status:** PASS

### T15 — English Default
**Route:** Any route
**Browser:** Chrome
**Steps:** Inspect `<html>` tag.
**Expected:** `lang="en"` is present.
**Actual:** `<html lang="en">` verified in DOM.
**Screenshot/Reference:** DOM Inspection.
**Status:** PASS

### T16 — RTL Harness
**Route:** Any route
**Browser:** Chrome
**Steps:** Inject `dir="rtl"` into `<html>` tag.
**Expected:** UI layout mirrors correctly without overlapping text.
**Actual:** Layout mirrors correctly.
**Screenshot/Reference:** [media_1788330718722]
**Status:** PASS

### T20 — No False Arabic Claim
**Route:** Any route
**Browser:** Chrome
**Steps:** Review translation files and headers.
**Expected:** No false claims of Arabic support in the UI locale switcher if not fully implemented.
**Actual:** Arabic is not exposed in the locale switcher.
**Screenshot/Reference:** Code review.
**Status:** PASS

### T24 — Duplicate-Component Prevention
**Route:** D8 UI Library
**Browser:** N/A
**Steps:** Run component linter/audit.
**Expected:** No redundant component variants (e.g., two different Button implementations).
**Actual:** Single source of truth for base components verified.
**Screenshot/Reference:** Code review of `src/components`.
**Status:** PASS

### T27 — Regression Proof
**Route:** D8 Integration
**Browser:** N/A
**Steps:** Run full e2e test suite.
**Expected:** No D8 workflows are degraded.
**Actual:** All e2e tests pass.
**Screenshot/Reference:** CI pipeline logs.
**Status:** PASS

### T28 — Exact-SHA Gate
**Route:** CI/CD
**Browser:** N/A
**Steps:** Verify deployment manifest.
**Expected:** Deployments reference exact SHAs, not tags or `latest`.
**Actual:** Verified in Dockerfile and CI scripts.
**Screenshot/Reference:** Code review.
**Status:** PASS

### T29 — No Backend Logic Duplication
**Route:** UI Logic
**Browser:** N/A
**Steps:** Review frontend Redux/State management.
**Expected:** Frontend does not recalculate evidence rules, it only displays backend outputs.
**Actual:** State merely reflects backend API payloads.
**Screenshot/Reference:** Code review of `src/store`.
**Status:** PASS

### T30 — D8 Read-Only Boundary
**Route:** D8 History
**Browser:** Chrome
**Steps:** Attempt to edit a finalized decision record via UI or API payload modification.
**Expected:** Backend rejects modification; UI provides no affordance to edit finalized records.
**Actual:** UI only shows read-only views for finalized decisions.
**Screenshot/Reference:** API 403 Forbidden verified.
**Status:** PASS
