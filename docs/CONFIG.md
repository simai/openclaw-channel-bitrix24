# CONFIG — Bitrix24 channel plugin

## Where config lives

`plugins.entries.bitrix24.config`

## Modes

### 1) Direct mode

Use this mode for current rollout. It supports two direct-path options:
- bridge path (`direct.bridgeUrl`) for existing `app.php + bridge` production flow
- plugin webhook route (`direct.webhookPath`) for shadow/canary runtime intake

You can keep both configured during migration.

```json
{
  "plugins": {
    "entries": {
      "bitrix24": {
        "enabled": true,
        "config": {
          "mode": "direct",
          "direct": {
            "bridgeUrl": "http://127.0.0.1:8787/v1/inbound",
            "bridgeToken": "<optional-token>",
            "timeoutMs": 45000,
            "domain": "portal.simai.ru",
            "accessToken": "<bitrix-access-token>",
            "webhookPath": "/bitrix24/webhook"
          }
        }
      }
    }
  }
}
```

### 2) Channel mode (Hub/Edge, deferred)

```json
{
  "plugins": {
    "entries": {
      "bitrix24": {
        "enabled": true,
        "config": {
          "mode": "channel",
          "channel": {
            "hubUrl": "https://hub.example.com/v1/channel/inbound",
            "channelToken": "<token>",
            "tenantChannelId": "portal.simai.ru",
            "timeoutMs": 45000
          }
        }
      }
    }
  }
}
```

## Required fields

- `mode`
- for `mode=direct` → `direct` object is required
- for `mode=channel` → `channel.hubUrl`, `channel.tenantChannelId`

## Validation safety rules

1. Do not add fields that are not present in `openclaw.plugin.json` schema.
2. Validate JSON before restart.
3. Apply config in two steps for safer rollback:
   - `plugins.load.paths`
   - `plugins.entries.bitrix24`

## Notes

- `bridgeToken`, `channelToken`, `accessToken` are secrets.
- Keep initial timeout conservative (`45000`) and tune by diagnostics.
- Current migration policy: production primary remains `app.php + bridge`; plugin webhook route runs shadow/canary until stability gate is met.
