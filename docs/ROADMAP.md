# ROADMAP — Bitrix24 Channel

## Current execution scope (approved)

**Direct-only track** for ближайший релиз (`v0.1.0`).

Hub/Edge work is intentionally deferred to avoid unnecessary complexity until direct mode is production-stable.

## Direct track (one-step execution)

- [x] **D0** Freeze baseline + acceptance/rollback gates
- [x] **D1** Plugin SDK-compliant skeleton
- [x] **D2** Config schema v1 + UI hints
- [x] **D3** Inbound adapter (direct)
- [x] **D4** Outbound adapter (direct)
- [x] **D5** Token lifecycle hardening
- [x] **D6** Compatibility mode + rollback switch
- [ ] **D7** Runtime wiring of inbound/outbound/token flow into channel execution path
- [ ] **D8** E2E direct smoke pack + install docs for any OpenClaw server
- [ ] **D9** Canary tenant + `v0.1.0` stable tag

## Deferred (not in current scope)

- [ ] **C1** Hub contract / transport refinement
- [ ] **C2** Hub implementation (`openclaw-bridge`) rollout
- [ ] **C3** Edge agent rollout
- [ ] **C4** Channel mode release (`v0.2.0`)

## Migration rule

No big-bang switch. Keep current `app.php + bridge` path intact and use rollback-first operations.
