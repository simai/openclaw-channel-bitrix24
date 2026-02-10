# ACCEPTANCE — Bitrix24 Channel (B0)

## Goal
Ship `openclaw-channel-bitrix24` without breaking the current production path (`app.php + bridge`).

## Global release gates

A build can be promoted only if all gates are green:

1. **No-break gate**
   - Existing production path (`b24-openclaw` app + bridge) remains operational.
   - Emergency rollback path is tested and documented.

2. **Functional gate**
   - Inbound Bitrix message is accepted and routed to expected session scope.
   - Outbound Bitrix reply is delivered (`imbot.message.add` returns `result`).

3. **Stability gate**
   - No sustained increase in 4xx/5xx against baseline.
   - No sustained increase in fallback/error modes in diagnostics.

4. **Operability gate**
   - Installation and configuration steps are documented and reproducible.
   - Health-check and troubleshooting commands are documented.

## Acceptance by milestone

## v0.1.0 (Direct mode stable)

Required:
- Plugin loads and is discoverable via OpenClaw plugin system.
- Config schema validates for `mode=direct`.
- Inbound flow works for:
  - private chat (`bitrix:{domain}:{authorId}`)
  - group chat (`bitrix:{domain}:chat:{dialogId}`)
- Outbound flow works and returns Bitrix `result` id.
- Token lifecycle behavior is deterministic (no hidden/manual steps).
- Rollback to legacy path possible in <5 minutes.

## v0.2.0 (Channel mode stable)

Required:
- Config schema validates for `mode=channel`.
- Hub contract is implemented and versioned.
- Edge agent connectivity/heartbeat/reconnect is working.
- Canary tenant operates in `mode=channel` without production regression.
- Mode switch rollback (`channel -> direct`) works quickly and predictably.

## Stop conditions (hard fail)

Release is blocked if any of the following occurs:
- `Invalid signature` regression in inbound validation.
- Outbound delivery cannot be confirmed by Bitrix `result` consistently.
- No deterministic rollback path.
- Missing observability for failures (cannot localize fault domain).

## Verification evidence format

For each promoted block, keep evidence:
- commit hash
- test command(s)
- expected/actual result
- logs snippet with timestamp
- rollback check result
