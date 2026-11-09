# Why Math? — 96-second real browser demo: final QC

## Verified deliverables

| File | Format | Duration |
|---|---|---:|
| `why-math-final-demo-96s.mp4` | 1280×720, H.264/AAC | 96.000s |
| `why-math-english-narration-96s.mp3` | MP3 | 96.000s |
| `why-math-english-narration-96s.m4a` | AAC | 96.000s |

All three deliverables are in `demo/` and linked in README.

## Authenticity checks

- Live browser footage captured with Playwright Chrome from the actual running localhost app on MSM2-1.
- Two independent 14-year-old AI simulation sessions, real local Ollama-generated teacher replies, and a genuine browser-based side-by-side crop of both final responses.
- Korean response generated after switching the saved session language.
- The working PNG apple counter was clicked through 0→1→2→1→0, not generated as separate explanatory motion imagery.
- Automatic learning-notebook views come from the actual app.
- The 96-second master uses two short static editorial cards at the start and end; all intervening segments are browser recordings.
- No narration captions/subtitles are added.

## Technical checks

- FFmpeg decoded final MP4 without errors.
- FFprobe duration, audio/video stream presence and dimensions verified.
- Source app TypeScript/Vite build and 31/31 automated tests passed.
- The comparison was visually inspected after enlarging the two actual teacher responses to be legible.

## Known limits

- This is an **edited recording**, not one uncut live run. Model wait times were shortened for the demo.
- Learners A/B are simulated software test personas, not measured human education outcomes.
- The final edit now follows all 18 original storyboard slots (four GPT-rendered PNG illustration cards plus fourteen real UI recordings) in exact planned order, without redrawing slides as SVG. Assets were transported as a compressed multi-frame WebP package and decoded to PNG for video, so they are visually the same but lossy at 1280×720, rather than bit-identical 4K pixels. The audio and source UI are genuine.
- A video link and GitHub repo URL are prepared; official event form submission and YouTube/Loom upload have not been performed.
