# c0mpiled-17 Seoul — Hackathon Scope

**Date:** 2026-11-09 (KST)
**Track:** The Primer (hackathon example; the product serves learners of all ages)
**Build window:** 10:00–15:00 KST
**Video:** 90 seconds, English narration, showing Korean and English student lessons when functional
**Submission:** GitHub URL, short description, demo video
**Judging language:** English

## Product audience and interface

Why Math? is for anyone seeking mathematical understanding: children, struggling students, formula memorizers, university students, and adult returners. The AI teacher adapts both instruction and presentation to actual understanding. Visual, playful, accessible interfaces are available to all ages; formal, denser explanations are available when appropriate. Age is a starting clue, never a mastery verdict.

See [Development Workflow](DEVELOPMENT_WORKFLOW.md) for gStack stages and acceptance checks.

## Required live behavior

1. AI teacher begins a foundational math lesson without depending on student-generated questions.
2. A real student agent (or human) responds; the teacher changes instruction based on evidence of understanding.
3. Learning visuals or interactions appear when useful to explain concepts.
4. Each student gets an automatically updated personal textbook and learner state—no add/save action needed.
5. Two different student profiles take different teaching paths from the same initial learning objective.

## Demo reliability

- Two sample students: quick conceptual grasp vs. vocabulary/concept confusion.
- Separate teacher engine from student simulator.
- Prefer direct application-level student input. Browser remote control is optional for QA, not part of the runtime dependency chain.
- Support a clearly labeled replay of prior genuine lesson events for the video or fallback.
- Do not present scripted simulation as evidence of actual learning gains.

## Minimum QC

- Verify teacher/student roles and language selection.
- Verify student responses change subsequent lesson choices.
- Verify both learning records remain isolated across students.
- Verify a lesson can be resumed from saved state.
- Verify the app has no manual "add to textbook" requirement.
- Verify English presentation copy and 90-second video.

## Scope guardrails

Do not preauthor a complete textbook, build billing, install heavy agent frameworks, or implement an entire national curriculum for the hackathon. The curriculum should initially be a compact concept/prerequisite map. Use gStack only if it directly reduces QA overhead; defer gBrain unless concrete need emerges.
