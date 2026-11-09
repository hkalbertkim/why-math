# Why Math? — gStack Stage Gates

Date: 2026-11-09 KST. Status: Adopted as working QA procedure, not formal approval or completed gStack certification.

## Control loop

For each scoped feature or stage, follow: **gStack pre-review → scoped change → executable tests → gStack post-review → evidence receipt → next stage**. Block progression on P0 failures. Record results, failed evidence, tool limitations and SHA. Model advice is not a substitute for tests. User approval is required only for material scope, cost, security or external release decisions.

## Scope invariants

- One AI teacher engine for all ages, not three age-specific teaching systems.
- Guided curriculum and free conversation are two entry routes into the same adaptive engine.
- The three same-age AI learner personas are **test fixtures**, not user-facing enrollment choices; their hidden misconceptions must never be provided to the teacher.
- Learner evidence, not demographic label, controls teaching actions; age may adjust presentation.
- Korean and English learning; English pitch and narration.
- Living Textbook is generated automatically as a result of teaching.
- Teaching artwork uses large PNG scenes, composited transparent PNG elements, optional GIF, and interactive HTML/Canvas as described in VISUAL_ASSET_POLICY.md; avoid default SVG illustration.
- Do not claim the AI student simulation proves educational effectiveness with humans.

## Gates and artifacts

| Gate | Required gStack advisory skill | Evidence and artifact | Blockers |
| --- | --- | --- | --- |
| G0 Product scope | office-hours + plan-ceo-review (scoped) | One-page demo contract, scope exclusions, persona fixtures | Teaching engine replaced by age presets; user must ask sophisticated questions |
| G1 UX and lesson contract | plan-design-review | Teacher-led/free entry, actual-human vs test-mode UX, learner schema and classroom storyboard | Persona fixture exposed as main product; visual mode hardcoded from age |
| G2 Implementation | review + verify on each small diff | Code diff, regression test and green build for each change | P0 regression, unsupported math claim, no test receipt |
| G3 Pedagogical correctness | review focused on teaching engine | Negative-number misconception matrix; multi-turn evidence progression; English/Korean parity | Incorrect inequality accepted, one-answer mastery, evidence conflict ignored |
| G4 System QA | qa | API + browser matrix, auth boundaries, atomic session persistence, resume, fallback label | Cross-student data exposure, lost update, silent restore failure |
| G5 Visual QA | design-review (quick) | Desktop/mobile screenshots, original raster assets/provenance and contrast/tap audits | Visual obstruction, broken controls, missing image alt or math errors |
| G6 Demo/release | verify, ship checks selectively | Frozen commit SHA, real live lesson recording, 90s English narration, Korean/English clip, GitHub and external URL smoke | Scripted replay portrayed as live AI; unverifiable public URL; failed tests |

Do not run whole autoplan or full ship release choreography repeatedly during the five-hour event. Use focused reviews and corresponding receipts; record exceptions openly.

## Current status, 2026-11-09

- G0: product philosophy established; final formal CEO approval not executed.
- G1: initial UI exists; fixture/human segmentation not yet fixed.
- G2: initial implementation done, baseline Vitest 5/5 and TypeScript/Vite build passed outside the read-only review sandbox on 2026-11-09. An independent read-only gStack reviewer could not run Vitest due EPERM in Vite temp files, which is a sandbox limitation, NOT an app test failure.
- G3: **PARTIAL / BLOCKED FOR FULL APPROVAL**. The original explicit negative-number mistake is now guarded; 15 targeted tests and build pass. A first gStack post-review BLOCKED the initial patch for composite Korean claims and unverified advancement. Revised tests and guard address those examples, but the subsequent read-only reviewer did not produce a terminal report. General math comprehension validation remains unproven.
- G4: **P0 SCOPED CODE REVIEW PASS**, API session capability and serialized atomic writes reviewed; browser and HTTP integration/security tests remain pending for release approval.
- G5: **NOT YET VERIFIED**, no raster teaching scene asset nor browser screenshot QA.
- G6: **NOT STARTED**, no English 90-second video and no externally tested demo URL.

## Priority issues

P0-1: `server/teacher.ts` current fallback uses digit and word-pattern heuristics that may promote false statements about negative numbers. First add a regression test asserting “-3 is bigger than -1 because 3 is bigger” does NOT produce a correct/advance result or evidence of transfer. Korean equivalent must behave the same. Then fix at the classification source, rerun tests, and have gStack review the diff.

P0-2: `server/index.ts` routes list and access student records without authentication. Remove unsafe list access and add a scoped access gate for demo; no public launch before verification.

P0-3: `server/store.ts` swallows read errors and non-atomically writes shared JSON. Use serialized writes, atomic rename and explicit corruption errors.

P1: starter message ignores selected concept; free entry scope currently narrower than advertised; active personas appear in normal onboarding; one-answer learner-state gains lack evidence validation; dynamic teaching visuals are minimal.

## Reviewer source and limitations

The gStack-guided review is saved locally at `/tmp/why-math-gstack-stage-review-20261109.md`. It is an advisory read-only review of the actual repository, not an official all-gates-approved report. This document paraphrases its findings and combines them with previously independently verified test/build results. Future stage reports should cite exact commands, execution results, commit hashes and remaining risks.

## Gate receipt: 2026-11-09 11:33–11:36 KST

- Baseline `npm run check`: 5/5 PASS, TypeScript/Vite build PASS.
- New red tests: the original false negative-number comparison was incorrectly returned as correct in Korean and English (2 failing cases).
- First repair: 8/8 PASS; gStack adversarial post-review: **BLOCK** because the guard failed on compound Korean sentences and advanced learner state could be promoted from unverified `advance`.
- Second repair: assertive comparisons checked across clauses; question/negation cases excluded from simple misconception inference; non-evidenced action alone no longer increases transfer score.
- New tests: `npm run check`: **15/15 PASS** and TypeScript/Vite build PASS.
- Attempted second gStack post-review: no terminal reviewer verdict; read-only sandbox produced EPERM in Vite temporary files; **review is pending**. Do not mark complete.
- Remaining limitation: regex cannot validate arbitrary mathematical reasoning, and the two-positive-evidence heuristic is not a proven mastery model.
- Next: obtain completed focused review, then resolve P0 session authorization and atomic storage, and perform live browser QA.

## Update 2026-11-09 11:55 KST

GStack independent focused reviewer returned **PASS FOR SCOPED P0** after auth, persistence, fixture, and React corrections. 24/24 current unit tests and production build pass; real browser tested English AI fixture A/B/C and Korean live learner without page errors. Remaining QA: authenticated route integration, release security, full user learning effect, polished raster teaching visuals and published demo URL.

## Update 2026-11-09 12:20 KST

- Scoped P0 code review PASS (earlier). API integration tests for auth and fixture gating now PASS, but focused gStack HTTP integration review has no completed terminal result.
- First PNG-based interactive counting scene and its mobile/desktop QA completed. GStack scoped visual review PASS after screenshots clarified initial state is zero apples.
- 90-second narrated demo video exists; first gStack presentation review BLOCK due to unverified outcome wording and weak CTA. Video copy revised; final follow-up approval pending.
- Current test baseline 28/28 PASS and TypeScript/Vite build PASS. Not production ready.
