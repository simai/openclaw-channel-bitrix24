# INBOUND_RUNTIME_HOOK — D9.2

## What was added

- `src/inbound-runtime.ts`
  - `executeInboundRuntime(payload)`
  - returns structured runtime result (`phase`, `ok`, `normalized`, `error`)
- `src/channel.ts`
  - gateway `startAccount` now runs inbound-runtime probe and stores probe status

## Why

This binds inbound normalization into channel runtime lifecycle (gateway start/status) so inbound readiness is observable from runtime state.

## Current limitation

The plugin still needs full live webhook intake integration to process real Bitrix HTTP requests end-to-end through OpenClaw runtime.
