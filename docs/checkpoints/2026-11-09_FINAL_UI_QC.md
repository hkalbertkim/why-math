# Why Math? — Final UI & UX QC

**Date:** November 9, 2026 KST. **Host:** MSM2-1. **Scope:** hackathon UI slice, not production readiness.

## Final product language

The Korean translation of "Living Textbook" felt unnatural and misleading. The feature is an AI-generated summary of the lessons, not a full textbook. The Korean interface now uses **나의 수학 노트**, described as **수업 내용을 자동으로 정리해요**. The English product concept **My Living Textbook** remains unchanged.

## Completed UI

- Two-panel AI teacher chat / personal learning notes design with responsive mobile tabs.
- Guided and free entry; model choice is hidden in optional Demo settings on first use.
- Personalized chapter cover, mathematical key idea, actual interactive raster PNG apples/basket activity, teacher-led reflection prompt, generated explanation, and collapsible evidence notes.
- Removed pseudo-mastery `0/3` progress bars from learner-facing UI.
- Reflection CTA preserves an existing unsent draft and focuses the editor after switching mobile tabs.
- Mobile: new notebook content indicator and a link from the lesson to the updated notebook.
- Mid-session EN/KO language changes persist to the backend. Older messages preserve their original language.
- No SVG-based educational illustrations were introduced; the visual scene is composed of PNG assets and HTML numbers/controls.

## Final executable QC

- `npm run check`: **31/31 passing tests**, TypeScript/Vite production build PASS.
- Actual headless Chrome on MSM2-1 tested Korean at **1440×900** and **390×844**:
  - Notebook name, auto-summary description, and chapter wording visible.
  - No browser JavaScript errors and no horizontal overflow.
  - Reflection action returns to the real teacher input with an editable Korean draft and keyboard focus.
  - Learner's message submitted, actual local AI teacher generated a Korean response.
  - A new observation became visible under Teaching notes.
  - On mobile, notebook updated link returned to the notebook tab.
- Existing checks cover capability-protected session access and separate simulated learner identities.
- Evidence screenshots: [Korean desktop](../screenshots/why-math-final-desktop-ko.png) and [Korean mobile](../screenshots/why-math-final-mobile-ko.png).

## Release decision

**PASS for local hackathon UI demo**. The UI feature scope is frozen unless a P0 bug appears. This does not imply model correctness beyond the small concept test set, actual human-learning improvement, school readiness, public multi-user security, or a completed final live video. The final live-browser demo footage remains an independent submission task.
