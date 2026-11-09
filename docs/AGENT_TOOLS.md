# Development tools — gStack and gBrain

Installed on MSM2-1 during c0mpiled-17 Seoul on 2026-11-09.

## gStack

- Source: `garrytan/gstack` (local checkout at `.local-tools/gstack`, excluded from Git).
- Installed Codex skills at `~/.codex/skills/gstack-*` through the official setup with `--host codex --prefix --no-browser`.
- Common workflows: `gstack-office-hours` for design critique, `gstack-review` for code review, and `gstack-qa` for QA.
- Local doctor: 12 OK, 1 warning (Codex live model probe not run), 2 optional features not configured. Browser binary built; Chromium bootstrap was skipped.
- The C﻿SO native helper was skipped to avoid large additional tool dependencies. Do not assume all gStack modules are operational.

## gBrain

- Source: `garrytan/gbrain`, version `0.60.619.0`, installed from GitHub through Bun, not the unrelated npm package.
- Isolated Bun 1.4.4, gBrain executable, and PGLite database under `.local-tools/`.
- Local content root has its own nested Git repository; no remote backup or hosted service is configured.
- Registered in Codex MCP and SessionStart/UserPromptSubmit hooks through `gbrain setup codex`. Restart Codex sessions before checking tool discovery.
- Automatic transcript capture, paid providers, embeddings, and cloud sharing were not enabled.
- Saved and recalled a general, public Why Math product-description fact as a CLI smoke test.
- gBrain stores **developer-agent memory**. It does not replace the app's learner model or student data store.

## Isolation

- `.local-tools/` is excluded from the Why Math Git repository.
- The app must run independently of gStack and gBrain.
- No recurring jobs were created, and no other running project was intentionally modified.
