# Why Math?

**The lesson adapts to you.**

An infinitely patient AI tutor that designs a unique learning experience for every student. Instead of asking students to adapt to a fixed lesson, Why Math? adapts explanations, visualizations, interactions, pace, and progression to their actual understanding.

Built for the **c0mpiled-17 Seoul hackathon — The Primer**, November 9, 2026.

## Contents

- [What we're building](#what-were-building) — the product experience
- [Hackathon demo](#hackathon-demo) — the smallest proof
- [Project documentation](#project-documentation) — product brief, scope, and development workflow
- [Development status](#development-status) — what is and isn't implemented

## What we're building

1. **AI-led lessons.** Students do not need to know what to ask. The tutor begins with a logical math learning sequence.
2. **Adaptive instruction.** The tutor responds to student understanding and vocabulary, changing examples, explanations, visuals, questions, and pace.
3. **Generative learning design.** A validated concept structure guides dynamically generated learning experiences rather than requiring a complete prewritten textbook.
4. **Living textbook.** A personalized learning record is assembled automatically from each student's lesson, without a manual save action.
5. **Bilingual learning.** Korean and English lesson flows are targeted for the demo.

**Core principle:** Same mathematical truth. A different path to understanding for every student.

## Hackathon demo

Three simulated 14-year-old students can follow the same lesson with different understanding profiles, behind an explicit Test Mode switch. The same AI teacher adapts its next lesson, and each student's living textbook updates automatically. The demo should support real live runs and a clearly labeled replay of recorded events.

Target deliverables: working app, GitHub repository, 90-second English presentation/demo video. The video may show both Korean and English AI lessons.

## Project documentation

- [Product brief](docs/PRODUCT_BRIEF.md)
- [Hackathon scope and acceptance checks](docs/HACKATHON_SCOPE.md)
- [Development workflow and adaptive UI specification](docs/DEVELOPMENT_WORKFLOW.md)
- [gStack stage gates and quality evidence](docs/GSTACK_STAGE_GATES.md)
- [Latest build and QA checkpoint](docs/checkpoints/2026-11-09_MVP_P0_QA.md)
- [Visual asset policy](docs/VISUAL_ASSET_POLICY.md)

## Development status

**Working hackathon MVP (November 9, 2026).** React/Vite UI and Express API, guided and free entry, Ollama-powered Korean/English lessons, three test-only AI learners, automatic Living Textbook updates, and local session persistence are implemented. The teacher uses a small reviewed concept map (zero, number line, negative numbers), not a complete curriculum. Mathematical accuracy, user learning outcomes, general-topic routing, cloud security and production scale are **not validated**. The Codex CLI path may time out and is experimental; the offline fallback is explicitly labeled. The richer PNG/GIF learning artwork and 90-second demo video are not yet delivered.

### Run on MSM2-1

```bash
cd /Volumes/MSM2-1-DATA/Projects/95_Why-Math
npm install
npm run check
npm run dev
```

Browse `http://localhost:5173`. The API runs at `http://localhost:8787`. The default live teacher uses a local Ollama service with `gemma3:4b`; install and run the model separately when using a fresh host. The UI can use a labeled offline fallback if the model is unavailable.

For the judge demo, select **AI student testing mode (simulation)** and one of the three fixtures; real learners do not see that fixture selector by default. Demo replay and offline scripted actions are never evidence of real students' learning gains.

**Security:** This is a local hackathon app, not a production multi-user learning platform. Sessions require unguessable access capabilities, but there is no full account, abuse protection, privacy policy or managed hosting. Do not publicly expose the backend or input real minors' personal data. Existing sessions from before access-token protection cannot be reopened from the browser.

## License

License not yet selected. Do not assume reuse permission for third-party content or source code.
