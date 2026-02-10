# Bitrix24 Channel Plugin — SPEC v0 (draft)

## Objectives

- Make Bitrix24 a first-class OpenClaw channel plugin.
- Keep client UX simple (channel-like onboarding).
- Support both deployment topologies:
  - `direct`: Bitrix app -> bridge URL
  - `channel`: Bitrix app -> hub -> edge -> local OpenClaw

## Core entities

- `tenant`: Bitrix portal (domain)
- `dialog scope`:
  - private: `bitrix:{domain}:{authorId}`
  - group: `bitrix:{domain}:chat:{dialogId}`

## Mode selector

`mode = direct | channel`

### direct

Uses per-tenant `bridgeUrl + bridgeToken + timeoutMs`.

### channel

Uses `hubUrl + channelToken + tenantChannelId + timeoutMs`.
Hub routes request to active edge agent for the tenant.

## Inbound contract (target behavior)

```json
{
  "requestId": "uuid",
  "source": "bitrix24",
  "tenant": {
    "domain": "portal.simai.ru",
    "tenantChannelId": "optional"
  },
  "message": {
    "authorId": "486",
    "dialogId": "486",
    "chatType": "P",
    "text": "ping",
    "messageId": "4491044",
    "language": "ru"
  },
  "auth": {
    "applicationToken": "..."
  },
  "routing": {
    "profile": "default"
  }
}
```

## Reply contract (target behavior)

```json
{
  "requestId": "uuid",
  "ok": true,
  "reply": "pong",
  "sessionKey": "bitrix:portal.simai.ru:486",
  "meta": {
    "agentId": "bitrix-router",
    "expertId": "general"
  }
}
```

## Reliability baseline

- Idempotency: `requestId`
- Timeout + retry with backoff
- Health checks: Hub + Edge heartbeat
- Structured diagnostics for each hop

## Security baseline

- HMAC signing for service-to-service requests
- Scoped tokens by tenant/channel
- Least privilege between Hub and Edge

## Next steps

1. Replace scaffold channel with full plugin-sdk compliant implementation.
2. Implement transport adapters for `direct` and `channel`.
3. Follow frozen Hub contract v1: `docs/HUB_CONTRACT_V1.md`.
4. Add e2e smoke tests with Bitrix sandbox portal.
