# SAFE_CONFIG_APPLY

Use this checklist for any live config change to avoid gateway lockout.

## 1) Backup

```bash
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak.$(date -u +%Y%m%d-%H%M%S)
```

## 2) Edit in two phases

1. Add/adjust `plugins.load.paths`
2. Add/adjust `plugins.entries.bitrix24`

## 3) Validate JSON

```bash
python3 -m json.tool ~/.openclaw/openclaw.json >/dev/null && echo OK_JSON
```

## 4) Restart gateway

```bash
openclaw gateway restart
```

## 5) Immediate health check

```bash
openclaw status
```

Expected:
- gateway running
- dashboard reachable
- Bitrix24 channel state = ON / OK

## 6) Fast rollback (<1 min)

```bash
cp ~/.openclaw/openclaw.json.bak.<TIMESTAMP> ~/.openclaw/openclaw.json
openclaw gateway restart
openclaw status
```
