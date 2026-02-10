# ROADMAP — Bitrix24 Channel (B0..B12)

## Block model (one-step execution)

- [x] **B0** Freeze baseline + acceptance/rollback gates
- [x] **B1** Plugin SDK-compliant skeleton
- [x] **B2** Config schema v1 + UI hints
- [x] **B3** Inbound adapter (direct)
- [x] **B4** Outbound adapter (direct)
- [ ] **B5** Token lifecycle hardening
- [ ] **B6** Compatibility mode + rollback switch
- [ ] **B7** Hub contract v1 freeze
- [ ] **B8** Hub-side implementation (`openclaw-bridge`)
- [ ] **B9** Edge Agent MVP (separate repo)
- [ ] **B10** Plugin channel-mode transport
- [ ] **B11** Deploy-kit turnkey profiles
- [ ] **B12** Canary rollout + stable release tags

## Release milestones

- `v0.1.0` → Direct mode stable
- `v0.2.0` → Channel mode stable

## Migration rule

No big-bang switch. Keep current `app.php + bridge` path intact and use canary + mode-switch rollback.
