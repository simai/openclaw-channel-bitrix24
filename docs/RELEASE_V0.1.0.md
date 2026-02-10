# Release candidate notes — v0.1.0 (direct mode)

Date: 2026-02-10

## Scope

Direct-mode only (`mode=direct`).

Included blocks:
- D0 acceptance/rollback gates
- D1 plugin sdk skeleton
- D2 config schema + ui hints
- D3 inbound normalizer
- D4 outbound helper
- D5 token lifecycle helpers
- D6 compatibility guard
- D7 direct flow wiring helper
- D8 install + smoke docs

## Release gate status

- Functional runtime gate: **PARTIAL** (direct outbound runtime hook is wired; full live inbound transport binding and full E2E proof still pending)
- Installability docs: MET
- Rollback docs: MET
- Contract/docs completeness: MET

## Decision

Do **not** tag stable `v0.1.0` yet.

Use `v0.1.0-rc1` after documenting smoke evidence and finishing missing runtime transport integration.
