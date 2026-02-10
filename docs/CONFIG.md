# CONFIG — Bitrix24 channel plugin (B2)

## Where config lives

`plugins.entries.bitrix24.config`

## Modes

### 1) Direct mode

```json
{
  "plugins": {
    "entries": {
      "bitrix24": {
        "enabled": true,
        "config": {
          "mode": "direct",
          "direct": {
            "bridgeUrl": "https://bridge.example.com/v1/inbound",
            "bridgeToken": "<token>",
            "timeoutMs": 45000
          }
        }
      }
    }
  }
}
```

### 2) Channel mode (Hub/Edge)

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
- for `mode=direct` → `direct.bridgeUrl`
- for `mode=channel` → `channel.hubUrl`, `channel.tenantChannelId`

## Notes

- `bridgeToken` / `channelToken` should be treated as secrets.
- Keep timeouts conservative initially (`45000`) and tune with diagnostics.
