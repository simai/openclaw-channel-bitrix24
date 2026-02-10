# ROLLBACK — Bitrix24 Channel Migration Safety (B0)

## Principle
Migration must be **no-big-bang**. The existing production route remains the safety net:

- Current stable path: `b24-openclaw` (`app.php + bridge`)
- New path: `openclaw-channel-bitrix24` plugin

At any sign of instability, switch traffic back to stable path first, investigate second.

## Rollback targets

1. **Traffic rollback**
   - Disable new channel mode for affected tenant(s).
   - Route tenant back to legacy `direct` path (`app.php + bridge`).

2. **Config rollback**
   - Restore previous known-good config snapshot.
   - Verify endpoint/token integrity.

3. **Runtime rollback**
   - Revert plugin-related deploy to previous release tag if needed.

## Fast rollback checklist (< 5 min target)

1. Identify impacted tenant/domain.
2. Set tenant mode to stable route (`direct` / legacy path).
3. Confirm Bitrix endpoint remains valid (`/app.php`) and signature checks pass.
4. Send test message (`ping`) and confirm:
   - inbound `200 OK`
   - outbound Bitrix `result` id
5. Announce incident status and keep plugin mode disabled for that tenant.

## Incident logging requirements

Record after rollback:
- tenant/domain
- start/end UTC
- symptom (inbound/outbound/auth/routing)
- rollback action performed
- confirmation evidence (result ids / logs)
- next remediation step

## Do not do during incident

- Do not continue canary expansion while unresolved.
- Do not mix multiple unverified fixes at once.
- Do not remove rollback path from config.
