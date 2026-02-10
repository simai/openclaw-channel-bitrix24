# SMOKE_DIRECT — E2E checklist (D8)

## Purpose

Provide reproducible end-to-end validation for direct mode.

## Test matrix

1. Private inbound -> outbound
2. Group inbound -> outbound
3. Proactive outbound (stored token path)
4. Error path visibility (invalid token/signature)

---

## 0) Precheck

- Plugin enabled and configured in `mode=direct`
- Bitrix app endpoint set correctly
- Bridge health is OK

Commands:

```bash
openclaw plugins info bitrix24
openclaw plugins doctor
```

---

## 1) Private flow

Action:
- Send `ping private` to bot in personal chat.

Expect:
- inbound accepted (HTTP 200)
- reply delivered
- session key pattern: `bitrix:{domain}:{authorId}`

Evidence to capture:
- timestamp
- inbound log line
- outbound result id

---

## 2) Group flow

Action:
- Send `ping group` in group chat where bot is present.

Expect:
- inbound accepted (HTTP 200)
- reply delivered
- session key pattern: `bitrix:{domain}:chat:{dialogId}`

Evidence:
- timestamp
- inbound log line
- outbound result id

---

## 3) Proactive flow

Action:
- Trigger proactive send to known user/dialog.

Expect:
- successful `imbot.message.add` result id
- no `invalid_token`

Evidence:
- API result id
- timestamp

---

## 4) Negative check

Action:
- simulate invalid token/signature scenario in controlled test.

Expect:
- deterministic error classification
- no crash / no silent failure

Evidence:
- error code
- log snippet

---

## Pass criteria

- All 4 sections pass.
- No critical regression on legacy direct baseline.
- Rollback path remains functional.

## Report template

```text
D8 Smoke Report
- Date/UTC:
- Environment:
- Private flow: PASS/FAIL
- Group flow: PASS/FAIL
- Proactive flow: PASS/FAIL
- Negative check: PASS/FAIL
- Result IDs:
- Notes:
```
