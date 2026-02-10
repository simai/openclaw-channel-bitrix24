# INBOUND_RUNTIME_HOOK — D9.2

## What was added

- `src/inbound-runtime.ts`
  - `executeInboundRuntime(payload)`
  - returns structured runtime result (`phase`, `ok`, `normalized`, `error`)
- `index.ts`
  - plugin runtime HTTP route registration via `api.registerHttpRoute(...)`
  - configurable path from `direct.webhookPath` (default `/bitrix24/webhook`)
- `src/http-inbound.ts`
  - live webhook handler (POST JSON)
  - calls `executeInboundRuntime(...)`
  - returns structured HTTP acceptance/error response
- `src/channel.ts`
  - gateway `startAccount` still runs inbound-runtime probe
  - runtime status now includes live route telemetry (`routePath`, `liveHits`, `liveLastInboundAt`, `liveLastError`)

## Why

This binds inbound normalization into channel runtime lifecycle (gateway start/status) so inbound readiness is observable from runtime state.

## Current limitation

Live webhook intake is now wired at plugin runtime route level.
Remaining completion item: final handoff from accepted inbound payload into full internal channel execution/reply pipeline without relying on external bridge path.
