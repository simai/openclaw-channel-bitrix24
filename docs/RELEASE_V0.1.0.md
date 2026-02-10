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

- Functional runtime gate: **PARTIAL** (direct outbound runtime hook is wired; inbound probe + live webhook route + internal handoff into channel reply pipeline are wired; plugin-route smoke evidence exists, but migration freeze keeps production primary on `app.php + bridge` until 24h no-drop shadow window + rollback drill)
- Installability docs: MET
- Rollback docs: MET
- Contract/docs completeness: MET

## Decision

Do **not** tag stable `v0.1.0` yet.

Release after migration-freeze gates are met:
1) 24h shadow stability (no inbound drops),
2) rollback drill confirmed,
3) controlled primary switch readiness sign-off.
