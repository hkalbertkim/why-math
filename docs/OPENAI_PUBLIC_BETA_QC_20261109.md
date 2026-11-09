# Why Math? — OpenAI Tutor + Simplified Public Beta QC

## Product changes

- Homepage is reduced to two actions: **Start learning** and **Watch the 96-second demo** (the user's YouTube URL).
- English/Korean language toggle is retained; technical settings, test-persona selector and other complex entry options are hidden from public visitors.
- After starting, a single lesson panel is visible. My Math Notebook is available as a separate tab instead of an empty second column.
- The OpenAI-backed teacher responds to the most recent learner question; no automatic substitution with the broken heuristic Ollama offline fallback.
- New explicit model source `openai-live`, with private file-based key injection. No browser key, no credential in source control or in logs.
- The learning session can switch to the equation/transposition concept if the learner asks that question. The original notebook is retained; a new concept note is created.
- The public API rejects unsupported model modes and simulation calls, enforces the existing rate limits, and treats model failures as service unavailability rather than bogus answers.

## Tests and evidence

- 36 unit/API tests and TypeScript/Vite build PASS on MP.
- Live OpenAI requests in Korean and English validated with these questions: what zero means, what algebraic transposition means, which of −3 and −1 is greater, and why zero is a number. All four returned relevant responses with source `openai-live`; model latencies observed around 2–4 seconds.
- One-time public UI version change intentionally clears old browser session credentials to avoid reopening pre-OpenAI tutoring sessions with poor quality.

## Important scope limits

- The product remains a prototype. Human learning gains are not measured. The reviewed concept map covers zero, number lines, negatives, and basic equation transposition, not all mathematical topics.
- A heuristic model guard and focused prompts reduce obvious irrelevant outputs but cannot prove every generated mathematical explanation correct.
- Do not enter sensitive information, especially minors' names, school affiliations, or contact details.
