# openclaw-channel-bitrix24

Bitrix24 channel plugin scaffold for OpenClaw.

> Status: **MVP-in-progress (current scope: direct mode only)**

## Goal

Provide a classic OpenClaw channel plugin for Bitrix24 with two connectivity modes:

- `direct` — app sends directly to bridge URL
- `channel` — app sends to Hub, Hub routes via Edge Agent

## Planned features

- Channel plugin registration (`bitrix24`)
- Inbound webhook endpoint for Bitrix events
- Outbound send (`imbot.message.add`)
- Session routing (`private` / `group`)
- Optional Hub/Edge transport mode
- Health + diagnostics + retry/idempotency

## Repo layout

- `openclaw.plugin.json` — plugin manifest + config schema
- `index.ts` — plugin entry
- `src/channel.ts` — channel plugin skeleton
- `src/types.ts` — config + payload types
- `docs/SPEC.md` — architecture and contracts

## Install (local link during development)

```bash
openclaw plugins install -l /path/to/openclaw-channel-bitrix24
openclaw plugins enable bitrix24
```

Then configure `plugins.entries.bitrix24.config` according to schema in `openclaw.plugin.json`.

## Next implementation steps (direct-only scope)

1. Complete direct runtime integration into channel execution path.
2. Run `docs/SMOKE_DIRECT.md` checklist and capture evidence.
3. Finalize installability docs (`docs/INSTALL.md`) for any OpenClaw server.
4. Canary rollout and `v0.1.0` tagging.

> Hub/Edge channel mode is deferred until after direct-mode stabilization.
