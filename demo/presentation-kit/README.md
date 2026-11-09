# Why Math? — Presentation package

**Complete editorial assets except for actual web-app video footage.** This directory is intentionally **not** a fake finished demo. The final video generator refuses to run until real browser recordings have been supplied.

## Start here

- [Edit plan](EDIT_PLAN.md) — exact 72-second timeline, with 14 live UI capture slots and two short raster title cards
- [English pitch and submission text](PITCH.md) — 5-second hook, 20-second pitch, spoken demo introduction, event form description
- [Judge Q&A](JUDGE_QA.md) — product differentiation, evidence limits and next validation
- [Presenter and capture notes](PRESENTER_NOTES.md) — live recording checklist, real AI/student separation, supported claims
- [Machine-readable edit plan](edit-plan.json) — timeline for final assembly
- [English captions](captions.en.srt) / [WebVTT captions](captions.en.vtt) — manually aligned captions using the audible speech pauses in the approved voice stems; final editorial review may still adjust rendering safe areas

## Media ready

| Asset | Path | Status |
|---|---|---|
| English narration 72s, compressed | `audio/why-math-narration-72s.m4a` | Complete |
| English narration 72s, editable PCM | `audio/why-math-narration-72s.wav` | Complete |
| Intro card (1920×1080 PNG; an optional pre-encoded MP4 is also provided) | `assets/opening.png` | Complete |
| Outro/CTA card (1920×1080 PNG; an optional pre-encoded MP4 is also provided) | `assets/ending.png` | Complete |
| Seven optional lower-third overlays (transparent PNG) | `assets/{teacher,student_a,student_b,comparison,korean,visual,textbook}.png` | Complete |
| Real browser UI footage | `capture-slots/*.mp4` | **Missing by design** |

The narrator is the user's selected **balanced, expressive English storyteller** voice. The source audio segments are saved one directory up at `../audio/seg0.mp3` through `seg6.mp3`. The voice direction is deliberately grounded rather than theatrical.

## Produce the final live-app video

Capture each of the 14 UI slots described in [EDIT_PLAN.md](EDIT_PLAN.md) as a real `.mp4` file, using the exact name shown under `capture-slots/`. The final renderer speeds or trims *actual recordings* to the allocated timeline and overlays optional PNG labels. It does not fabricate interactions, AI answers or test results.

```bash
python3 demo/presentation-kit/render_final.py
```

Until the 14 genuine UI clips exist, this command **intentionally fails** and lists all missing clips. Do not present the old screenshot montage as a live demo.

To regenerate the PNG editorial assets, voice master and subtitles:

```bash
python3 demo/presentation-kit/build_kit.py
```

Requires Python 3, Pillow, FFmpeg and the seven approved source MP3 files. Neither script uses SVG teaching illustrations.

## Disclosure

- Students A/B are **simulated test learners** and use one shared teacher engine.
- The prototype does not prove improved learning outcomes or complete math accuracy.
- The video is a recorded product demonstration, with editing/speed changes disclosed in the narration and descriptions where relevant.

## Caption QC

The `captions.aligned.json` timings were checked against audible pauses in the final seven approved voice recordings, rather than generated from text length alone. Caption cues require at least 1.2 seconds of display, at most two lines and a readability cap of 25.5 characters/second. A few seconds near the end of a chapter intentionally have no captions because the voice has stopped. The visual editor should still check a final full-frame export for contrast and title-safe placement.

Both `opening.mp4` and `ending.mp4` are optional ready-encoded versions of the two raster PNG cards. The automated renderer uses the PNG originals, not these optional MP4s.
