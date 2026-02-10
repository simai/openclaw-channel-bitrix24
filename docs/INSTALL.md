# INSTALL — openclaw-channel-bitrix24 (Direct mode)

## Target

Install channel plugin on any server with OpenClaw and configure it for direct Bitrix24 flow.

## Prerequisites

- OpenClaw installed and running
- Access to plugin repository/package
- Reachable Bitrix24 app/webhook side
- Bridge endpoint available (`/v1/inbound`)

## Option A — Local link install (development)

```bash
openclaw plugins install -l /path/to/openclaw-channel-bitrix24
openclaw plugins enable bitrix24
```

## Option B — npm install (distribution)

```bash
openclaw plugins install @simai/openclaw-channel-bitrix24
openclaw plugins enable bitrix24
```

## Configure plugin (direct mode)

Set in OpenClaw config:

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

## Verify plugin load

```bash
openclaw plugins list
openclaw plugins info bitrix24
openclaw plugins doctor
```

Expected: plugin is discoverable and enabled without manifest/schema errors.

## Rollback quick path

If instability appears:
1. disable channel plugin for tenant path / switch mode to stable direct baseline
2. verify legacy app.php + bridge path with ping
3. keep plugin installed but inactive until fix
