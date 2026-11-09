# Why Math? — 30-day public beta operations

**Launched:** November 9, 2026 (KST)  
**Minimum trial target:** through December 9, 2026 (KST), provided the host has power and internet access  
**Public URL:** https://whymath.krako.xyz  
**Hosting:** MSM2-1, via a dedicated Cloudflare Tunnel; development, artwork and GitHub updates are MP-first.

## Architecture

- Public hostname is an explicit Cloudflare DNS record; it overrides the prior legacy wildcard-DNS fallback that served an expired certificate.
- Cloudflare edge HTTPS forwards through a dedicated named Tunnel to the local loopback-only server on MSM2-1 port 8798.
- The server runs Express with built Vite React assets and the OpenAI API (`gpt-4.1-mini` by default). The API key is stored as a private file outside GitHub. Ollama remains available for local experiments but is NOT a public-browsing fallback.
- Local production service and Tunnel are separate macOS `launchd` agents, configured with `KeepAlive` and `RunAtLoad`.
- Learner session data is stored in a distinct beta-only JSON database, not the local development DB. Token capabilities restrict retrieval and updates.
- Model concurrency and daily usage are limited. This is a small public test, not a scalable cloud production architecture.

## Public safeguards

- No sign-in required; no real names, schools or contact details should be entered.
- Explicit experimental disclaimer appears at the start screen in Korean and English.
- Daily limits: at most 8 new sessions and 40 AI messages per connecting IP, 450 AI calls globally, at most 2 concurrent model calls globally and 1 per IP. Each session has a 20-learner-message cap.
- Public visitors can use only the OpenAI-backed teaching engine. Codex, Ollama, offline fallback and AI-student simulation are blocked from public model requests. A temporary API failure returns an error rather than fabricating an unrelated answer.
- Expired sessions are pruned on startup and every 6 hours using a 30-day inactivity limit.
- HTTPS and the public `/api/health` endpoint are checked with normal certificate verification; never tell visitors to bypass a certificate warning.

## Read-only health checks

```bash
curl -fsSI https://whymath.krako.xyz/
curl -fsS https://whymath.krako.xyz/api/health
```

## Host operations

On MSM2-1 the service labels are:

- `xyz.krako.whymath-public-beta`
- `xyz.krako.whymath-public-beta-tunnel`

Inspect with `launchctl print gui/$(id -u)/<label>`. Logs are in `~/Library/Logs/whymath-public-beta*.log`. Credentials are stored under `~/.cloudflared/` and are **not** in GitHub.

Do not change the existing `krako.xyz` main website, its DNS records, or other project tunnels for this beta. To roll back, explicitly remove the Why Math-specific DNS record and stop the two named LaunchAgents; never delete shared Krako resources.

## Validation and limitations

- On November 9, 2026, a trusted HTTPS request to the public hostname returned HTTP 200. Its certificate was valid from October 23, 2026 through January 21, 2027.
- The public API health endpoint returned `mode: public-beta`.
- A clean MP Chrome headless session rendered the real public frontend without a certificate error.
- 36 automated tests passed locally, including API access boundaries, public rate-limit behavior and JSON-record pruning; TypeScript/Vite production build passed.
- The public service has **no uptime SLA**. Long-term access depends on MSM2-1 remaining connected and powered. Educational improvement and broad math accuracy remain unproven.
- Do not store or publish actual student user content in GitHub.

## November 9 OpenAI update

The public website was simplified to **Start learning** and **Watch the demo**. The demo links to the actual uploaded video at https://youtu.be/ElSv6EovzYc. Visitors cannot select private model providers or synthetic test personas. The model backend now reads its key from `~/.config/why-math/openai-api-key` with file permissions `600` and fails closed on provider errors. A student question about equations or transposition routes to the relevant concept notebook instead of incorrectly showing the zero notebook. Paid OpenAI API charges are separate from the ChatGPT subscription.
