# Execution Plan: Tweet Translator Quality Upgrade

## Goal
Improve crypto/Twitter translation quality without breaking stability, speed, and token preservation.

## Current Strategy
Practical rollout (current mode):
1. Keep stable translator behavior in production use.
2. Improve glossary from live user-reported bad translations.
3. Run baseline metrics only when needed for formal reporting/comparison.

## Stages

### Stage A — Baseline & Metrics
Status: Optional (deferred)
- Baseline dataset and run templates created in `baseline/`.
- Added diagnostics counters for quality-gate failures (with reason breakdown).
- KPIs:
  - `ticker_preserve_rate`
  - `slang_correct_rate`
  - `garbage_rate`
  - `human_score`

Artifacts:
- `baseline/baseline_cases.csv`
- `baseline/baseline_runs.csv`
- `baseline/README.md`

### Stage B — Dictionary/Normalization v1
Status: Completed
- Added in both configs:
  - `PRESERVE_TERMS`
  - `EXPAND_ABBREVIATIONS`
  - `CRYPTO_SLANG_MAP`
  - `POST_TRANSLATION_FIXES`
- Wired into both preprocessors/postprocessors.

Files:
- `axiom/constants.js`
- `padre/constants.js`
- `axiom/translator.js`
- `padre/translator.js`

### Stage C — Quality Gate + Fallback Policy
Status: Implemented (v2), baseline validation pending
- Add translation output validation before final return:
  - placeholder integrity
  - Cyrillic/content sanity checks
  - API artifact/malformed output checks
  - likely-untranslated output checks (Latin-dominant guard)
- If failed: fallback to next provider automatically.

Target files:
- `axiom/translator.js`
- `padre/translator.js`

### Stage D — Unknown Slang Feedback Loop
Status: Implemented (initial version), baseline validation pending
- Log unknown/problematic phrases into `chrome.storage.local`.
- Add export endpoint via runtime message for review.
- Added runtime custom glossary override (storage-backed) for fast slang updates without code edits.

### Stage E — Provider Tuning
Status: Implemented (v2 with persistence), baseline validation pending
- Dynamic provider ordering by success/latency/quality.
- Provider performance persists in `chrome.storage.local` between reloads.
- Keep existing circuit breaker and rate limiting.

### Stage F — Observer Extraction Improvements
Status: In progress (initial safe filter added), baseline validation pending
- Tune DOM extraction only after Stage C/D metrics.
- Added feature-flagged observer text-quality filter to reduce UI/metadata container selection.
- Added feature-flagged observer line cleanup before translation to drop metadata lines.

Target files:
- `axiom/observer.js`
- `padre/padre-observer.js`

### Stage G — Mandatory Safety Controls
Status: Completed
- Added strict fallback/request limits:
  - `MAX_PROVIDERS_PER_REQUEST = 4`
  - `MAX_QUALITY_FALLBACK_ATTEMPTS = 2`
  - `MAX_REQUEST_MS = 6500`
- Added safer glossary boundaries to avoid accidental partial-word replacements.
- Added provider-rank decay and controlled re-check (exploration) to avoid permanent rank lock-in.

Files:
- `axiom/constants.js`
- `padre/constants.js`
- `axiom/translator.js`
- `padre/translator.js`

## Safety Rules
- No architecture rewrite.
- No multi-domain large patch in one step.
- One patch = one measurable hypothesis.
- Validate after every patch against baseline.
- Keep improvements behind feature flags for quick rollback.
- Runtime feature-flag overrides supported via storage for no-code rollback.

## Acceptance Criteria
- `ticker_preserve_rate` > 99%
- `garbage_rate` < 2%
- `human_score` >= 4/5 on crypto-slang cases
- No meaningful increase in failed translations
- No >15% speed regression

## Immediate Next Step
Continue glossary-driven improvements from live feed examples.

Optional (later): run baseline only if formal numeric report is required.
- quick sample:
  - `powershell -ExecutionPolicy Bypass -File baseline/evaluate_run.ps1 -RunName smoke_high -Scope high`
  - `powershell -ExecutionPolicy Bypass -File baseline/calc_metrics.ps1`
