# OUTBOUND — Direct mode adapter (B4)

## Scope

B4 implements outbound send helper for Bitrix direct mode.

## Method

Bitrix REST method used:
- `imbot.message.add`

Endpoint pattern:
- `https://{domain}/rest/imbot.message.add.json`

Payload:

```json
{
  "auth": "<access_token>",
  "DIALOG_ID": "486",
  "MESSAGE": "pong"
}
```

## Implementation

- File: `src/outbound.ts`
- Function: `sendBitrixImbotMessage(params)`

Checks:
- required fields (`domain`, `accessToken`, `dialogId`, `message`)
- HTTP status validation
- Bitrix API-level error validation (`error`, `error_description`)
- timeout with abort signal (default 45000ms)

## Return shape

```json
{
  "ok": true,
  "result": 4491045,
  "raw": { "result": 4491045, "time": { "...": "..." } }
}
```

## Notes

- This block provides send transport helper.
- Wiring into channel runtime send flow is finalized in next integration blocks.
