# INBOUND — Direct mode adapter (B3)

## Scope

B3 implements inbound normalization for Bitrix webhook events in direct mode.

Current supported event:
- `ONIMBOTMESSAGEADD`

## Input (Bitrix webhook payload)

Fields used:
- `event`
- `auth.domain`
- `data.PARAMS.MESSAGE`
- `data.PARAMS.CHAT_TYPE`
- `data.PARAMS.AUTHOR_ID` (fallback `FROM_USER_ID`)
- `data.PARAMS.DIALOG_ID`
- `data.PARAMS.MESSAGE_ID`

## Output (normalized)

```json
{
  "source": "bitrix24",
  "event": "ONIMBOTMESSAGEADD",
  "domain": "portal.simai.ru",
  "authorId": "486",
  "dialogId": "486",
  "chatType": "P",
  "text": "ping",
  "messageId": "4491044",
  "sessionKey": "bitrix:portal.simai.ru:486"
}
```

## Session key rules

- Private (`CHAT_TYPE=P`):
  - `bitrix:{domain}:{authorId}`
- Group (non-`P`):
  - `bitrix:{domain}:chat:{dialogId}`

## Failure modes

Normalizer returns explicit error if any required field is missing:
- missing domain
- missing author id
- missing dialog id
- missing message text
- unsupported event

## File

Implementation: `src/inbound.ts`
