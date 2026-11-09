# Why Math? — Live browser video edit plan

**Duration: 72 seconds (under the 90-second limit).** Only two raster title cards are authored. The other 14 segments must be actual recorded browser interactions.

| Time | Source | Screen direction |
|---|---|---|
| 00.0–02.6s | PNG title card | Open in 2.6 seconds; no ten-second logo hold |
| 02.6–09.0s | LIVE browser recording | Actual home screen, click Start with zero, teacher opens |
| 09.0–13.0s | LIVE browser recording | Teacher-first lesson begins, no learner prompt |
| 13.0–18.0s | LIVE browser recording | Zoom into real teacher question and composer |
| 18.0–23.0s | LIVE browser recording | Student A simulated answer typed/auto responded, no fabricated dialog |
| 23.0–28.0s | LIVE browser recording | Actual generated teacher explanation; show adaptive action |
| 28.0–33.0s | LIVE browser recording | Independent B session with same start; reveals different gap |
| 33.0–37.0s | LIVE browser recording | Teacher response and action differs; no age-based preset |
| 37.0–41.0s | LIVE browser recording | Side-by-side two real screen recordings, not app-mimicking graphic |
| 41.0–47.0s | LIVE browser recording | Change language and show actual Korean response; allow edit speed-up |
| 47.0–51.0s | LIVE browser recording | Live PNG apple counter: 0→1→2; cursor visible |
| 51.0–55.0s | LIVE browser recording | Actual click remove: 2→1→0, end on zero |
| 55.0–60.0s | LIVE browser recording | Real learner A textbook and observation, no mastery claims |
| 60.0–65.0s | LIVE browser recording | Real learner B textbook; compare evidence, not outcome score |
| 65.0–69.0s | LIVE browser recording | Actual app main interface with two learner paths; GitHub CTA narration |
| 69.0–72.0s | PNG title card | Short CTA card; final real app capture can precede it |

## Capture rules

- Capture the working local app at `http://localhost:5173` through the authenticated SSH tunnel on MP, or directly on MSM2-1.
- Record genuine clicks, typing, generation indicators, final model replies and textbook updates. The timeline may speed up model waiting, but must not fabricate what the app did.
- For two students, record separate real sessions and split-screen their captured video only. Clearly mark both as AI simulations.
- Show the actual PNG counting control interaction (0→1→2→1→0) in the running app. Do not use fake PNG overlays to simulate a working app.
- The two supplied title cards are the only non-UI full-frame designs. The seven transparent lower-thirds are optional overlays on actual recordings.
- If a generation step fails, state or omit it. Never use the deterministic fallback and call it a live model response.
- Do not show invented learning gains or claim proven student mastery.

## Missing capture slots

The slot identifiers above are also placeholder filenames to provide to the final render assembly (`capture-slots/<id>.mp4`). Empty until real browser footage is captured.
