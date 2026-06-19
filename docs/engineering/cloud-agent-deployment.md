# Cloud Agent Deployment

PM Studio can be deployed as a cloud demo where the web app calls Codex and Claude Code CLIs installed on the same server.

## Runtime Shape

1. User creates a project from the workspace sidebar.
2. The browser calls `POST /api/generate` with `providerId`, `workflowId`, and `input`.
3. The Next.js server builds the PM Studio prompt and creates a temporary run directory under the OS temp folder.
4. If server agent execution is enabled, the server attempts the selected CLI:
   - Codex: `codex exec --json --skip-git-repo-check --sandbox workspace-write ...`
   - Claude Code: `claude --print --output-format stream-json --cwd <run-dir>`
5. The UI still renders the deterministic typed Product Pack while adapter output is stored as run metadata. Parsing CLI output into Product Pack deltas is a later step.

## Required Environment

```bash
npm install
npm run build
PMSTUDIO_DEMO_USER=pmstudio \
PMSTUDIO_DEMO_PASSWORD='<strong-demo-password>' \
PMSTUDIO_ENABLE_CLOUD_AGENTS=1 \
PMSTUDIO_AGENT_CLI_TIMEOUT_MS=120000 \
npm run start
```

The server host must have the CLIs installed and authenticated:

```bash
codex --version
claude --version
```

`/api/harness` detects whether `codex` and `claude` are on `PATH` and marks each provider as `available` or `dry-run`.

## Demo Password

Set `PMSTUDIO_DEMO_PASSWORD` to enable built-in HTTP Basic Auth for the workspace and API routes. `PMSTUDIO_DEMO_USER` defaults to `pmstudio`.

Do not set `PMSTUDIO_ENABLE_CLOUD_AGENTS=1` on an internet-facing host unless one of these is true:

- built-in demo password is enabled;
- the app is behind VPN/private network;
- an upstream reverse proxy provides authentication.

## Security Boundaries

Do not expose CLI execution on a public unauthenticated URL.

Minimum deployment guardrails:

- Put the app behind login, VPN, or the built-in temporary demo password.
- Run the Next.js process as an unprivileged user.
- Keep CLI runs in isolated temp directories, not the app repo.
- Keep `PMSTUDIO_ENABLE_CLOUD_AGENTS` off by default.
- Set server-level CPU, memory, process, and request time limits.
- Do not mount production secrets into the run directory.
- Treat CLI output as untrusted until Product Pack delta parsing and validation are added.

## Current Limitations

- Codex and Claude Code output is not parsed into artifact deltas yet.
- The stable Product Pack generator still supplies the UI-visible artifact structure.
- There is no server-side database; project creation is browser-local for the demo.
- A production version needs authentication, persistent storage, queueing, audit logs, and per-run sandbox policy.
