# Phase 1 — Product Diagnostic (Draft, not approved)

Date: 2026-11-09 KST
Workflow: gStack `office-hours` → CEO premise/scope review. This file is a **working diagnostic and decision brief**, not an approved gStack design plan. GStack review gates that require new explicit approval remain pending.

## Claim

**Education has always asked students to adapt. It's time for education to adapt to students.**

Why Math? is an AI teacher that initiates a lesson from a compact, reviewed concept/prerequisite map, observes the learner's vocabulary and conceptual responses, and adapts teaching media, examples, questioning, pace and sequence. Each learner's Living Textbook is a structured automatic result of instruction, not a manual note-taking workflow.

## Users and jobs

- Primary demo user: foundational math learner who cannot reliably formulate questions about missing concepts.
- Other users: children, adolescents who struggle with math, high-school or university students who memorized formulas, and adults relearning math principles.
- Job: progress from 'I don't understand the words or ideas' to independently explaining and applying a mathematical principle.
- Children may benefit from larger inputs, animations and game-like visuals; adults needing simple math must not be treated as children. UI should follow observed understanding and accessibility needs, not age alone.

## Existing alternatives and competitive challenge

General LLM chat can explain concepts but places much of the initiative and context organization on the learner. Other AI tutors and adaptive study services already offer personalized instruction, quizzes, or notes; these capabilities alone are not a moat. Why Math must prove a better end-to-end *teacher-led learning loop*, not claim exclusivity over these features.

## Highest-risk assumptions

1. A brief dialogue distinguishes vocabulary confusion, conceptual confusion, and simple arithmetic errors well enough to choose a useful next teaching action. **Unproven.**
2. Dynamically generated explanations and math visuals are accurate and pedagogically coherent. **Unproven.**
3. Learners who struggle to ask good questions can start and make progress without prompting the system with a curriculum topic. **Needs user test.**
4. A personalized learning record improves resumption/retention compared to ordinary chat history. **Unproven.**
5. The teacher and learner-model loop creates learning gains over a plain frontier LLM prompted to tutor. **Unproven.**

## Scope challenge

- No need to author a full textbook: only a compact knowledge graph and small assessment evidence schema.
- Avoid universal generation of custom games and arbitrary diagrams in v0; use a constrained, verified set of manipulatives for number concepts, plus LLM-authored explanations.
- Do not put gStack/gBrain in the app runtime; they are developer tools only.
- No subscriptions, family accounts, every-age-specific skins, or national curriculum ingestion in the hackathon slice.
- Video must not present simulated students as empirical proof of learning effectiveness.

## MVP acceptance criteria

1. The AI teacher starts from a reviewed mathematics objective without asking the learner to invent a question.
2. For the same objective, different student responses result in meaningfully different next learning actions.
3. Demonstrate at least one visual teaching aid on an appropriate error path.
4. Automatically update and persist a concept-linked personal textbook with provenance of explanation and assessment evidence.
5. Resume a session without resetting concept state; isolate student A and student B.
6. Support one Korean lesson and one English lesson; the pitch and narration are in English.
7. Display failure/uncertainty rather than falsely declare mastery when evidence is thin.

## Approaches for a scope decision (not yet approved)

### A — Minimal vertical slice (recommended for the hackathon)

One concept chain (counting → zero → number line), two AI student profiles, direct teacher decision + structured lesson event model, a small verified visual component, automatic textbook projection, local persistence, bilingual rendering. Lightweight test and replay mode.

Effort: S–M. Risk: Medium. Pros: real end-to-end flow; judge-visible before/after; limited failure surface. Cons: limited topic coverage; smaller set of teaching visuals.

### B — Full generative tutoring platform

Broad concept graph, free-topic learning, generalized dynamic visual/game generation, full learner analytics, voice, rich profiles, persistent multi-session service and user management.

Effort: XL. Risk: High. Pros: stronger long-term vision; extensible across subjects. Cons: likely fails 5-hour deadline; correctness and content safety become difficult to validate.

### C — Scripted demonstration-first prototype

Two handcrafted student journeys with a UI that plays prearranged lessons and textbook updates, optionally followed by AI chat.

Effort: S. Risk: High as product evidence. Pros: stable 90-second presentation; fast polish. Cons: does not substantiate live pedagogical adaptation and could mislead if shown as autonomous tutoring.

## CEO pre-review decision ledger

| ID | Decision | Current state | Recommendation | Status |
| --- | --- | --- | --- | --- |
| D1 | Product audience | All ages seeking conceptual mathematics understanding | Preserve | Settled in prior conversation |
| D2 | Teaching model | Teacher-led, reacts to learner; does not require learner initiative | Preserve | Settled |
| D3 | Curriculum | Reviewed concept relationships guide generated lessons | Preserve | Settled |
| D4 | Textbook | Generated automatically from observed learning events | Preserve | Settled |
| D5 | Demo implementation scope | Not explicitly selected between A/B/C | Choose A | **Pending explicit approach approval** |
| D6 | Live vs replay | Actual teacher live loop required; replay clearly labeled | Preserve | Settled |

## Validation / kill signals

- Demo cannot show two truly distinct teacher actions to two student answers → remove claims of adaptation.
- Math rendering or correctness fails on core example → narrow concept content and use deterministic checking.
- Textbook reports mastery without evidence → do not ship this indicator.
- First live users cannot explain or transfer the taught concept more clearly than before → revise pedagogy before extending subject coverage.

## Phase-1 review gate

**Preliminary outcome: Scope narrowed, approach A recommended; final gStack office-hours plan and formal CEO approval gate not completed.** Await D5 approach confirmation before converting this working analysis into an approved implementation plan and invoking the full gStack CEO review process.
