# gStack review evidence — 2026-11-09

**Review mode:** Read-only advisory review of the actual Why Math source, with focused subsequent code review. This is NOT a completed official gStack approval chain.

## Initial architecture review

**Advisory result:** readiness estimate 46/100, risk 4/5; the important deficiencies are mathematical misclassification, public session access, and vulnerable file persistence. Reviewer source: `/tmp/why-math-gstack-stage-review-20261109.md` on MSM2-1. The reviewer could run `tsc` but could not run Vitest inside its read-only sandbox because Vite writes a temporary config; the host's normal `npm run check` PASSED.

## P0 mathematical misclassification review loop

- Wrote test cases that were RED against existing code, including `-3 is bigger than -1 because 3 is bigger.` and `3이 1보다 크니까 -3이 -1보다 더 커요.`.
- First implementation passed eight tests, but follow-up gStack reviewer returned **BLOCK**: the comparison checker skipped wrong claims later in composite Korean sentences; fallback behavior hid the defect; UI state could still advance from a non-evidenced action.
- Extended tests to include forged LLM action values, symbolic inequalities, Korean reverse-order comparisons, and question/negation sentences.
- Fixed targeted parser behavior and prevented an `advance` action from independently promoting transfer without correct evidence.
- Independent host execution: `npm run check` PASS, **15/15 Vitest tests** and Vite/TypeScript build PASS.
- Final read-only gStack review was attempted but did not yield a terminal verdict due to sandbox constraints. **No final gStack approval claimed.**

## Unresolved P0 / release blockers

1. API session ownership/access boundary in `server/index.ts` — do not expose server publicly.
2. Atomic and serialized persistence plus corruption detection in `server/store.ts`.
3. Full reasoning fidelity of LLM output across unseen examples; existing guard is not a general theorem checker.
4. Browser QA, Korean/English live workflows, and visual artifact policy inspection.

## Rule for all future changes

Each feature must attach a scoped gStack pre-review, RED regression when fixing a defect, implementation diff, passing tests/build, gStack post-review verdict, and a release decision. No gate may be marked green solely because a reviewer generated advice or because the demo looks convincing.
