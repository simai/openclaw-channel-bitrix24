# RUNTIME_HOOK_DIRECT — D9.1

## What was wired

The channel plugin now has a live outbound runtime hook in direct mode:

- `src/channel.ts` now exposes `outbound.sendText`.
- It resolves plugin config from `plugins.entries.bitrix24.config`.
- It parses outbound target (`domain:dialogId`, `bitrix:domain:dialogId`, or `dialogId` with `direct.domain`).
- It sends message via `sendBitrixImbotMessage` (Bitrix REST `imbot.message.add`).

## Required direct config for outbound runtime

- `direct.accessToken` (required)
- `direct.domain` (optional but recommended fallback)

## Notes

- This closes the main runtime-hook blocker noted in D9 assessment.
- Full live inbound transport binding remains in-progress for complete end-to-end channel operation.
