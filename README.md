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

## Next implementation steps

1. Implement `register(api)` with `api.registerChannel(...)`.
2. Implement inbound adapter + normalized message mapping.
3. Implement outbound adapter using Bitrix REST (`imbot.message.add`).
4. Add Hub/Edge mode contracts and transport adapter.
5. Add smoke tests and sample config.
