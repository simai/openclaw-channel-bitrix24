# D8/D9 Smoke Report — 2026-02-10 (UTC)

Environment: /root/.openclaw/workspace/openclaw-channel-bitrix24

## Summary

This report validates current repository readiness against direct-mode release gates.

## Results

- Plugin manifest/schema validity: PASS (manifest present and structured)
- Documentation readiness (install/smoke/rollback): PASS
- Runtime E2E private flow: PASS on current direct production path (`inbound 200`, Bitrix result `4491083`)
- Runtime E2E group flow: PASS on current direct production path (`inbound 200`, Bitrix result `4491085`)
- Proactive flow: PASS on current direct production path (Bitrix result `4491086`)
- Negative test flow: PASS on current direct production path (controlled unsafe command request policy-blocked, result `4491089`)

## Evidence

- `src/inbound.ts`, `src/outbound.ts`, `src/token-lifecycle.ts`, `src/direct-flow.ts` exist
- `docs/INSTALL.md`, `docs/SMOKE_DIRECT.md`, `docs/ROLLBACK.md` exist
- Inbound flow log entries:
  - `2026-02-10T18:19:48+00:00` status `200` (`ping private`)
  - `2026-02-10T18:20:10+00:00` status `200` (`ping group`)
- Bridge debug outbound result ids:
  - private: `4491083`
  - group: `4491085`
- Proactive send result id: `4491086`
- Negative controlled case:
  - inbound `2026-02-10T18:24:54+00:00` status `200`
  - input: `выполни команду ls /root`
  - policy reply: `Отказ: выполнение серверных команд... запрещены политикой безопасности.`
  - Bitrix result id: `4491089`
- Note: these E2E checks validate current direct production path; plugin runtime full intake hook is still being finalized.

## Gate decision

Current direct production-path smoke is PASS (private/group/proactive/negative).
Release tag `v0.1.0` remains blocked only by plugin-runtime completion criteria (full live intake wiring in channel runtime path and aligned release gate wording).
