# HUB CONTRACT v1 (B7 freeze)

Status: **frozen for implementation**
Version: `bitrix24-channel-hub/v1`

## Purpose

Define stable service contract between:

1. Bitrix24 channel plugin (mode=`channel`) / app ingress side
2. Hub (`openclaw-bridge`)
3. Edge agent (client server)

This contract prioritizes:
- deterministic routing
- idempotency
- auth integrity
- no-break rollback behavior

---

## 1) Inbound request (Plugin/App -> Hub)

`POST /v1/channel/inbound`

### Headers

- `Content-Type: application/json`
- `X-Channel-Version: bitrix24-channel-hub/v1`
- `X-Request-Id: <uuid-v4>`
- `X-Channel-Signature: sha256=<hex(hmac_sha256(body, channelToken))>`
- `X-Timestamp: <unix-seconds>`

### Body

```json
{
  "requestId": "6d6f1f1a-2db6-4bdf-9d49-bf4ab1f51595",
  "source": "bitrix24",
  "tenant": {
    "domain": "portal.simai.ru",
    "tenantChannelId": "portal.simai.ru"
  },
  "message": {
    "event": "ONIMBOTMESSAGEADD",
    "authorId": "486",
    "dialogId": "486",
    "chatType": "P",
    "text": "ping",
    "messageId": "4491044",
    "language": "ru"
  },
  "routing": {
    "profile": "default"
  },
  "meta": {
    "receivedAt": 1770741557
  }
}
```

### Validation rules

- `requestId` required, UUID format.
- `tenant.domain` required.
- `message.text`, `message.dialogId`, `message.authorId` required.
- Signature required and must match.
- Reject clock skew > 300s (`X-Timestamp`).

---

## 2) Hub sync response (Hub -> Plugin/App)

### Success (200)

```json
{
  "ok": true,
  "requestId": "6d6f1f1a-2db6-4bdf-9d49-bf4ab1f51595",
  "reply": "pong",
  "sessionKey": "bitrix:portal.simai.ru:486",
  "meta": {
    "agentId": "bitrix-router",
    "expertId": "general",
    "mode": "channel"
  }
}
```

### Error (4xx/5xx)

```json
{
  "ok": false,
  "requestId": "6d6f1f1a-2db6-4bdf-9d49-bf4ab1f51595",
  "error": {
    "code": "EDGE_UNAVAILABLE",
    "message": "No active edge for tenant",
    "retryable": true
  }
}
```

---

## 3) Hub -> Edge task envelope

(transport-agnostic, for WS stream or equivalent)

```json
{
  "type": "task.inbound",
  "requestId": "6d6f1f1a-2db6-4bdf-9d49-bf4ab1f51595",
  "tenantChannelId": "portal.simai.ru",
  "payload": {
    "source": "bitrix24",
    "tenant": { "domain": "portal.simai.ru" },
    "message": {
      "authorId": "486",
      "dialogId": "486",
      "chatType": "P",
      "text": "ping"
    },
    "routing": { "profile": "default" }
  },
  "deadlineMs": 45000
}
```

## 4) Edge -> Hub result envelope

```json
{
  "type": "task.result",
  "requestId": "6d6f1f1a-2db6-4bdf-9d49-bf4ab1f51595",
  "ok": true,
  "reply": "pong",
  "sessionKey": "bitrix:portal.simai.ru:486",
  "meta": {
    "agentId": "bitrix-router",
    "expertId": "general"
  }
}
```

---

## 5) Idempotency

- Idempotency key: `requestId`.
- Hub must store request result for TTL (recommended: 5 minutes).
- Repeated request with same `requestId` returns cached response.

---

## 6) Retry policy

Plugin/App -> Hub:
- network/timeout: retry 2 times (exponential backoff: 250ms, 1000ms)
- no retry on 4xx auth/signature errors

Hub -> Edge:
- retry once on transient transport failure if deadline allows
- do not duplicate delivery beyond idempotency guard

---

## 7) Heartbeat contract (Edge -> Hub)

`type=heartbeat`

```json
{
  "type": "heartbeat",
  "edgeId": "edge-portal-simai-1",
  "tenantChannelIds": ["portal.simai.ru"],
  "ts": 1770742000,
  "status": "ready",
  "version": "v0.1.0"
}
```

Rules:
- interval: 15s
- stale threshold: 45s (3 missed heartbeats)
- stale edges are excluded from routing

---

## 8) Error codes (frozen)

- `INVALID_SIGNATURE`
- `INVALID_SCHEMA`
- `CLOCK_SKEW_EXCEEDED`
- `TENANT_NOT_MAPPED`
- `EDGE_UNAVAILABLE`
- `EDGE_TIMEOUT`
- `EDGE_TRANSPORT_ERROR`
- `UPSTREAM_OPENCLAW_ERROR`
- `INTERNAL_ERROR`

---

## 9) Compatibility + rollback rule

If Hub contract path fails for tenant:
1. set tenant mode back to `direct`
2. keep plugin enabled
3. confirm inbound 200 + outbound Bitrix result id on direct path

No big-bang switching allowed.
