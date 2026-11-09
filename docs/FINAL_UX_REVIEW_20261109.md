# Why Math? — Final UX/UI review, 9 November 2026

**Method:** Actual running app inspection at 1440×900 desktop and 390×844 mobile; code review informed by installed gStack design-review. Expert roles are simulated review perspectives, **not real outside people hired or interviewed**. Focus is a time-limited hackathon prototype, not a shipped school product.

## Decision

Keep the existing two-panel classroom, warm cream/dark green brand and raster-first math imagery. The highest-return change is to make the Living Textbook read like a personal learning artifact rather than an analytics panel. Do not add fictional achievement percentages or build new illustration systems this afternoon.

## Role-specific findings

| Review perspective | What was wrong | Final recommendation | Status |
| --- | --- | --- | --- |
| Product UX/UI designer | The textbook was a group of similar text cards; key mathematical idea had weak visual priority | Add chapter identity, key-idea typography, editorial spacing, separate interactive math visual, collapse internal notes | Implemented |
| Mathematics education UX researcher | `0/3` bars implied mastery and click interactions lacked a path to explanation | Remove pseudo-score bars; ask learner to articulate the idea in the actual teacher chat, not treat clicking as evidence | Implemented |
| Launch copywriter | UI language exposed internal concepts like Teacher Studio and model provider rather than the learning benefit | Use `Understand why, not just how.` / `공식보다 원리를 이해해요.`; move provider choices under Demo settings | Implemented |
| Technical writer | Test model, learning evidence and production claims could be mixed | Keep explicit simulation labels; do not claim educational effectiveness; create precise screenshots and test evidence | Implemented in product and docs |

## Living Textbook information hierarchy

1. **Chapter cover** — `The meaning of zero` / `0의 의미`, framed as the learner's ongoing book
2. **The key idea / 이번 수업의 핵심** — reviewed mathematical fact in visually distinct treatment
3. **Try it / 직접 해보기** — real PNG raster background, 3D transparent basket/apple PNG, real click controls
4. **Explain your thinking / 생각 설명하기** — moves to the actual teacher chat with an editable answer draft, **does not auto-claim mastery**
5. **Let's unpack it / 조금 더 알아보기** — personalized generated lesson explanation
6. **Teaching notes / 수업 설계 메모** — collapsed; observation evidence preserved and explicit about uncertainty; no exposed `0/3` pseudo-progress

## Screenshots from running app

- [Desktop English textbook](screenshots/why-math-textbook-v2-desktop.png), 1440×900, initial zero concept
- [Mobile Korean textbook](screenshots/why-math-textbook-v2-mobile-ko.png), 390×844, initial zero concept

## Test evidence

- `npm run check` — 31/31 tests and TypeScript/Vite build PASS
- Headless Chrome desktop EN and mobile KO — no JavaScript page errors, no horizontal overflow
- `Demo settings` collapsed by default
- Notes collapsed by default and key mathematical fact visible
- Reflection button returns to teacher lesson with an editable, localized draft; an existing learner draft is preserved; textarea receives keyboard focus; no learner answer is submitted before the user sends it

## Deliberate limits and next validation

- Only the zero example has an interactive PNG lesson; algebra/negative-number concept visuals still need work.
- The book is a **learning record**, not an evidence-based mastery transcript. No real-student outcome evaluation has been performed.
- The learner's reason for a particular AI teaching move is not yet always explained in a perfectly accurate causal summary; avoid claiming an independently audited reasoning explanation.
- The full video still needs genuine browser recording for its designated capture slots. Do not replace them with synthetic screenshot motion.

## gStack post-review and final interaction repair

The first scoped post-review returned `BLOCK` for three small UX regressions: the reflection button could replace an existing unsent draft, mobile focus was not moved to the chat input after returning from the textbook, and new disclosure widgets lacked explicit focus rings. All three were fixed. After the fix, a headless Chrome mobile regression confirmed: the unsent Korean draft survived, the composer received keyboard focus and no page errors occurred. `npm run check` and `git diff --check` passed. This is a scoped UX fix and **not** a claim of complete accessibility certification.
