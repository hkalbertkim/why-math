# Why Math? — Development Workflow (c0mpiled-17 Seoul)

## Product position

Why Math? is for **anyone who wants to understand mathematics**, not only children. Its first use case is foundational math for the YC *The Primer* hackathon. Learners may be children, teenagers who are struggling, students who memorized formulas without understanding, university students with gaps, or adults returning to math.

**Thesis:** Education has always asked students to adapt. It's time for education to adapt to students.

**Primary value:** AI-led instruction adapts explanations, vocabulary, pace, difficulty, interactive activities, and sequencing to the learner. The Living Textbook is an automatic byproduct of teaching, not the product's primary value proposition.

## Product invariants

1. The AI teacher starts the lesson. It must not require learners to formulate a useful question.
2. A small reviewed concept/prerequisite map guides learning goals; lesson content is dynamically generated rather than preauthored as a complete textbook.
3. Teacher choices use observed learner responses; do not treat claimed age or grade as a proxy for mastery.
4. UI rendering adapts by demonstrated comprehension and interaction needs: visual/game-like, conceptual, and analytical/formal presentations.
5. Interface placement and input affordances remain stable while the teaching media, language complexity, and density vary.
6. The learner model distinguishes vocabulary understanding, concept understanding, and ability to transfer learning to a new problem.
7. Student records are isolated. The personal textbook updates automatically, separating confirmed mathematical facts, unconfirmed learner beliefs, explanations used, and assessment evidence.
8. Korean and English lesson content; English presentation and demo narration.
9. Student simulation is not a substitute for actual user validation. Live-agent and labeled replay modes must be distinguishable.

## gStack delivery process

A. **Product / critique:** `gstack-office-hours`, then a scoped CEO review as needed. Output: one-page problem, user story, MVP and kill criteria.

B. **Design / engineering:** scoped design and engineering reviews (`gstack-plan-design-review`, engineering review via `gstack-autoplan` where available). Output: responsive two-panel lesson+textbook UX and teacher/learner state contract. Avoid running the full multi-phase pipeline if it delays the MVP.

C. **Implementation:** one vertical slice at a time: curriculum seed -> teacher initiation -> response evaluation -> next teaching action -> live textbook update -> session persistence. Then attach Korean/English and student simulator.

D. **Code review:** `gstack-review` and focused automated tests. Fix blocking problems before UI polish.

E. **Functional and visual QA:** `gstack-qa`, optionally `gstack-design-review`. Run browser tests on learner flows; verify state, bilingual text, mobile layout, and consistency between chat and textbook.

F. **Release:** build, local smoke test, push GitHub, verify demo URL (if deployed), record actual video evidence, submit on time. Borrow `gstack-ship` checks without adding heavy PR process if unnecessary.

## Suggested responsive UI

See [Visual Asset Policy](VISUAL_ASSET_POLICY.md) for PNG, transparent sprite, GIF, SVG exceptions, quality, math and accessibility requirements.


**Desktop:** central teacher-led lesson and a live generated textbook pane. A compact curriculum/progress switcher may open as a drawer, not a permanently distracting third panel.

**Mobile:** teacher-led lesson in main view; textbook accessed by a clearly labeled tab or bottom sheet; preserve lesson context when switching.

**Child-oriented delivery:** shorter text, larger targets, illustrations, number lines, draggable manipulatives, optional audio, small feedback loops. Do not classify a learner as incapable from one wrong answer.

**Foundation/relearning delivery:** plain-language explanation of terms, relatable analogies, stepwise symbolism, interactive visuals on demand. Avoid infantilizing adults who need elementary explanations.

**Advanced delivery:** denser reasoning, formal definitions, assumptions, derivation steps, proof and generalization. Formal rigor increases only after prerequisite understanding is supported by evidence.

## Essential tests and exit gates

- Teacher starts a lesson without learner prompt.
- Same concept and teacher code produce different next teaching actions for two distinct learner profiles.
- A confused student receives a revised explanation and an appropriate visual example.
- Language mode changes presentation while the mathematical meaning remains consistent.
- UI complexity responds to learner evidence, not age labels alone; an adult can use visual/simple mode.
- Living Textbook updates without a save button and does not mark unverified mastery as completed.
- Separate student records cannot leak across sessions; resume works after refresh.
- Deterministic math checks guard objective computations; failures do not silently fabricate correctness.
- At least one recorded real live teacher run is available for demo; replay is clearly labeled.
- English 90-second demo shows both a Korean and English teaching sample when they work.

## Scope and business discipline

No billing, full national math curriculum, universal image generation engine, multi-agent bureaucracy, or autonomous background features before a live teaching loop works and passes QA. gBrain stores developer decisions, not student data. gStack is a development aide, not a runtime dependency.
